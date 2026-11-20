import Link from "next/link";
import { prisma } from "@/lib/db";
import { categoryName } from "@/lib/categories";
import { parseJson } from "@/lib/utils";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { duplicateLandingPage, toggleLandingStatus } from "../../actions";

export default async function LandingPagesList() {
  const pages = await prisma.landingPage.findMany({ orderBy: { updatedAt: "desc" }, include: { _count: { select: { leads: true } } } });
  return (
    <>
      <PageHeader title="Landing pages" description="Offer-specific pre-qualification pages for paid traffic." actions={<Link href="/admin/landing-pages/new" className="btn-primary">+ New landing page</Link>} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-ink-mute">
            <tr><th className="px-4 py-3">Page</th><th className="px-4 py-3">Niche</th><th className="px-4 py-3">Offer / Payout</th><th className="px-4 py-3">GEOs</th><th className="px-4 py-3">Leads</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pages.map((p) => (
              <tr key={p.id} className="align-top">
                <td className="px-4 py-3">
                  <Link href={`/admin/landing-pages/${p.id}`} className="font-semibold hover:underline">{p.title}</Link>
                  <p className="text-xs text-ink-mute">/offers/{p.slug}</p>
                  {!p.ctaUrl && <p className="text-xs font-medium text-red-600">No CTA URL set</p>}
                </td>
                <td className="px-4 py-3">{categoryName(p.category)}</td>
                <td className="px-4 py-3">{p.offerName || "—"}<p className="text-xs text-ink-mute">${p.payout.toFixed(2)}</p></td>
                <td className="px-4 py-3 text-xs">{parseJson<string[]>(p.geos, []).join(", ") || "—"}</td>
                <td className="px-4 py-3">{p._count.leads}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/landing-pages/${p.id}`} className="btn-outline px-2.5 py-1 text-xs">Edit</Link>
                    <a href={`/offers/${p.slug}`} target="_blank" className="btn-outline px-2.5 py-1 text-xs">{p.status === "published" ? "View" : "Preview"}</a>
                    <form action={toggleLandingStatus}><input type="hidden" name="id" value={p.id} /><button className="btn-outline px-2.5 py-1 text-xs" disabled={p.status !== "published" && !p.ctaUrl}>{p.status === "published" ? "Unpublish" : "Publish"}</button></form>
                    <form action={duplicateLandingPage}><input type="hidden" name="id" value={p.id} /><button className="btn-outline px-2.5 py-1 text-xs">Duplicate</button></form>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-mute">No landing pages yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
