import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PageHeader } from "@/components/admin/ui";
import { deleteArticle } from "../../../actions";

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await prisma.article.findUnique({ where: { id } });
  if (!a) notFound();
  return (
    <>
      <PageHeader
        title={`Edit: ${a.title}`}
        actions={<>
          {a.status === "published" && <a href={`/articles/${a.slug}`} target="_blank" className="btn-outline">View live</a>}
          <form action={deleteArticle}><input type="hidden" name="id" value={a.id} /><ConfirmButton message="Delete this article permanently?">Delete</ConfirmButton></form>
        </>}
      />
      <ArticleForm initial={{ id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt, category: a.category, content: a.content, status: a.status, featured: a.featured, coverImage: a.coverImage, metaTitle: a.metaTitle, metaDescription: a.metaDescription, authorName: a.authorName, authorRole: a.authorRole, authorBio: a.authorBio }} />
    </>
  );
}
