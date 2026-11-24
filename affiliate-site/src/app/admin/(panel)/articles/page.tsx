import Link from "next/link";
import { prisma } from "@/lib/db";
import { isScheduled, isLive } from "@/lib/articles";
import { categoryName } from "@/lib/categories";
import { wordCount } from "@/lib/utils";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { toggleArticleStatus } from "../../actions";

export default async function ArticlesAdmin() {
  const articles = await prisma.article.findMany({ orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }] });
  return (
    <>
      <PageHeader title="Editorial articles" description="Long-form reviews, comparisons and guides that build topical authority." actions={<Link href="/admin/articles/new" className="btn-primary">+ New article</Link>} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-ink-mute"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Words</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-line">
            {articles.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3"><Link href={`/admin/articles/${a.id}`} className="font-semibold hover:underline">{a.title}</Link><p className="text-xs text-ink-mute">/articles/{a.slug}</p></td>
                <td className="px-4 py-3">{categoryName(a.category)}</td>
                <td className="px-4 py-3">{wordCount(a.content)}</td>
                <td className="px-4 py-3">{isScheduled(a) ? <span className="badge bg-blue-100 text-blue-800" title={a.publishedAt?.toISOString()}>Scheduled · {a.publishedAt?.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span> : <StatusBadge status={a.status} />}</td>
                <td className="px-4 py-3 text-xs text-ink-mute">{a.updatedAt.toLocaleDateString()}</td>
                <td className="px-4 py-3"><div className="flex justify-end gap-2">
                  <Link href={`/admin/articles/${a.id}`} className="btn-outline px-2.5 py-1 text-xs">Edit</Link>
                  <a href={`/articles/${a.slug}`} target="_blank" className="btn-outline px-2.5 py-1 text-xs">{isLive(a) ? "View" : "Preview"}</a>
                  <form action={toggleArticleStatus}><input type="hidden" name="id" value={a.id} /><button className="btn-outline px-2.5 py-1 text-xs">{a.status === "published" ? "Unpublish" : "Publish"}</button></form>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
