import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { Markdown } from "./Markdown";

export async function getPage(slug: string) {
  return prisma.page.findUnique({ where: { slug } });
}

export async function staticPageMetadata(slug: string): Promise<Metadata> {
  const p = await getPage(slug);
  return p ? { title: p.title, description: p.metaDescription, alternates: { canonical: `/${slug}` } } : {};
}

export async function StaticPage({ slug, children }: { slug: string; children?: React.ReactNode }) {
  const page = await getPage(slug);
  if (!page) notFound();
  const { html } = renderMarkdown(page.content);
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl font-bold tracking-tight">{page.title}</h1>
        <p className="mt-3 text-sm text-ink-mute">Last updated {formatDate(page.updatedAt)}</p>
        <div className="mt-8"><Markdown html={html} /></div>
        {children}
      </div>
    </div>
  );
}
