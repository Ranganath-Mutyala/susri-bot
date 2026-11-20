import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { categoryName } from "@/lib/categories";
import { formatDate, readingTime } from "@/lib/utils";
import { DisclosureBanner } from "@/components/DisclosureBanner";
import { Markdown } from "@/components/Markdown";
import { Toc } from "@/components/Toc";
import { ArticleCard } from "@/components/ArticleCard";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const a = await prisma.article.findUnique({ where: { slug } });
  return a && a.status === "published" ? a : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await load((await params).slug);
  if (!a) return {};
  return {
    title: a.metaTitle || a.title,
    description: a.metaDescription || a.excerpt,
    alternates: { canonical: `/articles/${a.slug}` },
    openGraph: { type: "article", title: a.metaTitle || a.title, description: a.metaDescription || a.excerpt, publishedTime: a.publishedAt?.toISOString(), modifiedTime: a.updatedAt.toISOString() },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await load((await params).slug);
  if (!article) notFound();
  const { html, toc } = renderMarkdown(article.content);
  const related = await prisma.article.findMany({
    where: { status: "published", category: article.category, NOT: { id: article.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: article.authorName },
  };

  return (
    <>
      <DisclosureBanner />
      <article className="container-page py-12">
        <header className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-mute">
            <Link href="/" className="hover:underline">Home</Link> /{" "}
            <Link href={`/${article.category}`} className="hover:underline">{categoryName(article.category)}</Link>
          </nav>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-8 text-ink-soft">{article.excerpt}</p>
          <p className="mt-5 text-sm text-ink-mute">
            By <span className="font-medium text-ink">{article.authorName}</span> · Updated {formatDate(article.updatedAt)} · {readingTime(article.content)} min read
          </p>
        </header>

        <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[1fr_260px]">
          <div className="min-w-0">
            <div className="lg:hidden"><Toc items={toc} /></div>
            <div className="mt-6 lg:mt-0"><Markdown html={html} /></div>

            <section aria-label="About the author" className="card mt-12 flex gap-4 p-6">
              <div aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
                {article.authorName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{article.authorName}</p>
                {article.authorRole && <p className="text-sm text-ink-mute">{article.authorRole}</p>}
                {article.authorBio && <p className="mt-2 text-sm leading-6 text-ink-soft">{article.authorBio}</p>}
                <p className="mt-2 text-sm"><Link href="/about" className="text-brand-700 underline">Read our editorial standards</Link></p>
              </div>
            </section>
          </div>
          <aside className="hidden lg:block"><div className="sticky top-24"><Toc items={toc} /></div></aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container-page pb-6">
          <h2 className="font-serif text-2xl font-bold">More in {categoryName(article.category)}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">{related.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
