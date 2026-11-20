# Going Live: Domain, Cloudflare & VPS Hosting

This guide takes you from nothing to a live HTTPS site in about an hour. You only do this once. After that, updates take one command.

## The setup (and why)

```
Visitor ──► Cloudflare (domain, DNS, free SSL, CDN, DDoS protection)
               │  encrypted (Full strict)
               ▼
           Your VPS: Nginx ──► Next.js app (PM2) ──► SQLite file + daily backups
```

- **Cloudflare** registers the domain at cost, runs DNS and handles SSL and security. The free plan is enough.
- **The VPS** runs the app and keeps the SQLite database on its disk.

> **Why not host the app itself on Cloudflare Pages/Workers?** Workers have no permanent disk, so a SQLite *file* can't live there. You'd have to rewrite the data layer for Cloudflare D1. A VPS keeps things simple and cheap, and Cloudflare still gives you its speed and security in front.

## What it costs (approximate; check current prices)

| Item | Recommended | Rough cost |
| --- | --- | --- |
| Domain (.com) | Cloudflare Registrar | ~$10–11 / year (at cost, no markup on renewal) |
| DNS, SSL, CDN, email forwarding | Cloudflare Free plan | $0 |
| VPS, 2 GB RAM | Hetzner, DigitalOcean, Vultr or AWS Lightsail | ~$5–12 / month |

**Choosing a VPS.** Pick **2 GB RAM, Ubuntu 24.04**, in a **US East** region if your ad traffic is mainly US/UK/CA. Any of these work the same way with this guide:

- **Hetzner Cloud.** Cheapest for the specs (US locations: Ashburn, Hillsboro). It may ask for ID verification at signup.
- **DigitalOcean.** The most beginner-friendly dashboard and docs.
- **Vultr / AWS Lightsail.** Also fine. Lightsail suits you if you want to stay in a big-cloud ecosystem.
- **Azure.** You know Azure already, so a B-series Ubuntu VM works too. It usually costs more for the same specs; use it if you have credits.

---

## Step 1: Buy the domain on Cloudflare

1. Create a free account at **dash.cloudflare.com**.
2. Go to **Domain Registration → Register Domains**, search for your name and buy it. Turn on auto-renew.
   - Cloudflare Registrar supports most common domain endings (.com, .net, .org, .co and others). Check that yours is listed.
   - If you already own a domain elsewhere, use **Add a site** instead and change the nameservers at your current registrar to the two Cloudflare gives you.

## Step 2: Create the VPS

1. Create a server: **Ubuntu 24.04, 2 GB RAM**, US East region.
2. Add your **SSH key** during creation. It's safer than a password.
3. Write down the server's **public IPv4 address**.

## Step 3: Point the domain at the server (Cloudflare DNS)

In Cloudflare → your domain → **DNS → Records**, add:

| Type | Name | Content | Proxy |
| --- | --- | --- | --- |
| A | `@` | your server IP | **Proxied** (orange cloud) |
| CNAME | `www` | `yourdomain.com` | **Proxied** (orange cloud) |

## Step 4: Cloudflare SSL settings

1. **SSL/TLS → Overview:** set the mode to **Full (strict)**.
2. **SSL/TLS → Edge Certificates:** turn **Always Use HTTPS** on and set **Minimum TLS** to 1.2.
3. **SSL/TLS → Origin Server → Create Certificate.** Keep the defaults (RSA; hostnames `yourdomain.com`, `*.yourdomain.com`; 15 years). **Leave this page open.** You'll paste both boxes onto the server in Step 7.

## Step 5: Prepare the server (one command)

SSH in and run:

```bash
ssh root@YOUR_SERVER_IP
apt-get update && apt-get install -y git
git clone https://github.com/<you>/<repo>.git /tmp/site
bash /tmp/site/affiliate-site/deploy/setup-server.sh
```

This installs Node.js 22, PM2, Nginx and SQLite. It also sets up the firewall (SSH, HTTP and HTTPS only), adds swap, creates an `app` user, creates the data and backup folders, makes PM2 start on reboot, and schedules a **daily 03:15 database backup**.

> **Private GitHub repo?** Create a read-only **deploy key**. On the server, run `sudo -u app ssh-keygen -t ed25519` and add `/home/app/.ssh/id_ed25519.pub` under GitHub repo → Settings → Deploy keys. Then clone with the `git@github.com:...` URL in Step 6.

