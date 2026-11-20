// Three starter offer landing pages (one per niche).
// The brand names "NoteLoop AI", "ScoreShield" and "QuoteNest" are SAMPLE
// placeholders. Replace them, the CTA URLs and all claims with your real,
// verified offer details before sending paid traffic.

const year = new Date().getFullYear();

export const landingPages = [
  {
    slug: "best-ai-meeting-assistant",
    title: "AI Meeting Assistant — NoteLoop (sample)",
    category: "ai-saas",
    status: "published",
    metaTitle: `Best AI Meeting Note-Taker for Small Teams (${year} Comparison)`,
    metaDescription:
      "Compare AI meeting assistants side by side: transcription accuracy, CRM sync, privacy controls and pricing. See which tool fits a small team.",
    offerName: "NoteLoop AI — Free Trial",
    ctaUrl: "https://example.bemobtrk.com/click?sample=noteloop",
    pixelScript: "",
    pixelPlacement: "head",
    passthroughParams: true,
    payout: 45,
    geos: ["US", "UK", "CA", "AU"],
    internalNotes: "SAMPLE PAGE — replace CTA URL with your BeMob campaign click URL and verify every claim with the advertiser.",
    badgeText: `Updated for ${year}`,
    headline: "The AI Meeting Assistant That Turns Calls Into Action Items — Automatically",
    subheadline:
      "We compared popular AI note-takers on accuracy, privacy controls and integrations. Here's the one we'd pick for a 5–50 person team, and when an alternative makes more sense.",
    heroBullets: [
      "Joins Zoom, Google Meet and Microsoft Teams calls and writes the summary for you",
      "Pushes action items and notes to your CRM or project tool",
      "Admin controls for recording consent and data retention",
    ],
    ctaText: "Start the Free Trial",
    ctaSubtext: "Free plan available · Cancel anytime on paid plans",
    comparisonTitle: "AI meeting assistants compared",
    comparisonColumns: ["Best For", "Pricing / Free Trial", "Key Advantage"],
    comparisonRows: [
      { name: "NoteLoop AI", tagline: "Sample offer", highlight: true, rating: 4.7, cells: ["Client-facing teams of 5–50", "Free plan; paid from ~$15/user/mo", "CRM sync + consent controls"], ctaLabel: "Try free" },
      { name: "MinuteMate", tagline: "Sample alternative", highlight: false, rating: 4.3, cells: ["Solo consultants", "Free tier; paid from ~$10/mo", "Simple, fast summaries"], ctaLabel: "View offer" },
      { name: "Built-in video platform recaps", tagline: "Zoom / Meet / Teams add-ons", highlight: false, rating: 3.9, cells: ["Teams already on one platform", "Often bundled with business plans", "No extra vendor to approve"], ctaLabel: "Compare" },
    ],
    body: `## How an AI meeting assistant works

An AI meeting assistant connects to your calendar and joins scheduled video calls as a participant (or records locally on your device). During the call it captures audio and produces a transcript. After the call it uses a language model to turn that transcript into a short summary, a list of decisions, and action items with owners. The better tools then push that output to where your team already works — a CRM record, a project board, a shared doc or a Slack channel — so nobody has to copy and paste notes.

The practical result: instead of one person taking notes while half-listening, everyone can participate, and the follow-up email writes itself.

## Who NoteLoop AI is for

NoteLoop is built for **small client-facing teams** — agencies, sales teams, recruiters, customer success and consultants — who run several external calls a day and need clean records afterwards. It's a strong fit if:

- You use a CRM and want call notes attached to the right contact or deal automatically.
- Several people need to see call notes without attending every call.
- You need admin control over who can record, how participants are notified, and how long recordings are kept.

It's **less suited** to teams that mainly hold short internal stand-ups (a built-in recap from your video platform may be enough) or to organisations with strict on-premises requirements.

## What stood out in our evaluation

**Summary quality.** Summaries were structured into topics, decisions and next steps rather than a wall of text, which made them genuinely usable as follow-up notes. As with every AI tool, summaries occasionally missed nuance or attributed a comment to the wrong speaker, so we recommend a quick skim before you share notes with a client.

**Integrations.** CRM and project-tool sync is the main reason to choose a dedicated assistant over a built-in recap. Notes land on the right record without manual work, which is where most of the time saving comes from.

**Consent and privacy controls.** Recording laws vary: some jurisdictions require every participant's consent. NoteLoop lets admins enforce an automatic recording notice, restrict which meetings can be recorded, and set retention periods. Before you buy any AI note-taker, check where data is stored, whether your recordings are used to train models, and whether the vendor offers a data processing agreement.

**Pricing.** There's a free plan for trying it out, with paid per-user plans unlocking integrations and admin controls. Always confirm current pricing on the vendor's site — AI tool pricing changes frequently.

## How it compares with the alternatives

**MinuteMate** is simpler and cheaper, and a good choice for a solo consultant who just wants a quick summary emailed after each call. It has fewer admin and integration options, so it becomes limiting as a team grows.

**Built-in recaps** from Zoom, Google Meet or Microsoft Teams avoid adding another vendor and may already be included in your business plan. The trade-off is that they generally work only inside that one platform and offer more limited CRM integration. If your team uses multiple meeting platforms or needs notes in a CRM, a dedicated tool is usually worth it.

## How to get the most from a free trial

1. Connect your calendar and run the assistant on five to ten real calls, not test calls.
2. Turn on the CRM or project-tool integration on day one — that's where you'll feel the difference.
3. Configure the recording notice before you use it with clients.
4. At the end of the trial, compare the time your team spent on notes before and after.

## Bottom line

If your team spends hours each week writing up calls and updating a CRM, a dedicated AI meeting assistant pays for itself quickly. NoteLoop combines solid summaries with the integrations and consent controls that matter for client-facing work. If you only need occasional internal recaps, start with what your video platform already offers.`,
    pros: [
      "Structured summaries with decisions and action items, not just transcripts",
      "Automatic CRM and project-tool sync saves the most time",
      "Admin controls for recording notices and retention",
      "Free plan to test on real calls before paying",
    ],
    cons: [
      "AI summaries still need a quick human check before sharing externally",
      "Integrations and admin features require a paid plan",
      "Overkill for teams that mostly hold short internal meetings",
    ],
    verdict:
      "For small client-facing teams that live in their CRM, NoteLoop AI is our top pick: reliable summaries, the integrations that actually save time, and sensible privacy controls. Try it on a week of real calls before committing.",
    showComparison: true,
    showEmailCapture: true,
    showStickyCta: true,
    emailHeadline: "Free: AI Meeting Assistant Security Checklist",
    emailSubtext: "12 questions to ask any vendor before you let a bot record client calls. One email, no spam.",
  },
  {
    slug: "credit-monitoring-service",
    title: "Credit Monitoring — ScoreShield (sample)",
    category: "finance",
    status: "published",
    metaTitle: `Best Credit Monitoring Service: 3-Bureau Alerts Compared (${year})`,
    metaDescription:
      "Is paid credit monitoring worth it? Compare 3-bureau monitoring, identity theft insurance and free alternatives like credit freezes and free weekly reports.",
    offerName: "ScoreShield — 3-Bureau Monitoring",
    ctaUrl: "https://example.bemobtrk.com/click?sample=scoreshield",
    pixelScript: "",
    pixelPlacement: "head",
    passthroughParams: true,
    payout: 30,
    geos: ["US"],
    internalNotes: "SAMPLE PAGE — US-only. Confirm the advertiser's trial terms and identity-insurance amounts before going live; Google Ads financial services policies may require advertiser verification.",
    badgeText: `Updated for ${year}`,
    headline: "Get Alerted the Moment Something Changes on Your Credit Report",
    subheadline:
      "Paid credit monitoring isn't for everyone. We compare 3-bureau monitoring with the free tools every US consumer can use — and explain when paying makes sense.",
    heroBullets: [
      "Alerts for new accounts, hard inquiries and address changes at all three bureaus",
      "Identity restoration support if something goes wrong",
      "Clear monthly pricing — know exactly what you'll pay before you start",
    ],
    ctaText: "See Plans & Pricing",
    ctaSubtext: "Checking your own credit does not affect your score",
    comparisonTitle: "Credit monitoring options compared",
    comparisonColumns: ["Best For", "Pricing / Free Trial", "Key Advantage"],
    comparisonRows: [
      { name: "ScoreShield", tagline: "Sample offer", highlight: true, rating: 4.6, cells: ["Hands-off 3-bureau protection", "Monthly plan; check site for trial terms", "Alerts + identity restoration"], ctaLabel: "See plans" },
      { name: "Free bank / card score tools", tagline: "Included with many accounts", highlight: false, rating: 4.0, cells: ["Tracking your score trend", "Free", "Already in your banking app"], ctaLabel: "Learn more" },
      { name: "Credit freeze + free weekly reports", tagline: "DIY at each bureau", highlight: false, rating: 4.2, cells: ["Blocking new-account fraud", "Free by law", "Strongest prevention, no cost"], ctaLabel: "Compare" },
    ],
    body: `## What credit monitoring actually does

A credit monitoring service watches your credit reports at Equifax, Experian and TransUnion and alerts you when something changes — a new account is opened, a lender makes a hard inquiry, your address changes, or a collection account appears. The value is **speed**: the sooner you know about an account you didn't open, the faster you can dispute it and limit the damage.

Monitoring is a **detection** tool. It doesn't stop someone from applying for credit in your name; it tells you after it happens. That distinction matters when you compare it with free alternatives.

## Who a paid service like ScoreShield is for

Paid 3-bureau monitoring is worth considering if:

- Your personal data has been exposed in a data breach and you want ongoing alerts across all three bureaus.
- You're about to apply for a mortgage or car loan and want to spot errors early.
- You want someone else to handle the paperwork if identity theft does happen — many paid plans include identity restoration specialists and an identity theft insurance policy that covers certain expenses.
- You prefer a single dashboard to managing three bureau accounts yourself.

It's **probably not necessary** if you already have a credit freeze in place, check your free reports regularly, and are comfortable handling disputes yourself.

## The free alternatives you should know about

**Credit freezes are free.** Since 2018, US federal law requires all three bureaus to let you freeze and unfreeze your credit at no charge. A freeze stops most lenders from accessing your report, which blocks the majority of new-account fraud. You temporarily lift it when you want to apply for credit.

**Free credit reports.** You can get free credit reports from each of the three bureaus through AnnualCreditReport.com, the official site authorised by federal law. The bureaus now offer these free reports weekly.

**Bank and card tools.** Many banks and card issuers show a free credit score and basic change alerts, usually from one bureau.

For many people, a freeze plus regular report checks provides strong protection at zero cost. Paid monitoring adds convenience, three-bureau coverage in one place, and restoration support.

## What we looked for

- **Three-bureau coverage**, not just one.
- **Alert speed and clarity** — alerts you can understand and act on.
- **Identity restoration** — access to specialists who help you file disputes and police reports.
- **Transparent pricing** — clear monthly cost, clear trial terms, easy cancellation.
- **Privacy** — what the service does with your data, and whether it's shared for marketing.

## Our take on ScoreShield

ScoreShield covers all three bureaus, sends clear alerts for the changes that matter most, and includes identity restoration support. Its main appeal is convenience: everything in one dashboard and help on hand if something goes wrong.

Before you sign up, read the trial terms carefully. Some monitoring services start with a low-cost or free trial that converts to a monthly subscription; set a reminder if you only want to try it. Also check the exact identity theft insurance limits and exclusions in the policy documents rather than relying on headline figures.

## A sensible setup

1. Freeze your credit at all three bureaus (free).
2. Pull your free reports and check them for errors.
3. If you want three-bureau alerts and restoration help without the DIY work, add a paid monitoring service like ScoreShield.

## Bottom line

Credit monitoring is a convenience and peace-of-mind product, not a magic shield. If you value hands-off alerts across all three bureaus and expert help if your identity is stolen, ScoreShield is a solid option. If you're comfortable with DIY, a free credit freeze and regular free reports go a long way.`,
    pros: [
      "Monitors all three bureaus in a single dashboard",
      "Identity restoration specialists included",
      "Checking your own credit doesn't affect your score",
      "Useful before major applications like a mortgage",
    ],
    cons: [
      "Detects fraud after the fact — a free credit freeze prevents more of it",
      "Monthly cost adds up compared with free tools",
      "Trial terms can auto-renew — read them before you start",
    ],
    verdict:
      "If you want hands-off, three-bureau alerts and someone to call if your identity is stolen, ScoreShield is worth a look. Pair it with a free credit freeze for the strongest protection.",
    showComparison: true,
    showEmailCapture: false,
    showStickyCta: true,
    emailHeadline: "Free: Identity Theft Recovery Checklist",
    emailSubtext: "Step-by-step actions to take in the first 24 hours.",
  },
  {
    slug: "compare-home-insurance-quotes",
    title: "Home Insurance Quotes — QuoteNest (sample)",
    category: "home-insurance",
    status: "published",
    metaTitle: `Compare Home Insurance Quotes in Minutes (${year} Guide)`,
    metaDescription:
      "Compare homeowners insurance quotes from multiple insurers in one place. Learn what affects your premium and how to compare coverage, not just price.",
    offerName: "QuoteNest — Home Insurance Quotes",
    ctaUrl: "https://example.bemobtrk.com/click?sample=quotenest",
    pixelScript: "",
    pixelPlacement: "head",
    passthroughParams: true,
    payout: 18,
    geos: ["US"],
    internalNotes: "SAMPLE PAGE — insurance lead-gen; confirm the advertiser is licensed in target states and that their consent language complies with TCPA rules.",
    badgeText: `Updated for ${year}`,
    headline: "Compare Home Insurance Quotes From Multiple Insurers — Without the Sales Calls Marathon",
    subheadline:
      "Premiums for the same home can vary widely between insurers. A quote-comparison service lets you see several options in one place so you can compare coverage and price side by side.",
    heroBullets: [
      "One short form instead of contacting insurers one by one",
      "Compare dwelling coverage, deductibles and liability limits — not just the premium",
      "Free to use, with no obligation to buy",
    ],
    ctaText: "Compare Quotes Now",
    ctaSubtext: "Free · No obligation · Takes about 5 minutes",
    comparisonTitle: "Ways to shop for home insurance",
    comparisonColumns: ["Best For", "Cost to Use", "Key Advantage"],
    comparisonRows: [
      { name: "QuoteNest", tagline: "Sample quote marketplace", highlight: true, rating: 4.5, cells: ["Comparing several insurers fast", "Free, no obligation", "Multiple quotes from one form"], ctaLabel: "Get quotes" },
      { name: "Independent insurance agent", tagline: "Local or online", highlight: false, rating: 4.4, cells: ["Complex homes or high-value items", "Free (paid by insurer commission)", "Personal advice"], ctaLabel: "Compare" },
      { name: "Going direct to one insurer", tagline: "Single-company quote", highlight: false, rating: 3.8, cells: ["Bundling with existing auto policy", "Free", "Simple if you're loyal to one brand"], ctaLabel: "Compare" },
    ],
    body: `## How a home insurance quote-comparison service works

A quote-comparison service collects basic details about you and your home once — address, year built, square footage, roof age, construction type and the coverage you want — and shares them with participating insurers or agents. You then receive several quotes, either on screen, by email or from licensed agents who follow up. Instead of filling in the same form five times, you fill it in once.

Services like QuoteNest are typically free to use because they're paid by the insurers and agents in their network. Your quote and the eventual premium come from the insurer, not from the comparison service.

## Who it's for

Comparing quotes is worth doing if:

- You're buying a home and need a policy before closing.
- Your renewal premium has gone up noticeably.
- You've made improvements — a new roof, updated wiring, a security system — that could lower your rate.
- You haven't shopped your policy in two or three years.

If you have an unusual property — a historic home, significant high-value items, or a home in a high-risk wildfire or coastal area — an **independent agent** who can explain specialist options may be a better first stop.

## Why prices vary so much

Each insurer prices risk differently. They weigh factors such as your home's rebuild cost, location, roof age and material, claims history, chosen deductible and, in most US states, a credit-based insurance score. Because each company uses its own model, two quotes for identical coverage can be far apart. That's exactly why comparing several quotes is worthwhile.

## Compare coverage, not just the price

The cheapest quote isn't the best deal if it leaves you underinsured. When you compare, line up these items:

- **Dwelling coverage (Coverage A):** should reflect the cost to *rebuild* your home, not its market value.
- **Replacement cost vs. actual cash value:** replacement cost pays to replace damaged items at today's prices; actual cash value deducts depreciation.
- **Deductible:** a higher deductible lowers your premium but increases what you pay per claim. Check whether wind or hail has a separate percentage deductible.
- **Personal liability:** many people choose at least $300,000; consider an umbrella policy if you have significant assets.
- **Loss of use:** pays living expenses if your home becomes uninhabitable after a covered loss.
- **Exclusions:** standard policies generally don't cover flood or earthquake. Flood insurance is available separately, including through the National Flood Insurance Program.

Our guide to [what each part of a home insurance policy covers](/articles/home-insurance-coverage-explained) explains these in more detail.

## What to expect after you submit the form

Depending on the service, you may see instant quotes, receive emails, or get calls from licensed agents. Read the consent wording on the form so you know how you'll be contacted. Have your current policy's declarations page handy so you can compare like for like.

## Tips for getting an accurate quote

1. Use the same coverage limits and deductible across every quote.
2. Have details ready: roof age, renovation dates, safety features.
3. Ask about discounts for bundling, security systems, claims-free history and impact-resistant roofing.
4. Check the insurer's financial strength rating and complaint record with your state insurance department.

## Bottom line

Shopping your home insurance every few years is one of the simplest ways to make sure you're not overpaying. QuoteNest makes it faster to collect several quotes at once. Use it to narrow your options, then compare coverage line by line before you switch.`,
    pros: [
      "One form returns multiple quotes, saving time",
      "Free to use with no obligation to buy",
      "Makes it easy to benchmark your renewal price",
      "Good starting point for first-time buyers",
    ],
    cons: [
      "You may be contacted by several agents — read the consent terms",
      "Not every insurer participates in every network",
      "Specialist or high-value homes may need an independent agent",
    ],
    verdict:
      "If you haven't compared home insurance in a couple of years, QuoteNest is a quick, free way to see whether you could get the same coverage for less. Compare coverage line by line before switching.",
    showComparison: true,
    showEmailCapture: true,
    showStickyCta: true,
    emailHeadline: "Free: Home Insurance Quote Comparison Worksheet",
    emailSubtext: "A printable worksheet to compare quotes like for like.",
  },
];
