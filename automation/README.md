# WiseCompare Operations: Step-by-Step Setup (Loop 1 + Loop 2)

This guide connects **Google Ads → wisecompareguide.com landing page → BeMob → MyLead**, plus the automation that protects your money. It follows Step 5 of your SOP.

```
LOOP 1 (live traffic, 24/7, no code to run)
Google Ads ad click
   │  Final URL = https://wisecompareguide.com/offers/<slug>?keyword=..&gclid=..
   ▼
WiseCompare landing page ── BeMob LP pixel records the visit (+ gclid)
   │  CTA button = BeMob CTA URL (site appends gclid/keyword automatically)
   ▼
BeMob click ──► MyLead offer (BeMob adds ml_sub1={clickId})
                    │
                    └── S2S postback (pending / approved / rejected) ──► BeMob

LOOP 2 (this folder, Python + Claude Code, hourly/daily)
Google Ads API + BeMob CSV export ──► python -m ops ... ──► pause losers, block junk terms,
                                                         upload Accepted GCLIDs, profit report
```

**Already built into the website:** single-hop CTA links, BeMob pixel injection per page, and automatic forwarding of `gclid`, `keyword`, `creative`, `matchtype`, `campaignid`, `adgroupid` and `utm_*` to the CTA URL. There's also a 30-second offer swap on the admin dashboard.

---

## Phase 0: Money safety first (read this before anything else)

- $10/day is roughly **₹850/day, or about ₹25,000/month per offer**. Three offers is about ₹75,000/month, which is close to your whole EMI amount.
- **Start with ONE offer only** (AI SaaS, as your plan says). Add the second only after 2 to 3 weeks of clean tracking data.
- Decide your **maximum total loss for the experiment** before you start (for example ₹12,000 ≈ $150). Put it in `config.yaml → guardrails.monthly_loss_limit_usd`. When you hit it, you stop and review. No exceptions.
- This automation can **pause** things and **block** keywords. It can **never** raise a budget. Budget increases are always your manual decision, max +20–30%, and only for an offer that is already profitable after 7 days.

---

## Phase A: Loop 1 (dashboards only, about 2 hours)

### A1. MyLead: choose the offer
1. Log in at mylead.global, open your approved account, and choose **one** AI/SaaS offer for US/UK/CA/AU.
2. Open the offer's **Terms**: confirm **Search / SEM traffic is allowed** and check **brand bidding is NOT allowed** (never bid on the brand name). Note the payout, the daily cap and whether it's SOI or DOI.
3. Copy your offer tracking link.

### A2. BeMob: tracker setup
1. **Traffic sources → New from template → Google Ads.** Check that the parameter that is the **External ID** is `gclid`. Also add `keyword`, `matchtype`, `creative`, `campaignid` and `adgroupid` as custom parameters. Leave the traffic source's postback URL **empty**, as your plan says.
2. **Affiliate networks → New from template → MyLead.** BeMob shows you a **postback URL**. Copy it. It looks like:
   `https://<your-subdomain>.bemobtrk.com/postback?cid=[ml_sub1]&payout=[payout_decimal]&txid=[transaction_id]&status=[status]`
   Use the exact URL BeMob gives you, not this example.
3. **Offers → New.** Paste the MyLead offer link and pick MyLead as the network. Check that the offer URL ends with `ml_sub1={clickId}`; add it yourself if it doesn't. Set payout to "Auto" (from postback). Set the daily cap and a backup offer if you have one.
4. **Landing pages → New.** URL = `https://wisecompareguide.com/offers/<slug>`.
5. **Campaigns → New.** Traffic source = Google Ads; destination = Path → your landing page → your offer. Use the **Direct tracking** (pixel) method. Then copy two things:
   - the **Landing Page pixel snippet**
   - the **CTA / Click URL**
6. In BeMob settings, set your **timezone**. Use the same one in `config.yaml → bemob_csv.timezone`.

