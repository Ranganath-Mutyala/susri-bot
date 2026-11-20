import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, offers] = await Promise.all([
    prisma.article.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    prisma.landingPage.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
  ]);
  const staticPaths = ["", "/articles", "/about", "/contact", "/privacy-policy", "/affiliate-disclosure", "/terms", ...CATEGORIES.map((c) => `/${c.slug}`)];
  return [
    ...staticPaths.map((p) => ({ url: siteUrl(p || "/") })),
    ...articles.map((a) => ({ url: siteUrl(`/articles/${a.slug}`), lastModified: a.updatedAt })),
    ...offers.map((o) => ({ url: siteUrl(`/offers/${o.slug}`), lastModified: o.updatedAt })),
  ];
}
