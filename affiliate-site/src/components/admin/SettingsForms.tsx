"use client";
import { useActionState, useState } from "react";
import { saveSettings, savePage } from "@/app/admin/actions";
import { Section } from "./ui";
import { Field, MarkdownEditor } from "./fields";

type S = { siteName: string; tagline: string; logoUrl: string; footerText: string; contactEmail: string; contactPhone: string; contactAddress: string; globalPixel: string; headScripts: string };

function Status({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state) return null;
  return <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</p>;
}

export function SettingsForm({ settings }: { settings: S }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  return (
    <form action={action}>
      <Section title="Site identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Site name"><input name="siteName" className="input" defaultValue={settings.siteName} required /></Field>
          <Field label="Tagline"><input name="tagline" className="input" defaultValue={settings.tagline} /></Field>
        </div>
        <Field label="Logo URL" hint="Optional image URL. Leave blank to use the text logo."><input name="logoUrl" className="input" defaultValue={settings.logoUrl} placeholder="https://…/logo.svg" /></Field>
        <Field label="Footer text"><textarea name="footerText" rows={3} className="input" defaultValue={settings.footerText} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact email"><input name="contactEmail" type="email" className="input" defaultValue={settings.contactEmail} /></Field>
          <Field label="Contact phone"><input name="contactPhone" className="input" defaultValue={settings.contactPhone} /></Field>
        </div>
        <Field label="Business / mailing address"><textarea name="contactAddress" rows={3} className="input" defaultValue={settings.contactAddress} /></Field>
        <Field label="Global BeMob pixel (fallback)" hint="Injected on any landing page that has no pixel of its own."><textarea name="globalPixel" rows={5} className="input font-mono text-xs" defaultValue={settings.globalPixel} /></Field>
        <Field label="Site-wide head scripts (optional)" hint="E.g. Google Analytics / Google Ads global site tag. Rendered on all public editorial pages."><textarea name="headScripts" rows={5} className="input font-mono text-xs" defaultValue={settings.headScripts} /></Field>
        <div className="flex items-center gap-3"><button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button><Status state={state} /></div>
      </Section>
    </form>
  );
}

export function CompliancePageForm({ page }: { page: { slug: string; title: string; content: string; metaDescription: string } }) {
  const [state, action, pending] = useActionState(savePage, null);
  const [content, setContent] = useState(page.content);
  const [open, setOpen] = useState(false);
  return (
    <form action={action} className="card">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between p-5 text-left">
        <span><span className="font-semibold">{page.title}</span> <span className="text-xs text-ink-mute">/{page.slug}</span></span>
        <span className="text-sm text-brand-700">{open ? "Close" : "Edit"}</span>
      </button>
      {open && (
        <div className="grid gap-4 border-t border-line p-5">
          <input type="hidden" name="slug" value={page.slug} />
          <input type="hidden" name="content" value={content} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Page title"><input name="title" className="input" defaultValue={page.title} required /></Field>
            <Field label="Meta description"><input name="metaDescription" className="input" defaultValue={page.metaDescription} /></Field>
          </div>
          <MarkdownEditor value={content} onChange={setContent} rows={20} />
          <div className="flex items-center gap-3">
            <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save page"}</button>
            <a href={`/${page.slug}`} target="_blank" className="btn-outline">View</a>
            <Status state={state} />
          </div>
        </div>
      )}
    </form>
  );
}