### A3. MyLead: postback
1. MyLead → **Postback** settings → paste the BeMob postback URL from A2.2 → status trigger **"Any"**, so pending, approved and rejected statuses all reach BeMob.
2. Use MyLead's **"Test postback"** button. You should see a test conversion in BeMob → Conversions within a minute.

### A4. WiseCompare admin panel
1. Go to https://wisecompareguide.com/admin → **Landing Pages** → your offer page → **Tracking & Offer** tab.
2. Paste the **CTA URL** and the **LP pixel snippet**. Keep **"Forward ad parameters"** ON. Set the **payout**.
3. Replace all placeholder brand names and claims with real, checked facts about this offer. Then **Publish**.

### A5. Google Ads: campaign
1. Create a **Search** campaign (no Display, no Search Partners) for your target GEO. Set the **daily budget to $10 or less**, with **manual CPC** or Maximise Clicks with a CPC limit. Get your max CPC from:
   ```bash
   python -m ops breakeven --epc 1.20
   ```
   Replace `1.20` with the offer's EPC, which you can find in MyLead.
2. Use long-tail **exact / phrase** keywords only (for example "best ai meeting notes app for small business").
3. **Final URL:** `https://wisecompareguide.com/offers/<slug>`
4. **Final URL suffix** (campaign → Settings → Campaign URL options):
   `keyword={keyword}&matchtype={matchtype}&creative={creative}&campaignid={campaignid}&adgroupid={adgroupid}`
5. **Tracking template: leave blank.** Keep **auto-tagging ON** (Account settings). Auto-tagging adds `gclid` to the URL automatically. Don't add `gclid={gclid}` yourself, because the parameter would then appear twice.
6. **Conversion action for Loop 2:** Goals → Conversions → New → **Import → "Other data sources or CRMs" → Track conversions from clicks**. Name it `MyLead Accepted Lead`, Count = **One**, Value = use different values. You'll copy its ID in B4.

### A6. End-to-end test (don't skip this)
1. Open `https://wisecompareguide.com/offers/<slug>?gclid=TEST123&keyword=test`.
2. Right-click the CTA → Copy link. It must contain `gclid=TEST123&keyword=test`.
3. Click it. You should land on the MyLead offer. In BeMob → Campaign report you should see **1 visit + 1 click**, and the gclid should be in the External ID column.
4. Fire MyLead's test postback and check that the **status** shows in BeMob → Conversions.

✅ Loop 1 works. You may now start the campaign at $10/day.

---

## Phase B: Loop 2 (APIs + automation)

### B1. Google Ads API access (you'll wait several days for approval, so start early)
1. Create a free **Google Ads Manager Account (MCC)** and link your ad account to it.
2. In the MCC go to **Admin → API Center**. Accept the terms and copy the **developer token**. Apply for **Basic access** using your website and a short description: "internal reporting and bid/keyword management for my own account". Until Basic access is approved, the token may only work on test accounts or with low limits.

### B2. OAuth credentials
1. https://console.cloud.google.com → New project → **APIs & Services → Enable "Google Ads API"**.
2. OAuth consent screen (External, add yourself as a test user) → **Credentials → Create OAuth client ID → Desktop app**. Download the JSON file.
3. Get a refresh token by running the official helper `generate_user_credentials.py` from the `google-ads-python` examples (`examples/authentication/`), using that JSON.
4. Create `automation/google-ads.yaml`. It's git-ignored; never commit it and never paste it into chat:
   ```yaml
   developer_token: YOUR_DEV_TOKEN
   client_id: YOUR_CLIENT_ID.apps.googleusercontent.com
   client_secret: YOUR_CLIENT_SECRET
   refresh_token: YOUR_REFRESH_TOKEN
   login_customer_id: "MCC_ID_DIGITS_ONLY"
   use_proto_plus: True
   ```

### B3. Install (once)
```bash
cd automation
```
```bash
python3 -m venv .venv && source .venv/bin/activate
```
```bash
pip install -r requirements.txt
```
```bash
cp config.example.yaml config.yaml
```
Edit `config.yaml` and fill in your customer ID, campaign ID, BeMob campaign name, payout and caps. **If your Google Ads account currency is INR**, set `account_currency_to_usd` (for example `0.0119`).

