import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { deleteLead } from "../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const { source } = await searchParams;
  const [leads, sources] = await Promise.all([
    prisma.lead.findMany({ where: source ? { sourceSlug: source } : {}, orderBy: { createdAt: "desc" }, take: 1000 }),
    prisma.lead.groupBy({ by: ["sourceSlug"], _count: { _all: true } }),
  ]);
  const exportHref = `/api/admin/leads/export${source ? `?source=${encodeURIComponent(source)}` : ""}`;
  return (
    <>
      <PageHeader title="Leads" description="Emails collected from landing page capture boxes." actions={<a href={exportHref} className="btn-primary">Export CSV</a>} />
      <form className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="source" className="text-ink-mute">Filter by source page</label>
        <select id="source" name="source" defaultValue={source ?? ""} className="input w-auto">
          <option value="">All pages</option>
          {sources.map((s) => <option key={s.sourceSlug} value={s.sourceSlug}>{s.sourceSlug} ({s._count._all})</option>)}
        </select>
        <button className="btn-outline">Apply</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-ink-mute"><tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Source page</th><th className="px-4 py-3">Consent</th><th className="px-4 py-3">Captured</th><th className="px-4 py-3" /></tr></thead>
          <tbody className="divide-y divide-line">
            {leads.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 font-medium">{l.email}</td>
                <td className="px-4 py-3"><a href={`/offers/${l.sourceSlug}`} target="_blank" className="hover:underline">/offers/{l.sourceSlug}</a></td>
                <td className="px-4 py-3">{l.consent ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-ink-mute">{l.createdAt.toLocaleString()}</td>
                <td className="px-4 py-3 text-right"><form action={deleteLead}><input type="hidden" name="id" value={l.id} /><ConfirmButton message="Delete this lead (e.g. GDPR erasure request)?" className="text-xs text-red-600 underline">Delete</ConfirmButton></form></td>
              </tr>
            ))}
            {leads.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-mute">No leads yet. Enable “Email capture box” on a landing page to start collecting.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
