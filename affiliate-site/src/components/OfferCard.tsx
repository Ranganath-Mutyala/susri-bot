import Link from "next/link";
import type { LandingPage } from "@prisma/client";
import { categoryName } from "@/lib/categories";

export function OfferCard({ lp }: { lp: LandingPage }) {
  return (
    <article className="card group flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">{categoryName(lp.category)}</p>
        {lp.badgeText && <span className="badge bg-brand-50 text-brand-700">{lp.badgeText}</span>}
      </div>
      <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-ink group-hover:text-brand-700">
        <Link href={`/offers/${lp.slug}`}>{lp.headline || lp.title}</Link>
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-ink-soft">{lp.subheadline}</p>
      <Link href={`/offers/${lp.slug}`} className="mt-4 text-sm font-semibold text-brand-700">
        See the comparison →
      </Link>
    </article>
  );
}