### B4. Verify
```bash
python -m ops check
```
It prints your account, campaigns and offline conversion actions, and warns if a budget is above your cap or the currency setting is wrong. Copy the conversion action ID into `config.yaml`.

### B5. Daily routine (about 10 minutes)
1. BeMob → **Conversions** → choose the last 30 days → **Export CSV** → save to `automation/data/` (git-ignored).
2. In Claude Code, run:
   ```
   /daily-review automation/data/<file>.csv
   ```
   Claude runs every check as a **dry run**, explains the results in plain words, and asks before applying anything. You can also run the commands yourself:

| Command | What it does | Plan workflow |
| --- | --- | --- |
| `python -m ops csvcheck FILE` | Shows how the BeMob export is read | – |
| `python -m ops profit --bemob-csv FILE --days 7` | Google spend vs MyLead **Accepted** payouts, per offer | #2 True net profit |
| `python -m ops negatives [--apply]` | Blocks searches with free/jobs/login/crack/reddit… and lists costly 0-conversion terms for you to review | #1 Negative mining |
| `python -m ops upload --bemob-csv FILE [--apply]` | Uploads Accepted leads' GCLIDs to Google Ads | #3 Offline GCLID upload |
| `python -m ops stoploss [--bemob-csv FILE] [--apply]` | Daily $ cap pause, keyword at 2× payout with 0 conversions → pause, rejection >30% alert, monthly loss alert | #4 Hard stop-loss |
| `python -m ops resume --campaign ID` | Re-enables a paused campaign. Never changes the budget | – |

Without `--apply`, nothing changes in your account.

### B6. Hourly automation (after one week of clean manual runs)
1. Create a Telegram bot with **@BotFather** and copy the token. Send the bot a message, then get your chat ID from `https://api.telegram.org/bot<TOKEN>/getUpdates`.
2. GitHub repo → Settings → Secrets and variables → Actions:
   - Secrets: `GOOGLE_ADS_YAML` (paste the whole file), `OPS_CONFIG_YAML` (paste the whole config.yaml), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
   - Variable: `OPS_ENABLED` = `true`
3. `.github/workflows/ops-guardrails.yml` then runs the stop-loss **every hour** and the negatives **daily** (08:13 IST). Alerts go to your phone.
   GCLID upload and profit stay in your daily routine, because they need the BeMob export.

### B7. Optional: let Claude Code query Google Ads directly (read-only)
Google publishes an official read-only MCP server: **github.com/googleads/google-ads-mcp**. Follow its README to install it with `pipx` and register it with `claude mcp add`. It uses the same developer token and OAuth credentials. Then you can ask Claude questions like *"Which search terms cost the most last week with no conversions?"* All changes still go through `python -m ops`.

---

## Step 6 weekly decisions (what `/daily-review` checks for you)

| After 5–7 days | Decision | Action |
| --- | --- | --- |
| Spent 2–3× payout with 0 leads | **Kill** | Pause, swap backup offer in admin (30-second swap), keep keywords |
| MyLead rejects >30–40% | **Kill** | Stop traffic now |
| Accepted cost < payout | **Keep & scale** | Cut 0-conv keywords, focus on top 2–3 exact terms, +20–30% budget max |

**Never switch offers daily.** Give each offer a full 5–7 days.

## Notes and limits
- **BeMob API:** not used yet. Its API documentation couldn't be verified while this was built, so Loop 2 reads BeMob's **CSV export**, which works today. If you want full automation later, open BeMob → Settings → API and share the documentation link with Claude, and an API reader can replace the CSV step.
- **CSV columns:** if `csvcheck` shows `NOT FOUND`, add your file's header names under `bemob_csv.columns` in `config.yaml`.
- **UK traffic:** Google requires consent signals for conversions uploaded from UK/EEA users. Keep `consent_ad_user_data: UNSPECIFIED` unless your cookie banner really collects ad consent.
- **Tests:**
  ```bash
  pip install pytest && python -m pytest -q tests
  ```
