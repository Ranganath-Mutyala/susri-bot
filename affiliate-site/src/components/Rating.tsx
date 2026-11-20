export function Rating({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const pct = (v / 5) * 100;
  const text = size === "lg" ? "text-xl" : "text-sm";
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${v.toFixed(1)} out of 5`}>
      <span className={`relative inline-block leading-none ${text}`} aria-hidden>
        <span className="text-gray-300">★★★★★</span>
        <span className="absolute inset-0 overflow-hidden text-amber-500" style={{ width: `${pct}%` }}>★★★★★</span>
      </span>
      <span className={`font-semibold text-ink ${size === "lg" ? "text-lg" : "text-sm"}`}>{v.toFixed(1)}</span>
    </span>
  );
}
