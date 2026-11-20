"use client";
import { cloneElement, isValidElement, useId, useMemo, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { wordCount } from "@/lib/utils";

const FORM_TAGS = new Set(["input", "select", "textarea"]);

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  // Associate the label with a single native form control child.
  const control =
    isValidElement<{ id?: string; "aria-describedby"?: string }>(children) && typeof children.type === "string" && FORM_TAGS.has(children.type)
      ? cloneElement(children, { id: children.props.id ?? id, "aria-describedby": hintId })
      : null;
  return (
    <div>
      {control ? <label className="label" htmlFor={control.props.id}>{label}</label> : <p className="label">{label}</p>}
      {control ?? children}
      {hint && <p id={hintId} className="hint">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 hover:bg-gray-50">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-brand-600" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-ink-mute">{hint}</span>}
      </span>
    </label>
  );
}

function move<T>(arr: T[], from: number, to: number) {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}
export { move };

export function IconBtn({ onClick, label, children, danger }: { onClick: () => void; label: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line bg-white text-sm ${danger ? "text-red-600 hover:bg-red-50" : "text-ink-soft hover:bg-gray-100"}`}>
      {children}
    </button>
  );
}

/** Add / remove / reorder a list of strings. */
export function ListEditor({ items, onChange, placeholder, addLabel = "Add item" }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string }) {
  return (
    <div className="grid gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input className="input" value={item} placeholder={placeholder} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <IconBtn label="Move up" onClick={() => onChange(move(items, i, i - 1))}>↑</IconBtn>
          <IconBtn label="Move down" onClick={() => onChange(move(items, i, i + 1))}>↓</IconBtn>
          <IconBtn label="Remove" danger onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</IconBtn>
        </div>
      ))}
      <div><button type="button" className="btn-outline text-xs" onClick={() => onChange([...items, ""])}>+ {addLabel}</button></div>
    </div>
  );
}

/** Markdown textarea with live preview and word count. */
export function MarkdownEditor({ value, onChange, rows = 22, target }: { value: string; onChange: (v: string) => void; rows?: number; target?: [number, number] }) {
  const [tab, setTab] = useState<"write" | "split" | "preview">("split");
  const html = useMemo(() => (tab === "write" ? "" : renderMarkdown(value).html), [value, tab]);
  const words = wordCount(value);
  const inRange = target ? words >= target[0] && words <= target[1] : true;
  return (
    <div className="rounded-lg border border-line">
      <div className="flex items-center justify-between border-b border-line bg-gray-50 px-3 py-2">
        <div className="flex gap-1 text-xs">
          {(["write", "split", "preview"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`rounded px-2 py-1 capitalize ${tab === t ? "bg-white font-semibold shadow-sm" : "text-ink-mute"}`}>{t}</button>
          ))}
        </div>
        <span className={`text-xs ${inRange ? "text-ink-mute" : "font-medium text-amber-700"}`}>
          {words} words{target ? ` · target ${target[0]}–${target[1]}` : ""}
        </span>
      </div>
      <div className={tab === "split" ? "grid lg:grid-cols-2" : ""}>
        {tab !== "preview" && (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="block w-full resize-y border-0 p-3 font-mono text-[13px] leading-6 focus:outline-none focus:ring-0" placeholder="## Heading&#10;&#10;Write in Markdown…" />
        )}
        {tab !== "write" && (
          <div className="max-h-[640px] overflow-y-auto border-t border-line p-4 lg:border-l lg:border-t-0">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </div>
      <p className="border-t border-line px-3 py-1.5 text-[11px] text-ink-mute">
        Markdown: ## Heading · **bold** · *italic* · [link](/articles/slug) · - bullet · 1. numbered · | table | — H2/H3 headings build the table of contents.
      </p>
    </div>
  );
}
