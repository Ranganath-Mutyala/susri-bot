import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { parseLanding, type ComparisonRow } from "@/lib/landing";
import { renderMarkdown } from "@/lib/markdown";
import { buildCtaHref, pickPassthroughParams } from "@/lib/tracking";
import { getSettings } from "@/lib/settings";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ProsCons } from "@/components/ProsCons";
import { EmailCapture } from "@/components/EmailCapture";
import { Markdown } from "@/components/Markdown";
import { CtaLink } from "@/components/CtaLink";
import { PixelInjector } from "@/components/PixelInjector";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function load(slug: string, allowDraft: boolean) {
  const lp = await prisma.landingPage.findUnique({ where: { slug } });
  if (!lp) return null;
  if (lp.status !== "published" && !allowDraft) return null;
  return parseLanding(lp);
}

async function isAdmin() {
  const store = await cookies();
  return Boolean(await verifySessionToken(store.get(SESSION_COOKIE)?.value));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lp = await load((await params).slug, await isAdmin());
  if (!lp) return {};
  return {
    title: { absolute: lp.metaTitle || lp.headline || lp.title },
    description: lp.metaDescription || lp.subheadline,
    alternates: { canonical: `/offers/${lp.slug}` },
    robots: lp.status === "published" ? undefined : { index: false, follow: false },
  };
}

export default async function OfferPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const admin = await isAdmin();
  const lp = await load(slug, admin);
  if (!lp) notFound();
  const settings = await getSettings();

  // Ad click params are appended server-side so each CTA is a direct, single-hop link.
  const passthrough = lp.passthroughParams ? pickPassthroughParams(await searchParams) : {};
  const primaryHref = buildCtaHref(lp.ctaUrl, passthrough);
  const hrefFor = (row: ComparisonRow) => buildCtaHref(row.ctaUrl?.trim() || lp.ctaUrl, passthrough);
  const { html } = renderMarkdown(lp.body);
  const pixel = lp.pixelScript.trim() || settings.globalPixel.trim();

  return (
    <>
      {lp.status !== "published" && (
        <div className="bg-ink py-2 text-center text-xs font-medium text-white">
          Draft preview — only visible to logged-in admins.
        </div>
      )}

      <section className="border-b border-line bg-white">
        <div className="container-page py-10 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            {lp.badgeText && <span className="badge bg-brand-50 px-3 py-1 text-brand-700">{lp.badgeText}</span>}
            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{lp.headline || lp.title}</h1>
            {lp.subheadline && <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-ink-soft">{lp.subheadline}</p>}
            {lp.heroBullets.length > 0 && (
              <ul className="mx-auto mt-6 grid max-w-xl gap-2 text-left">
                {lp.heroBullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-base text-ink">
                    <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600 text-xs text-white">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex flex-col items-center gap-2">
              <CtaLink href={primaryHref} size="lg">{lp.ctaText || "Check Availability"} →</CtaLink>
              {lp.ctaSubtext && <p className="text-xs text-ink-mute">{lp.ctaSubtext}</p>}
            </div>
            <p className="mt-6 text-xs text-ink-mute">Reviewed by our editorial team · Last updated {formatDate(lp.updatedAt)}</p>
          </div>
        </div>
      </section>

      <div className="container-page">
        <div className="mx-auto max-w-4xl">
          {lp.showComparison && (
            <ComparisonTable title={lp.comparisonTitle} columns={lp.comparisonColumns} rows={lp.comparisonRows} hrefFor={hrefFor} />
          )}

          {lp.body && (
            <section className="mt-12">
              <Markdown html={html} />
            </section>
          )}

          <ProsCons pros={lp.pros} cons={lp.cons} />

          {lp.verdict && (
            <section aria-labelledby="verdict" className="card mt-12 p-6 sm:p-8">
              <h2 id="verdict" className="font-serif text-2xl font-bold">Our verdict</h2>
              <p className="mt-3 text-base leading-7 text-ink-soft">{lp.verdict}</p>
              <CtaLink href={primaryHref} size="lg" className="mt-6">{lp.ctaText || "Check Availability"} →</CtaLink>
            </section>
          )}

          {lp.showEmailCapture && <EmailCapture slug={lp.slug} headline={lp.emailHeadline} subtext={lp.emailSubtext} />}
        </div>
      </div>

      {lp.showStickyCta && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden">
          <CtaLink href={primaryHref} className="w-full py-3 text-base">{lp.ctaText || "Check Availability"} →</CtaLink>
        </div>
      )}

      {pixel && <PixelInjector html={pixel} placement={lp.pixelPlacement} id={`lp-${lp.id}`} />}
    </>
  );
}
