import Link from "next/link";
import type { Article } from "@prisma/client";
import { categoryName } from "@/lib/categories";
import { formatDate, readingTime } from "@/lib/utils";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="card group flex flex-col p-5 transition-shadow hover:shadow-md">
      <p className="eyebrow">{categoryName(article.category)}</p>
      <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-ink group-hover:text-brand-700">
        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-ink-soft">{article.excerpt}</p>
      <p className="mt-4 text-xs text-ink-mute">
        {formatDate(article.publishedAt ?? article.updatedAt)} · {readingTime(article.content)} min read
      </p>
    </article>
  );
}
