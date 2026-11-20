"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveLandingPage, type LandingPayload } from "@/app/admin/actions";
import { CATEGORIES } from "@/lib/categories";
import { GEO_OPTIONS } from "@/lib/landing";
import { slugify } from "@/lib/utils";
import { Section } from "./ui";
import { Field, ListEditor, MarkdownEditor, Toggle } from "./fields";
import { ComparisonBuilder } from "./ComparisonBuilder";

const TABS = ["Basics & SEO", "Tracking & Offer", "Hero", "Comparison", "Body & Pros/Cons", "Modules"] as const;

export function LandingPageForm({ initial }: { initial: LandingPayload }) {
  const [d, setD] = useState<LandingPayload>(initial);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Basics & SEO");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = <K extends keyof LandingPayload>(k: K, v: LandingPayload[K]) => setD((p) => ({ ...p, [k]: v }));

  function save(status?: string) {
    const payload = { ...d, status: status ?? d.status };
    setMsg(null);
    start(async () => {
      const res = await saveLandingPage(payload);
      if (res.ok) {
        setD(payload);
        setMsg({ ok: true, text: payload.status === "published" ? "Saved & live." : "Saved as draft." });
        if (!d.id) router.replace(`/admin/landing-pages/${res.id}`);
        else router.refresh();
      } else setMsg({ ok: false, text: res.error });
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-5 pb-24">
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-line bg-white p-1">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${tab === t ? "bg-brand-600 font-semibold text-white" : "text-ink-soft hover:bg-gray-100"}`}>{t}</button>
        ))}
      </div>

      {tab === "Basics & SEO" && (
        <Section title="Basic info & SEO">
          <Field label="Page title (internal)">
            <input className="input" value={d.title} required onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="URL slug" hint={`Public URL: /offers/${d.slug || "your-slug"}`}>
              <input className="input font-mono text-sm" value={d.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
            </Field>
            <Field label="Niche category">
              <select className="input" value={d.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.longName}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Meta title" hint={`${d.metaTitle.length}/60 characters recommended`}><input className="input" value={d.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></Field>
          <Field label="Meta description" hint={`${d.metaDescription.length}/155 characters recommended`}><textarea className="input" rows={3} value={d.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></Field>
          <Field label="Status">
            <select className="input" value={d.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </Field>
        </Section>
      )}

      {tab === "Tracking & Offer" && (
        <Section title="Tracking & offer configuration" description="Every CTA button links directly (single hop) to this URL with rel=&quot;nofollow sponsored&quot;.">
          <Field label="Primary BeMob CTA URL" hint="Your BeMob campaign's click URL, e.g. https://abcd1.bemobtrk.com/click">
            <input className="input font-mono text-sm" value={d.ctaUrl} placeholder="https://" onChange={(e) => set("ctaUrl", e.target.value)} />
          </Field>
          <Toggle checked={d.passthroughParams} onChange={(v) => set("passthroughParams", v)} label="Forward ad click parameters to the CTA URL" hint="Appends incoming gclid, gbraid, wbraid, keyword, creative, matchtype, campaignid, adgroupid and utm_* values server-side." />
          <Field label="BeMob Landing Page pixel script" hint="Paste the LP pixel / tracking snippet exactly as BeMob provides it. Leave blank to use the global fallback pixel from Settings.">
            <textarea className="input font-mono text-xs" rows={7} value={d.pixelScript} onChange={(e) => set("pixelScript", e.target.value)} placeholder="<script>…</script>" />
          </Field>
          <Field label="Inject pixel into">
            <select className="input" value={d.pixelPlacement} onChange={(e) => set("pixelPlacement", e.target.value)}>
              <option value="head">&lt;head&gt;</option><option value="body">End of &lt;body&gt;</option>
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Offer name (internal)"><input className="input" value={d.offerName} onChange={(e) => set("offerName", e.target.value)} /></Field>
            <Field label="Offer payout ($)"><input type="number" step="0.01" min="0" className="input" value={d.payout} onChange={(e) => set("payout", Number(e.target.value))} /></Field>
          </div>
          <Field label="Target GEOs (internal reference)">
            <div className="flex flex-wrap gap-2">
              {GEO_OPTIONS.map((g) => {
                const on = d.geos.includes(g);
                return (
                  <button type="button" key={g} onClick={() => set("geos", on ? d.geos.filter((x) => x !== g) : [...d.geos, g])} className={`rounded-full border px-3 py-1 text-sm ${on ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white"}`}>{g}</button>
                );
              })}
            </div>
          </Field>
          <Field label="Internal notes"><textarea className="input" rows={3} value={d.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} placeholder="Offer caps, network contact, compliance notes…" /></Field>
        </Section>
      )}

      {tab === "Hero" && (
        <Section title="Hero & pre-qualification hook">
          <Field label="Badge text"><input className="input" value={d.badgeText} onChange={(e) => set("badgeText", e.target.value)} /></Field>
          <Field label="Headline" hint="Match the long-tail search intent of your ad group."><input className="input" value={d.headline} onChange={(e) => set("headline", e.target.value)} /></Field>
          <Field label="Subheadline"><textarea className="input" rows={2} value={d.subheadline} onChange={(e) => set("subheadline", e.target.value)} /></Field>
          <Field label="Key benefit bullets"><ListEditor items={d.heroBullets} onChange={(v) => set("heroBullets", v)} addLabel="Add bullet" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary CTA button text"><input className="input" value={d.ctaText} onChange={(e) => set("ctaText", e.target.value)} /></Field>
            <Field label="Text under CTA (optional)"><input className="input" value={d.ctaSubtext} onChange={(e) => set("ctaSubtext", e.target.value)} placeholder="e.g. Free plan available · No card required" /></Field>
          </div>
        </Section>
      )}

      {tab === "Comparison" && (
        <Section title="Comparison table builder">
          <Field label="Section title"><input className="input" value={d.comparisonTitle} onChange={(e) => set("comparisonTitle", e.target.value)} placeholder="Side-by-side comparison" /></Field>
          <ComparisonBuilder columns={d.comparisonColumns} rows={d.comparisonRows} onChange={(cols, rows) => setD((p) => ({ ...p, comparisonColumns: cols, comparisonRows: rows }))} />
        </Section>
      )}

      {tab === "Body & Pros/Cons" && (
        <>
          <Section title="In-depth breakdown" description="Cover how it works, who it's for, pricing and limitations. Use ## headings.">
            <MarkdownEditor value={d.body} onChange={(v) => set("body", v)} target={[600, 900]} />
          </Section>
          <Section title="Pros & cons">
            <div className="grid gap-6 lg:grid-cols-2">
              <Field label="Pros"><ListEditor items={d.pros} onChange={(v) => set("pros", v)} addLabel="Add pro" /></Field>
              <Field label="Cons"><ListEditor items={d.cons} onChange={(v) => set("cons", v)} addLabel="Add con" /></Field>
            </div>
            <Field label="Verdict (optional closing box with CTA)"><textarea className="input" rows={3} value={d.verdict} onChange={(e) => set("verdict", e.target.value)} /></Field>
          </Section>
        </>
      )}

      {tab === "Modules" && (
        <Section title="Module toggles">
          <Toggle checked={d.showComparison} onChange={(v) => set("showComparison", v)} label="Comparison table" />
          <Toggle checked={d.showStickyCta} onChange={(v) => set("showStickyCta", v)} label="Sticky mobile CTA bar" hint="Fixed CTA button at the bottom of the screen on phones." />
          <Toggle checked={d.showEmailCapture} onChange={(v) => set("showEmailCapture", v)} label="Email capture box" hint="Collected emails appear under Admin → Leads." />
          {d.showEmailCapture && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email box headline"><input className="input" value={d.emailHeadline} onChange={(e) => set("emailHeadline", e.target.value)} /></Field>
              <Field label="Email box subtext"><input className="input" value={d.emailSubtext} onChange={(e) => set("emailSubtext", e.target.value)} /></Field>
            </div>
          )}
        </Section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:left-[230px]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <p className={`text-sm ${msg ? (msg.ok ? "text-green-700" : "text-red-600") : "text-ink-mute"}`}>
            {msg?.text ?? (d.status === "published" ? "This page is live." : "Draft — not publicly visible.")}
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-outline" disabled={pending} onClick={() => save("draft")}>Save draft</button>
            <button type="button" className="btn-primary" disabled={pending} onClick={() => save("published")}>{pending ? "Saving…" : d.status === "published" ? "Update live page" : "Publish"}</button>
          </div>
        </div>
      </div>
    </form>
  );
}
