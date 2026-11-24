import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { OfferLinkForm } from "@/components/admin/OfferLinkForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteOfferLink } from "../../actions";

export default async function OfferLinksPage() {
  const [links, articles] = await Promise.all([
    prisma.offerLink.findMany({ orderBy: { key: "asc" } }),
    prisma.article.findMany({ select: { title: true, slug: true, content: true } }),
  ]);
  const usedIn = (key: string) => articles.filter((a) => a.content.toLowerCase().includes(`(offer:${key}`)).map((a) => a.title);
  return (
    <>
      <PageHeader
        title="Offer links"
        description="Paste each affiliate tracking link once. Articles use it via [text](offer:key) and update instantly. Empty link = text shows without a link."
      />
      <div className="grid gap-3">
        {links.map((l) => {
          const uses = usedIn(l.key);
          return (
            <div key={l.id} className="card p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <p>
                  <span className="font-semibold">{l.label || l.key}</span>{" "}
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">offer:{l.key}</code>{" "}
                  {l.url ? <span className="badge bg-green-100 text-green-800">Live</span> : <span className="badge bg-amber-100 text-amber-900">Link needed</span>}
                  {l.campaignId && <span className="ml-2 text-xs text-ink-mute">MyLead campaign {l.campaignId}</span>}
                </p>
                <form action={deleteOfferLink}><input type="hidden" name="id" value={l.id} /><ConfirmButton message={`Delete offer:${l.key}? Articles will show plain text.`} className="text-xs text-red-600 underline">Delete</ConfirmButton></form>
              </div>
              <p className="mb-3 text-xs text-ink-mute">Used in: {uses.length ? uses.join(" · ") : "no articles yet"}</p>
              <OfferLinkForm link={{ key: l.key, label: l.label, url: l.url, campaignId: l.campaignId, notes: l.notes }} />
            </div>
          );
        })}
      </div>
      <h2 className="mt-10 text-lg font-semibold">Add a new offer link</h2>
      <div className="card mt-3 p-4"><OfferLinkForm link={{ key: "", label: "", url: "", campaignId: "", notes: "" }} isNew /></div>
    </>
  );
}
