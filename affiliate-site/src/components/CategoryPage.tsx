import { liveArticleWhere } from "@/lib/articles";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCategory } from "@/lib/categories";
import { ArticleCard } from "./ArticleCard";
import { OfferCard } from "./OfferCard";

export async function CategoryPage({ slug }: { slug: string }) {
  const cat = getCategory(slug);
  if (!cat) notFound();
  const [offers, articles] = await Promise.all([
    prisma.landingPage.findMany({ where: { category: slug, status: "published" }, orderBy: { updatedAt: "desc" } }),
    prisma.article.findMany({ where: { category: slug, ...liveArticleWhere() }, orderBy: { publishedAt: "desc" } }),
  ]);
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-14">
          <p className="eyebrow">Category</p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">{cat.longName}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">{cat.description}</p>
        </div>
      </section>
      {offers.length > 0 && (
        <section className="container-page pt-12">
          <h2 className="font-serif text-2xl font-bold">Top comparisons</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">{offers.map((o) => <OfferCard key={o.id} lp={o} />)}</div>
        </section>
      )}
      <section className="container-page py-12">
        <h2 className="font-serif text-2xl font-bold">Guides & reviews</h2>
        {articles.length === 0 ? (
          <p className="mt-4 text-ink-soft">New guides are on the way.</p>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-3">{articles.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
        )}
      </section>
    </>
  );
}

export function categoryMetadata(slug: string) {
  const cat = getCategory(slug)!;
  return { title: `${cat.longName}: Comparisons & Reviews`, description: cat.description, alternates: { canonical: `/${slug}` } };
}
