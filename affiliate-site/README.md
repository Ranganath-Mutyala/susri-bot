# ClearCompare: Affiliate Comparison Publication + Admin Panel

A Next.js (App Router) + TypeScript + Tailwind + Prisma (SQLite) site for running a multi-niche affiliate comparison publication. It also serves the landing pages for Google Ads traffic. Everything is managed from a password-protected `/admin` panel: offer landing pages, articles, tracking pixels, compliance pages and leads.

Niches: **AI & B2B SaaS** (`/ai-saas`), **Consumer Finance** (`/finance`), **Home & Insurance** (`/home-insurance`).

---

## Quick start (local)

Requires **Node.js 18.18+** (20 or 22 recommended).

```bash
cd affiliate-site
npm install
cp .env.example .env          # then edit the values (see below)
npx prisma migrate deploy     # creates prisma/dev.db
npx prisma db seed            # loads the starter content
npm run dev                   # http://localhost:3000
```

The admin panel is at **http://localhost:3000/admin**. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

## Environment variables (`.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | `file:./dev.db` for SQLite (the path is relative to `prisma/`). |
| `ADMIN_EMAIL` | Admin login email. |
| `ADMIN_PASSWORD` | Admin login password. Use a long, unique one. |
| `AUTH_SECRET` | Signs the admin session cookie (JWT). Generate with `openssl rand -base64 32`. Changing it logs everyone out. |
| `NEXT_PUBLIC_SITE_URL` | Your public URL, e.g. `https://www.yourdomain.com`. Used for the sitemap and canonical URLs. |

## Production (VPS)

```bash
npm ci
npx prisma migrate deploy
npx prisma db seed            # first deploy only (safe to re-run; it never overwrites your edits)
npm run build
npm start                     # port 3000; use PORT=8080 npm start to change it
```

Run it behind Nginx or Caddy with HTTPS, and keep it alive with `pm2 start npm --name site -- start` or a systemd unit. **Back up `prisma/prod.db`** (or whichever file `DATABASE_URL` points to). It holds all your content and leads.

> Serverless hosts such as Vercel have no persistent disk, so SQLite won't keep data there. Use PostgreSQL on those hosts (see below).

### Switching to PostgreSQL

1. In `prisma/schema.prisma`, set `provider = "postgresql"`.
2. Set `DATABASE_URL="postgresql://user:pass@host:5432/db"`.
3. Delete `prisma/migrations/`, then run `npx prisma migrate dev --name init` and `npx prisma db seed`.

List-type fields are stored as JSON strings, so no code changes are needed.

## Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server. |
| `npm run build` / `npm start` | Builds for production and serves the build. |
| `npm run db:seed` | Seeds missing content. Re-running is safe. |
| `SEED_FORCE=1 npm run db:seed` | Overwrites the seeded records with the original starter content. |
| `npm run db:reset` | **Wipes the database** and re-seeds it. |
| `npm run typecheck` | Runs the TypeScript checks. |

---

## Admin panel

| Section | What you can do |
| --- | --- |
| **Dashboard** | See counts and the latest leads. Includes **30-second offer swap**: change any page's live BeMob CTA URL in one field, with no redeploy. |
| **Landing Pages** | Create, edit, duplicate, publish/unpublish, preview drafts and delete. The editor tabs are: Basics & SEO · Tracking & Offer · Hero · Comparison (add, remove and reorder rows and columns) · Body & Pros/Cons (Markdown with live preview and a 600–900 word counter) · Modules (comparison table, sticky mobile CTA, email capture). |
| **Articles** | Full CRUD with the Markdown editor, SEO fields, author bio and draft/publish. |
| **Leads** | Emails from landing page capture boxes, with source page and time. Filter by page, **export to CSV**, or delete a lead (e.g. for GDPR erasure requests). |
| **Messages** | Submissions from the `/contact` form. |
| **Settings & Compliance** | Site name, logo, footer, contact details, **global fallback BeMob pixel**, site-wide head scripts (e.g. GA4 / Google Ads tag), and editors for About, Contact, Privacy Policy and Affiliate Disclosure. |

Draft landing pages can be previewed at `/offers/<slug>` while you're logged in. Nobody else can see them.

## How tracking works (Google Ads-safe)

- **Single-hop CTAs.** Every CTA is a plain `<a href="{BeMob CTA URL}" rel="nofollow sponsored">`. There is no JavaScript redirect and no intermediate `/go/` hop.
- **Parameter passthrough.** This is on by default and can be turned off per page. If a visitor arrives with `gclid`, `gbraid`, `wbraid`, `keyword`, `creative`, `matchtype`, `network`, `device`, `placement`, `campaignid`, `adgroupid`, `targetid` or any `utm_*` parameter, the server appends those to the CTA URL before the page is sent. Other parameters are ignored.
- **LP pixel.** Paste BeMob's Landing Page pixel snippet into the page's "Tracking & Offer" tab. It's injected into `<head>` (or the end of `<body>`), and any `<script>` tags in it actually run. If a page has no pixel, the global pixel from Settings is used.
- Comparison table rows use the page's BeMob URL unless you set a per-row override.

## Compliance features built in

- An advertiser disclosure banner on every landing page and article, and disclosure links in every footer.
- The About / editorial standards, Contact (working form plus business details), Privacy & Cookie Policy (GDPR/CCPA) and Affiliate Disclosure pages. These are seeded and editable.
- A cookie consent banner ("Essential only" / "Accept all").
- `robots.txt` blocks `/admin` and `/api`, and `sitemap.xml` is generated automatically.
- The admin is protected by an HTTP-only signed cookie, middleware and server-side checks on every action. Login is rate-limited.
- Public forms are rate-limited and have a honeypot. CSV export is protected against formula injection.

## ⚠️ Before you send paid traffic

The seed content is a **starting point, not ready-to-run copy**:

1. **Replace the sample offers.** "NoteLoop AI", "ScoreShield", "QuoteNest" and the comparison alternatives are placeholder brands. Their CTA URLs point to `example.bemobtrk.com`. Put in your real offers, real BeMob URLs and claims you have checked with the advertiser. Publishing reviews of products that don't exist, or unverified claims, can get your Google Ads account suspended for misrepresentation.
2. **Fill in the `[Your Company Name]` / `[registered address]` placeholders** in Settings and in the compliance pages. Have a lawyer review the Privacy Policy and Disclosure for your jurisdiction.
3. **Finance and insurance** are restricted categories in Google Ads. You may need advertiser verification and certification in some countries. Check the current Google Ads policies for your target GEOs.
4. If you add analytics or ad tags in "Site-wide head scripts", make sure they respect cookie consent where the law requires it (e.g. Google Consent Mode).

## Project structure

```
affiliate-site/
├── prisma/
│   ├── schema.prisma          # Setting, Page, LandingPage, Article, Lead, ContactMessage
│   ├── migrations/            # initial SQLite migration
│   ├── seed.ts                # idempotent seed script
│   └── content/               # starter compliance pages, landing pages, articles
├── src/
│   ├── middleware.ts          # protects /admin and /api/admin
│   ├── lib/                   # db, auth (JWT), markdown + TOC, tracking passthrough, settings
│   ├── components/            # public UI (comparison table, pros/cons, email capture, pixel injector…)
│   │   └── admin/             # admin UI (landing page builder, comparison builder, editors)
│   └── app/
│       ├── (site)/            # homepage, category hubs, articles, compliance pages
│       ├── offers/[slug]/     # distraction-free landing pages
│       ├── admin/             # login + panel (dashboard, landing pages, articles, leads, messages, settings)
│       └── api/               # leads, contact, auth, CSV export
└── .env.example
```
