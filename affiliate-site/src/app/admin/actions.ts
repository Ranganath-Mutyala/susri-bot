"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIES } from "@/lib/categories";
import type { ComparisonRow } from "@/lib/landing";
import { slugify } from "@/lib/utils";

type Result = { ok: true; id: string } | { ok: false; error: string };

const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as string[];
const COMPLIANCE_SLUGS = ["about", "contact", "privacy-policy", "affiliate-disclosure", "terms"];

function isHttpUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

const strList = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => String(x ?? "").trim()).filter(Boolean).slice(0, 50) : [];

/* ------------------------------------------------------------------ */
/* Landing pages                                                       */
/* ------------------------------------------------------------------ */

export type LandingPayload = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
  offerName: string;
  ctaUrl: string;
  pixelScript: string;
  pixelPlacement: string;
  passthroughParams: boolean;
  payout: number;
  geos: string[];
  internalNotes: string;
  badgeText: string;
  headline: string;
  subheadline: string;
  heroBullets: string[];
  ctaText: string;
  ctaSubtext: string;
  comparisonTitle: string;
  comparisonColumns: string[];
  comparisonRows: ComparisonRow[];
  body: string;
  pros: string[];
  cons: string[];
  verdict: string;
  showComparison: boolean;
  showEmailCapture: boolean;
  showStickyCta: boolean;
  emailHeadline: string;
  emailSubtext: string;
};

export async function saveLandingPage(input: LandingPayload): Promise<Result> {
  await requireAdmin();
  const slug = slugify(input.slug || input.title);
  if (!input.title.trim()) return { ok: false, error: "Page title is required." };
  if (!slug) return { ok: false, error: "A valid URL slug is required." };
  if (!CATEGORY_SLUGS.includes(input.category)) return { ok: false, error: "Choose a niche category." };
  if (input.ctaUrl && !isHttpUrl(input.ctaUrl.trim())) return { ok: false, error: "BeMob CTA URL must start with https://" };
  if (input.status === "published" && !input.ctaUrl.trim()) return { ok: false, error: "Add a BeMob CTA URL before publishing." };

  const clash = await prisma.landingPage.findFirst({ where: { slug, NOT: input.id ? { id: input.id } : undefined } });
  if (clash) return { ok: false, error: `The slug "${slug}" is already used by another landing page.` };

  const columns = strList(input.comparisonColumns);
  const rows: ComparisonRow[] = (input.comparisonRows ?? []).slice(0, 20).map((r) => ({
    name: String(r.name ?? "").trim(),
    tagline: String(r.tagline ?? "").trim(),
    highlight: Boolean(r.highlight),
    rating: Math.max(0, Math.min(5, Number(r.rating) || 0)),
    cells: columns.map((_, i) => String(r.cells?.[i] ?? "").trim()),
    ctaUrl: String(r.ctaUrl ?? "").trim(),
    ctaLabel: String(r.ctaLabel ?? "").trim(),
  })).filter((r) => r.name);
  for (const r of rows) if (r.ctaUrl && !isHttpUrl(r.ctaUrl)) return { ok: false, error: `Row "${r.name}" has an invalid CTA URL.` };

  const data = {
    slug,
    title: input.title.trim(),
    category: input.category,
    status: input.status === "published" ? "published" : "draft",
    metaTitle: input.metaTitle.trim(),
    metaDescription: input.metaDescription.trim(),
    offerName: input.offerName.trim(),
    ctaUrl: input.ctaUrl.trim(),
    pixelScript: input.pixelScript,
    pixelPlacement: input.pixelPlacement === "body" ? "body" : "head",
    passthroughParams: Boolean(input.passthroughParams),
    payout: Number(input.payout) || 0,
    geos: JSON.stringify(strList(input.geos)),
    internalNotes: input.internalNotes,
    badgeText: input.badgeText.trim(),
    headline: input.headline.trim(),
    subheadline: input.subheadline.trim(),
    heroBullets: JSON.stringify(strList(input.heroBullets)),
    ctaText: input.ctaText.trim() || "Check Availability",
    ctaSubtext: input.ctaSubtext.trim(),
    comparisonTitle: input.comparisonTitle.trim(),
    comparisonColumns: JSON.stringify(columns),
    comparisonRows: JSON.stringify(rows),
    body: input.body,
    pros: JSON.stringify(strList(input.pros)),
    cons: JSON.stringify(strList(input.cons)),
    verdict: input.verdict.trim(),
    showComparison: Boolean(input.showComparison),
    showEmailCapture: Boolean(input.showEmailCapture),
    showStickyCta: Boolean(input.showStickyCta),
    emailHeadline: input.emailHeadline.trim(),
    emailSubtext: input.emailSubtext.trim(),
  };

  const saved = input.id
    ? await prisma.landingPage.update({ where: { id: input.id }, data })
    : await prisma.landingPage.create({ data });
  revalidatePath("/", "layout");
  return { ok: true, id: saved.id };
}

export async function duplicateLandingPage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const src = await prisma.landingPage.findUnique({ where: { id } });
  if (!src) return;
  let slug = `${src.slug}-copy`;
  for (let n = 2; await prisma.landingPage.findUnique({ where: { slug } }); n++) slug = `${src.slug}-copy-${n}`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt, updatedAt, ...rest } = src;
  const copy = await prisma.landingPage.create({ data: { ...rest, slug, title: `${src.title} (Copy)`, status: "draft" } });
  revalidatePath("/admin/landing-pages");
  redirect(`/admin/landing-pages/${copy.id}`);
}

