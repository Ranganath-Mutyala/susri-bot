import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
import { ArticleCard } from "@/components/ArticleCard";
import { OfferCard } from "@/components/OfferCard";

const TRUST = [
  { title: "Independent editorial", text: "Ratings are set by our editors using a published methodology — partners can't buy a higher score." },
  { title: "Fees & fine print first", text: "We surface pricing, trial terms, cancellation rules and limitations before the sales pitch." },
  { title: "Updated regularly", text: "Every guide shows when it was last reviewed, and we re-check pricing and terms on a schedule." },
  { title: "Transparent funding", text: "We may earn a commission from some links. We say so clearly on every page that contains them." },
];

export default async function HomePage() {
  const [settings, offers, articles] = await Promise.all([
    getSettings(),
    prisma.landingPage.findMany({ where: { status: "published" }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.article.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, take: 6 }),
  ]);

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page grid gap-10 py-16 md:grid-cols-[1.4fr_1fr] md:py-24">
          <div>
            <p className="eyebrow">Independent consumer & business comparisons</p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
              Make the right call on software, money and your home.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-soft">
              {settings.siteName} publishes side-by-side comparisons and plain-English reviews so you can choose
              with confidence — whether that&apos;s an AI tool for your team, a credit monitoring service, or a home
              insurance quote.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/articles" className="btn-primary px-5 py-3 text-base">Browse guides</Link>
              <Link href="/about" className="btn-outline px-5 py-3 text-base">How we review</Link>
            </div>
          </div>
          <div className="grid gap-3 self-center">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="card group p-5 transition-shadow hover:shadow-md">
                <p className="font-serif text-lg font-semibold group-hover:text-brand-700">{c.longName} →</p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{c.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14" aria-labelledby="trust">
        <h2 id="trust" className="sr-only">Why readers trust us</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="rounded-xl bg-brand-50 p-5">
              <p className="flex items-center gap-2 font-semibold text-brand-900">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M5 13l4 4L19 7" /></svg>
                {t.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-brand-900/80">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="container-page py-6" aria-labelledby="featured">
          <div className="flex items-end justify-between">
            <h2 id="featured" className="font-serif text-3xl font-bold">Featured comparison guides</h2>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {offers.map((o) => <OfferCard key={o.id} lp={o} />)}
          </div>
        </section>
      )}

      <section className="container-page py-14" aria-labelledby="recent">
        <div className="flex items-end justify-between">
          <h2 id="recent" className="font-serif text-3xl font-bold">Recent reviews & guides</h2>
          <Link href="/articles" className="text-sm font-semibold text-brand-700">View all →</Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      </section>
    </>
  );
}
