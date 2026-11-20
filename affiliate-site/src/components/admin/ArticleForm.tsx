"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveArticle, type ArticlePayload } from "@/app/admin/actions";
import { CATEGORIES } from "@/lib/categories";
import { slugify } from "@/lib/utils";
import { Section } from "./ui";
import { Field, MarkdownEditor, Toggle } from "./fields";

export function ArticleForm({ initial }: { initial: ArticlePayload }) {
  const [d, setD] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = <K extends keyof ArticlePayload>(k: K, v: ArticlePayload[K]) => setD((p) => ({ ...p, [k]: v }));

  function save(status: string) {
    const payload = { ...d, status };
    start(async () => {
      const res = await saveArticle(payload);
      if (res.ok) {
        setD(payload);
        setMsg({ ok: true, text: status === "published" ? "Published." : "Draft saved." });
        if (!d.id) router.replace(`/admin/articles/${res.id}`);
        else router.refresh();
      } else setMsg({ ok: false, text: res.error });
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(d.status); }} className="grid gap-5 pb-24">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5">
          <Section title="Content">
            <Field label="Title"><input className="input text-lg" required value={d.title} onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} /></Field>
            <Field label="Excerpt / standfirst"><textarea className="input" rows={2} value={d.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></Field>
            <MarkdownEditor value={d.content} onChange={(v) => set("content", v)} rows={28} target={[1000, 3000]} />
          </Section>
        </div>
        <div className="grid h-fit gap-5">
          <Section title="Publishing">
            <Field label="URL slug" hint={`/articles/${d.slug || "your-slug"}`}><input className="input font-mono text-sm" value={d.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></Field>
            <Field label="Category">
              <select className="input" value={d.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.longName}</option>)}</select>
            </Field>
            <Toggle checked={d.featured} onChange={(v) => set("featured", v)} label="Featured" />
          </Section>
          <Section title="SEO">
            <Field label="Meta title" hint={`${d.metaTitle.length}/60`}><input className="input" value={d.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></Field>
            <Field label="Meta description" hint={`${d.metaDescription.length}/155`}><textarea className="input" rows={3} value={d.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></Field>
          </Section>
          <Section title="Author bio">
            <Field label="Name"><input className="input" value={d.authorName} onChange={(e) => set("authorName", e.target.value)} /></Field>
            <Field label="Role"><input className="input" value={d.authorRole} onChange={(e) => set("authorRole", e.target.value)} /></Field>
            <Field label="Bio"><textarea className="input" rows={4} value={d.authorBio} onChange={(e) => set("authorBio", e.target.value)} /></Field>
          </Section>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:left-[230px]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <p className={`text-sm ${msg ? (msg.ok ? "text-green-700" : "text-red-600") : "text-ink-mute"}`}>{msg?.text ?? (d.status === "published" ? "Published" : "Draft")}</p>
          <div className="flex gap-2">
            <button type="button" className="btn-outline" disabled={pending} onClick={() => save("draft")}>Save draft</button>
            <button type="button" className="btn-primary" disabled={pending} onClick={() => save("published")}>{pending ? "Saving…" : d.status === "published" ? "Update" : "Publish"}</button>
          </div>
        </div>
      </div>
    </form>
  );
}
