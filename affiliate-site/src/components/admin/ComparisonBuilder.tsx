"use client";
import type { ComparisonRow } from "@/lib/landing";
import { IconBtn, move } from "./fields";

export function ComparisonBuilder({
  columns,
  rows,
  onChange,
}: {
  columns: string[];
  rows: ComparisonRow[];
  onChange: (columns: string[], rows: ComparisonRow[]) => void;
}) {
  const setCols = (cols: string[], remap?: (cells: string[]) => string[]) =>
    onChange(cols, remap ? rows.map((r) => ({ ...r, cells: remap(r.cells) })) : rows);

  const addColumn = () => setCols([...columns, "New column"], (cells) => [...cells, ""]);
  const removeColumn = (i: number) => setCols(columns.filter((_, j) => j !== i), (cells) => cells.filter((_, j) => j !== i));
  const moveColumn = (i: number, to: number) => {
    if (to < 0 || to >= columns.length) return;
    setCols(move(columns, i, to), (cells) => {
      const padded = columns.map((_, j) => cells[j] ?? "");
      return move(padded, i, to);
    });
  };

  const updateRow = (i: number, patch: Partial<ComparisonRow>) => onChange(columns, rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addRow = () => onChange(columns, [...rows, { name: "", tagline: "", rating: 4, highlight: rows.length === 0, cells: columns.map(() => ""), ctaUrl: "", ctaLabel: "" }]);
  const setHighlight = (i: number) => onChange(columns, rows.map((r, j) => ({ ...r, highlight: j === i })));

  return (
    <div className="grid gap-5">
      <div>
        <p className="label">Columns</p>
        <p className="hint mb-2 mt-0">“Tool / Provider”, “Rating” and the CTA button are always included. Add the comparison columns in between (e.g. Best For, Pricing / Free Trial, Key Advantage).</p>
        <div className="grid gap-2">
          {columns.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input className="input" value={c} onChange={(e) => setCols(columns.map((x, j) => (j === i ? e.target.value : x)))} />
              <IconBtn label="Move left" onClick={() => moveColumn(i, i - 1)}>←</IconBtn>
              <IconBtn label="Move right" onClick={() => moveColumn(i, i + 1)}>→</IconBtn>
              <IconBtn label="Remove column" danger onClick={() => removeColumn(i)}>✕</IconBtn>
            </div>
          ))}
          <div><button type="button" className="btn-outline text-xs" onClick={addColumn}>+ Add column</button></div>
        </div>
      </div>

      <div>
        <p className="label">Rows (offers being compared)</p>
        <div className="grid gap-3">
          {rows.map((r, i) => (
            <div key={i} className={`rounded-lg border p-4 ${r.highlight ? "border-brand-500 bg-brand-50/40" : "border-line"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input type="radio" name="highlight-row" checked={!!r.highlight} onChange={() => setHighlight(i)} /> Primary recommended offer
                </label>
                <div className="flex gap-2">
                  <IconBtn label="Move up" onClick={() => onChange(columns, move(rows, i, i - 1))}>↑</IconBtn>
                  <IconBtn label="Move down" onClick={() => onChange(columns, move(rows, i, i + 1))}>↓</IconBtn>
                  <IconBtn label="Remove row" danger onClick={() => onChange(columns, rows.filter((_, j) => j !== i))}>✕</IconBtn>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_100px]">
                <div><span className="text-xs text-ink-mute">Tool / provider name</span><input className="input" value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })} /></div>
                <div><span className="text-xs text-ink-mute">Short tagline</span><input className="input" value={r.tagline ?? ""} onChange={(e) => updateRow(i, { tagline: e.target.value })} /></div>
                <div><span className="text-xs text-ink-mute">Rating (0–5)</span><input type="number" step="0.1" min="0" max="5" className="input" value={r.rating} onChange={(e) => updateRow(i, { rating: Number(e.target.value) })} /></div>
              </div>
              {columns.length > 0 && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {columns.map((c, ci) => (
                    <div key={ci}><span className="text-xs text-ink-mute">{c || `Column ${ci + 1}`}</span>
                      <input className="input" value={r.cells[ci] ?? ""} onChange={(e) => { const cells = columns.map((_, j) => r.cells[j] ?? ""); cells[ci] = e.target.value; updateRow(i, { cells }); }} />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px]">
                <div><span className="text-xs text-ink-mute">CTA URL override (optional — defaults to the page’s BeMob CTA URL)</span><input className="input font-mono text-xs" value={r.ctaUrl ?? ""} placeholder="Leave blank to use primary BeMob CTA URL" onChange={(e) => updateRow(i, { ctaUrl: e.target.value })} /></div>
                <div><span className="text-xs text-ink-mute">Button label</span><input className="input" value={r.ctaLabel ?? ""} placeholder="View offer" onChange={(e) => updateRow(i, { ctaLabel: e.target.value })} /></div>
              </div>
            </div>
          ))}
          <div><button type="button" className="btn-outline text-xs" onClick={addRow}>+ Add row</button></div>
        </div>
      </div>
    </div>
  );
}