## Step 6: Install the site

```bash
sudo -u app git clone https://github.com/<you>/<repo>.git /var/www/clearcompare
cd /var/www/clearcompare/affiliate-site
sudo -u app cp .env.production.example .env
sudo -u app nano .env
```

Fill in `.env`:

```bash
DATABASE_URL="file:/var/lib/clearcompare/prod.db"   # keep this path
ADMIN_EMAIL="you@yourdomain.com"
ADMIN_PASSWORD="a-long-unique-password"             # 12+ chars; avoid $ and ` characters
AUTH_SECRET="paste output of: openssl rand -base64 32"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

Then deploy:

```bash
sudo -u app bash /var/www/clearcompare/affiliate-site/deploy/deploy.sh
```

It checks your `.env`, installs packages, creates the database, loads the starter content, builds, starts the app and runs a health check. You should see **"Deploy complete — site is healthy."**

## Step 7: Connect Nginx with the Cloudflare certificate

```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/origin.pem   # paste "Origin Certificate" from Step 4
sudo nano /etc/ssl/cloudflare/origin.key   # paste "Private Key" from Step 4
sudo bash /var/www/clearcompare/affiliate-site/deploy/install-nginx.sh yourdomain.com
```

Open **https://yourdomain.com**. Your site is live. Sign in at **https://yourdomain.com/admin**.

## Step 8: Recommended Cloudflare settings

| Where | Setting | Why |
| --- | --- | --- |
| Speed → Optimization | **Rocket Loader: Off** | It rewrites how scripts load and can break or delay the BeMob pixel. |
| Caching → Cache Rules | Add a rule: URI path starts with `/admin` **or** `/api` → **Bypass cache** | Admin pages and forms are never cached. |
| Security → Bots | Leave **Bot Fight Mode off** at first | It can challenge legitimate crawlers. If you turn it on later, test that your landing pages still load for Google's ad checks. |
| Email → Email Routing | Forward `hello@yourdomain.com` to your Gmail | Free. Gives you a professional contact address for the Contact page and Settings. |

Cloudflare doesn't cache HTML pages by default, so offer swaps from the admin panel show up instantly.

---

## Day-to-day operations

| Task | Command (on the server) |
| --- | --- |
| Deploy the latest code | `sudo -u app bash /var/www/clearcompare/affiliate-site/deploy/deploy.sh` |
| View app logs | `sudo -u app pm2 logs clearcompare` |
| Restart the app | `sudo -u app pm2 restart clearcompare` |
| Back up right now | `sudo -u app bash /var/www/clearcompare/affiliate-site/deploy/backup.sh manual` |
| List backups | `ls -lh /var/backups/clearcompare/` |
| Restore a backup | `sudo -u app bash /var/www/clearcompare/affiliate-site/deploy/restore.sh /var/backups/clearcompare/<file>.db.gz` |
| Health check | `curl https://yourdomain.com/api/health` |

**Notes**

- Every deploy takes a `pre-deploy` backup first. Backups are checked for integrity and kept for 14 days.
- **Copy backups off the server** now and then (e.g. download them to your laptop or Google Drive). A VPS failure would take the on-server backups with it. Many VPS providers also sell automatic snapshots for about 20% of the server price, which is worth it.
- Content changes (offers, articles, settings) happen in `/admin` and need **no deploy**. You only deploy when the *code* changes.
- During a code deploy the site may respond slowly for the minute the build runs. Deploy at quiet hours.
- Free uptime monitoring: point UptimeRobot (or similar) at `https://yourdomain.com/api/health`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Cloudflare **Error 521/522** | The app or Nginx is down. Run `sudo -u app pm2 ls` and `sudo nginx -t`, then `sudo systemctl status nginx`. |
| Cloudflare **Error 526** | The SSL mode is Full (strict) but the origin certificate is missing or wrong. Redo Step 7. |
| Redirect loop | The Cloudflare SSL mode is set to "Flexible". Change it to **Full (strict)**. |
| Deploy says `.env` errors | Fix the values it lists, then rerun `deploy.sh`. |
| Build killed / out of memory | Use a 2 GB server. The setup script adds swap, but 1 GB is tight. |
| Can't log in to /admin | Check `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`, then run `sudo -u app pm2 restart clearcompare --update-env`. |
