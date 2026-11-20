import { ArticleForm } from "@/components/admin/ArticleForm";
import { emptyArticle } from "@/lib/defaults";
import { PageHeader } from "@/components/admin/ui";

export default function NewArticle() {
  return (<><PageHeader title="New article" /><ArticleForm initial={emptyArticle()} /></>);
}
