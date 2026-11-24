import { liveArticleWhere } from "@/lib/articles";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import { ArticleCard } from "@/components/ArticleCard";

export const metadata = { title: "Guides & Reviews", description: "In-depth comparison guides and reviews across AI software, personal finance and home insurance.", alternates: { canonical: "/articles" } };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const valid = CATEGORIES.some((c) => c.slug === category);
  const articles = await prisma.article.findMany({
    where: { ...liveArticleWhere(), ...(valid ? { category } : {}) },
    orderBy: { publishedAt: "desc" },
  });
  return (
    <div className="container-page py-14">
      <h1 className="font-serif text-4xl font-bold tracking-tight">Guides & Reviews</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-soft">Long-form comparisons and explainers written to help you decide — not to sell you.</p>
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/articles" className={`badge px-3 py-1 ${!valid ? "bg-ink text-white" : "bg-white border border-line"}`}>All</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/articles?category=${c.slug}`} className={`badge px-3 py-1 ${category === c.slug ? "bg-ink text-white" : "bg-white border border-line"}`}>{c.name}</Link>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">{articles.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
    </div>
  );
}