export async function toggleLandingStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const lp = await prisma.landingPage.findUnique({ where: { id } });
  if (!lp) return;
  if (lp.status !== "published" && !lp.ctaUrl) return; // can't publish without a CTA URL
  await prisma.landingPage.update({ where: { id }, data: { status: lp.status === "published" ? "draft" : "published" } });
  revalidatePath("/", "layout");
}

export async function deleteLandingPage(formData: FormData) {
  await requireAdmin();
  await prisma.landingPage.delete({ where: { id: String(formData.get("id")) } }).catch(() => null);
  revalidatePath("/", "layout");
  redirect("/admin/landing-pages");
}

/** 30-second offer swap: update the live CTA URL / offer name without touching anything else. */
export async function quickSwapOffer(_prev: unknown, formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const ctaUrl = String(formData.get("ctaUrl") ?? "").trim();
  const offerName = String(formData.get("offerName") ?? "").trim();
  if (!isHttpUrl(ctaUrl)) return { ok: false, message: "Enter a valid https:// URL" };
  await prisma.landingPage.update({ where: { id }, data: { ctaUrl, ...(offerName ? { offerName } : {}) } });
  revalidatePath("/", "layout");
  return { ok: true, message: "Live — updated " + new Date().toLocaleTimeString() };
}

/* ------------------------------------------------------------------ */
/* Articles                                                            */
/* ------------------------------------------------------------------ */

export type ArticlePayload = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  content: string;
  status: string;
  featured: boolean;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  authorName: string;
  authorRole: string;
  authorBio: string;
};

export async function saveArticle(input: ArticlePayload): Promise<Result> {
  await requireAdmin();
  const slug = slugify(input.slug || input.title);
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  if (!slug) return { ok: false, error: "A valid slug is required." };
  if (!CATEGORY_SLUGS.includes(input.category)) return { ok: false, error: "Choose a category." };
  const clash = await prisma.article.findFirst({ where: { slug, NOT: input.id ? { id: input.id } : undefined } });
  if (clash) return { ok: false, error: `The slug "${slug}" is already in use.` };

  const existing = input.id ? await prisma.article.findUnique({ where: { id: input.id } }) : null;
  const status = input.status === "published" ? "published" : "draft";
  const data = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    category: input.category,
    content: input.content,
    status,
    featured: Boolean(input.featured),
    coverImage: input.coverImage.trim(),
    metaTitle: input.metaTitle.trim(),
    metaDescription: input.metaDescription.trim(),
    authorName: input.authorName.trim() || "Editorial Team",
    authorRole: input.authorRole.trim(),
    authorBio: input.authorBio.trim(),
    publishedAt: status === "published" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
  };
  const saved = input.id
    ? await prisma.article.update({ where: { id: input.id }, data })
    : await prisma.article.create({ data });
  revalidatePath("/", "layout");
  return { ok: true, id: saved.id };
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  await prisma.article.delete({ where: { id: String(formData.get("id")) } }).catch(() => null);
  revalidatePath("/", "layout");
  redirect("/admin/articles");
}

export async function toggleArticleStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const a = await prisma.article.findUnique({ where: { id } });
  if (!a) return;
  const publish = a.status !== "published";
  await prisma.article.update({
    where: { id },
    data: { status: publish ? "published" : "draft", publishedAt: publish ? a.publishedAt ?? new Date() : a.publishedAt },
  });
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ */
/* Settings & compliance pages                                         */
/* ------------------------------------------------------------------ */

export async function saveSettings(_prev: unknown, formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const f = (k: string) => String(formData.get(k) ?? "");
  const siteName = f("siteName").trim();
  if (!siteName) return { ok: false, message: "Site name is required." };
  const data = {
    siteName,
    tagline: f("tagline").trim(),
    logoUrl: f("logoUrl").trim(),
    footerText: f("footerText").trim(),
    contactEmail: f("contactEmail").trim(),
    contactPhone: f("contactPhone").trim(),
    contactAddress: f("contactAddress").trim(),
    globalPixel: f("globalPixel"),
    headScripts: f("headScripts"),
  };
  await prisma.setting.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}

export async function savePage(_prev: unknown, formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const slug = String(formData.get("slug"));
  if (!COMPLIANCE_SLUGS.includes(slug)) return { ok: false, message: "Unknown page." };
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  if (!title || !content.trim()) return { ok: false, message: "Title and content are required." };
  await prisma.page.upsert({ where: { slug }, update: { title, content, metaDescription }, create: { slug, title, content, metaDescription } });
  revalidatePath(`/${slug}`);
  return { ok: true, message: `“${title}” saved.` };
}

/* ------------------------------------------------------------------ */
/* Leads & messages                                                    */
/* ------------------------------------------------------------------ */

export async function deleteLead(formData: FormData) {
  await requireAdmin();
  await prisma.lead.delete({ where: { id: String(formData.get("id")) } }).catch(() => null);
  revalidatePath("/admin/leads");
}

export async function toggleMessageRead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const m = await prisma.contactMessage.findUnique({ where: { id } });
  if (m) await prisma.contactMessage.update({ where: { id }, data: { read: !m.read } });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id: String(formData.get("id")) } }).catch(() => null);
  revalidatePath("/admin/messages");
}
