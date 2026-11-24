/**
 * Seeds the database with:
 *  - global settings
 *  - the 4 mandatory compliance pages
 *  - 3 starter offer landing pages (one per niche)
 *  - 6 editorial articles
 *
 * Safe to re-run: existing records (matched by slug) are left untouched so your
 * admin edits are never overwritten. Set SEED_FORCE=1 to overwrite them.
 */
import { PrismaClient } from "@prisma/client";
import { pages, SITE_NAME } from "./content/pages";
import { landingPages } from "./content/landing";
import { articles } from "./content/articles";
import { batch1OfferLinks } from "./content/articles-batch1";

const prisma = new PrismaClient();
const force = process.env.SEED_FORCE === "1";

async function main() {
  const settings = {
    siteName: SITE_NAME,
    tagline: "Independent comparisons for smarter decisions",
    footerText: `${SITE_NAME} is an independent publication that compares software, financial tools and home insurance options. We may earn a commission from partner links; this never affects our editorial ratings. Content is for general information only and is not financial, legal or insurance advice.`,
    contactEmail: "hello@wisecompareguide.com",
    contactPhone: "",
    contactAddress: "Ranganath Mutyala\nHyderabad, Telangana, India",
  };
  await prisma.setting.upsert({ where: { id: 1 }, update: force ? settings : {}, create: { id: 1, ...settings } });

  for (const p of pages) {
    await prisma.page.upsert({ where: { slug: p.slug }, update: force ? p : {}, create: p });
  }

  for (const lp of landingPages) {
    const data = {
      ...lp,
      geos: JSON.stringify(lp.geos),
      heroBullets: JSON.stringify(lp.heroBullets),
      comparisonColumns: JSON.stringify(lp.comparisonColumns),
      comparisonRows: JSON.stringify(lp.comparisonRows),
      pros: JSON.stringify(lp.pros),
      cons: JSON.stringify(lp.cons),
    };
    await prisma.landingPage.upsert({ where: { slug: lp.slug }, update: force ? data : {}, create: data });
  }

  for (const a of articles) {
    await prisma.article.upsert({ where: { slug: a.slug }, update: force ? a : {}, create: a });
  }

  // Offer link placeholders (URLs are pasted later in Admin → Offer Links; never overwritten here).
  for (const o of batch1OfferLinks) {
    await prisma.offerLink.upsert({ where: { key: o.key }, update: {}, create: { ...o, network: "MyLead" } });
  }

  const counts = await Promise.all([prisma.page.count(), prisma.landingPage.count(), prisma.article.count()]);
  console.log(`Seed complete: ${counts[0]} pages, ${counts[1]} landing pages, ${counts[2]} articles${force ? " (forced)" : ""}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
