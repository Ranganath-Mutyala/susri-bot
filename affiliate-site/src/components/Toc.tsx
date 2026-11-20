import type { TocItem } from "@/lib/markdown";

export function Toc({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="Table of contents" className="card p-5">
      <p className="text-sm font-semibold text-ink">On this page</p>
      <ol className="mt-3 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.id} className={i.level === 3 ? "pl-4" : ""}>
            <a href={`#${i.id}`} className="text-ink-soft hover:text-brand-700">{i.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
