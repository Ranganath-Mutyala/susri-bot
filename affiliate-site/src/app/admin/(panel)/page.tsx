import Link from "next/link";
import { prisma } from "@/lib/db";
import { categoryName } from "@/lib/categories";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { QuickSwap } from "@/components/admin/QuickSwap";

export default async function Dashboard() {
  const [lpCount, lpLive, artCount, artLive, leadCount, unread, pages, leads] = await Promise.all([
    prisma.landingPage.count(),
    prisma.landingPage.count({ where: { status: "published" } }),
    prisma.article.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.lead.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.landingPage.findMany({ orderBy: { updatedAt: "desc" }, take: 8 }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const stats = [
    { label: "Landing pages", value: lpCount, sub: `${lpLive} published`, href: "/admin/landing-pages" },
    { label: "Articles", value: artCount, sub: `${artLive} published`, href: "/admin/articles" },
    { label: "Leads captured", value: leadCount, sub: "all time", href: "/admin/leads" },
    { label: "Unread messages", value: unread, sub: "contact form", href: "/admin/messages" },
  ];
  return (
    <>
      <PageHeader title="Dashboard" description="Manage offers, content and compliance in one place." actions={<Link href="/admin/landing-pages/new" className="btn-primary">+ New landing page</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 hover:shadow-sm">
            <p className="text-sm text-ink-mute">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
            <p className="text-xs text-ink-mute">{s.sub}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">30-second offer swap</h2>
      <p className="text-sm text-ink-mute">Change the live BeMob CTA URL of any landing page. Takes effect immediately — no redeploy.</p>
      <div className="mt-4 grid gap-3">
        {pages.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              <Link href={`/admin/landing-pages/${p.id}`} className="font-semibold hover:underline">{p.title}</Link>
              <StatusBadge status={p.status} />
              <span className="text-ink-mute">{categoryName(p.category)} · /offers/{p.slug}</span>
            </div>
            <QuickSwap id={p.id} ctaUrl={p.ctaUrl} offerName={p.offerName} />
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Latest leads</h2>
      <div className="card mt-3 divide-y divide-line">
        {leads.length === 0 && <p className="p-4 text-sm text-ink-mute">No leads yet.</p>}
        {leads.map((l) => (
          <div key={l.id} className="flex justify-between p-3 text-sm">
            <span>{l.email}</span>
            <span className="text-ink-mute">{l.sourceSlug} · {l.createdAt.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </>
  );
}
