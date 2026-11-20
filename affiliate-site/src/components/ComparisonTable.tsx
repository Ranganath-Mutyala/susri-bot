import type { ComparisonRow } from "@/lib/landing";
import { CtaLink } from "./CtaLink";
import { Rating } from "./Rating";

export function ComparisonTable({
  title,
  columns,
  rows,
  hrefFor,
}: {
  title?: string;
  columns: string[];
  rows: ComparisonRow[];
  hrefFor: (row: ComparisonRow) => string;
}) {
  if (!rows.length) return null;
  return (
    <section aria-labelledby="compare" className="mt-12">
      <h2 id="compare" className="font-serif text-2xl font-bold sm:text-3xl">{title || "Side-by-side comparison"}</h2>

      {/* Desktop / tablet table */}
      <div className="mt-6 hidden overflow-x-auto rounded-xl border border-line bg-white md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-ink-mute">
            <tr>
              <th scope="col" className="px-4 py-3">Tool / Provider</th>
              {columns.map((c, i) => <th key={i} scope="col" className="px-4 py-3">{c}</th>)}
              <th scope="col" className="px-4 py-3">Rating</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`border-t border-line align-top ${r.highlight ? "bg-brand-50/60" : ""}`}>
                <th scope="row" className="px-4 py-4">
                  {r.highlight && <span className="badge mb-1 bg-brand-600 text-white">Our top pick</span>}
                  <span className="block font-semibold text-ink">{r.name}</span>
                  {r.tagline && <span className="block text-xs font-normal text-ink-mute">{r.tagline}</span>}
                </th>
                {columns.map((_, ci) => <td key={ci} className="px-4 py-4 text-ink-soft">{r.cells[ci] ?? ""}</td>)}
                <td className="whitespace-nowrap px-4 py-4"><Rating value={r.rating} /></td>
                <td className="px-4 py-4">
                  <CtaLink href={hrefFor(r)} size="sm" className={r.highlight ? "" : "bg-ink hover:bg-ink-soft"}>
                    {r.ctaLabel || "View offer"}
                  </CtaLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 grid gap-4 md:hidden">
        {rows.map((r, i) => (
          <div key={i} className={`card p-4 ${r.highlight ? "border-brand-500 ring-1 ring-brand-500" : ""}`}>
            {r.highlight && <span className="badge mb-2 bg-brand-600 text-white">Our top pick</span>}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{r.name}</p>
                {r.tagline && <p className="text-xs text-ink-mute">{r.tagline}</p>}
              </div>
              <Rating value={r.rating} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              {columns.map((c, ci) => (
                <div key={ci} className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="text-ink-mute">{c}</dt>
                  <dd className="text-ink-soft">{r.cells[ci] ?? ""}</dd>
                </div>
              ))}
            </dl>
            <CtaLink href={hrefFor(r)} className={`mt-4 w-full ${r.highlight ? "" : "bg-ink hover:bg-ink-soft"}`}>
              {r.ctaLabel || "View offer"}
            </CtaLink>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-mute">
        Pricing and promotions can change. Always confirm current terms on the provider&apos;s website before you sign up.
      </p>
    </section>
  );
}
