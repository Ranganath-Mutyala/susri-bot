# Go Live on Cloudflare (Domain + Hosting + Database in One Place)

**No server to manage.** Cloudflare hosts the site (Workers), stores the data (D1, a SQLite-based database) and handles the domain and SSL. Every time code is pushed to GitHub, the site rebuilds and redeploys automatically.

| Item | Cost |
| --- | --- |
| Domain (e.g. smartpickguide.com) on Cloudflare Registrar | ~$10–11 / year |
| Workers Paid plan (recommended) | $5 / month (~₹430). Includes D1 database usage far beyond what this site needs. |

> **Why the $5 plan?** The site's code (~2 MB compressed) fits within the free plan's size limit, but the free plan allows only ~10 ms of processing per page view. Pages built from the database can exceed that and show errors to paying ad visitors. The $5 plan removes that risk. If you want, you can start on Free and upgrade the moment you see a "Worker exceeded CPU" error (error 1102).

Total time: about 45 minutes.

---

## Step 1: Buy the domain (10 min)

1. Log in at **dash.cloudflare.com**.
2. Go to **Domain Registration → Register Domains**, search for `smartpickguide.com` and buy it. Turn on **auto-renew**.
3. Wait until the domain appears under **Account Home** as **Active** (usually a few minutes).

## Step 2: Turn on Workers Paid (2 min, recommended)

Go to **Workers & Pages → Plans** (or **Compute (Workers) → Plans**) and choose **Workers Paid ($5/month)**.

## Step 3: Create the database (3 min)

1. Go to **Storage & Databases → D1 SQL Database → Create**.
2. Name: **`smartpick-db`** (exactly this). Location: **Eastern North America** (closest to US ad traffic).
3. Open the new database and copy its **Database ID**. It looks like `a1b2c3d4-....`.

## Step 4: Put the Database ID into the code (2 min)

On GitHub, open the repo → switch to branch **`ccr-3b76b847-9rt2ur`** → open `affiliate-site/wrangler.jsonc` → click ✏️ **Edit**:

```jsonc
"database_id": "REPLACE_WITH_YOUR_D1_DATABASE_ID",
```
Replace the placeholder with your ID, then click **Commit changes**.
(Or just send the ID to Claude to commit for you. It's not a secret.)

## Step 5: Connect GitHub and deploy (10 min)

1. Go to **Workers & Pages → Create → Import a repository** (Workers tab). Connect your GitHub account and choose the **susri-bot** repo.
2. Fill in the settings exactly:

| Setting | Value |
| --- | --- |
| Project name | `smartpick-site` |
| Production branch | `ccr-3b76b847-9rt2ur` |
| Root directory (under Advanced / Build settings) | `affiliate-site` |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npm run deploy:cloudflare` |
| Build variable | `NEXT_PUBLIC_SITE_URL` = `https://smartpickguide.com` |

3. Click **Create and deploy**. The first build takes 3–5 minutes. The deploy command automatically:
   - creates the database tables,
   - loads the starter content (it never overwrites your own edits on later deploys),
   - publishes the site.

## Step 6: Add your admin login (5 min)

Open **Workers & Pages → smartpick-site → Settings → Variables and Secrets → Add**. Choose type **Secret** for each:

| Name | Value |
| --- | --- |
| `ADMIN_EMAIL` | your email |
| `ADMIN_PASSWORD` | a long password (12+ characters) |
| `AUTH_SECRET` | a random string of 32+ characters. A password manager can generate one, or run `openssl rand -base64 32`. |
| `NEXT_PUBLIC_SITE_URL` | `https://smartpickguide.com` |

Click **Deploy** (or **Save and deploy**) so the site picks them up.

## Step 7: Connect your domain (5 min)

1. In **smartpick-site → Settings → Domains & Routes → Add → Custom domain**, enter `smartpickguide.com` and click **Add**.
2. Repeat for `www.smartpickguide.com`.

Cloudflare creates the DNS records and SSL certificate automatically, usually within a few minutes.

Open **https://smartpickguide.com**. 🎉 The admin panel is at **https://smartpickguide.com/admin**.

## Step 8: First things in the admin panel (10 min)

1. **Landing Pages:** **unpublish the 3 sample offers.** They're fictional brands; replace them with your MyLead offers.
2. **Settings:** set the Site name to "SmartPick Guide" and add your contact email. Replace `[Your Company Name]` / `[address]` in the four compliance pages.
3. In Cloudflare, go to **your domain → Speed → Optimization** and make sure **Rocket Loader is off**. It can interfere with tracking pixels.
4. Optional: **your domain → Email → Email Routing** forwards `hello@smartpickguide.com` to your Gmail for free.

---

## Day-to-day

- **Offers, articles and settings** change instantly from `/admin`. No deploy needed.
- **Code updates** deploy automatically when the production branch on GitHub changes.
- **Logs:** smartpick-site → **Observability / Logs**.
- **Database:** Storage & Databases → D1 → smartpick-db → **Console** (run SQL) or **Time Travel** (restore the database to any point in the last 30 days, a built-in backup).
- **Leads:** export from `/admin/leads` → **Export CSV** regularly as your own copy.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Deploy fails at "d1 migrations apply" with an authentication/permission error | Run it once from your laptop (needs Node.js): `cd affiliate-site && npx wrangler login && npm run cf:db:migrate && npm run cf:db:seed`, then **Retry deployment** in Cloudflare. |
| Deploy fails with "database_id" / "Couldn't find a D1 DB" | Step 4 wasn't saved on the production branch, or the database name isn't exactly `smartpick-db`. |
| Can't log in to `/admin` | Check the Step 6 secrets, then redeploy. |
| Error 1102 "Worker exceeded resource limits" | You're on the Free plan. Switch to Workers Paid (Step 2). |
| Site shows the sample content after you edited it | It doesn't: the seed only inserts missing rows. If something looks off, check you're on the right domain. |

## Running locally (optional, for developers)

```bash
cd affiliate-site
npm install
cp .dev.vars.example .dev.vars          # edit the values
npm run cf:db:migrate:local && npm run cf:db:seed:local
npm run cf:preview                      # http://localhost:8787, real Cloudflare runtime
```

If you change the starter content in `prisma/content/`, regenerate the D1 seed with `npm run seed:sql` (needs the `sqlite3` CLI).
