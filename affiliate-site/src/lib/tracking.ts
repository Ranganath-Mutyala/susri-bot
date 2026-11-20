/**
 * Incoming ad-click parameters that may be forwarded to the BeMob CTA URL.
 * Forwarding happens server-side when the page is rendered, so every CTA is a
 * plain single-hop <a href> — no JavaScript redirect chain.
 */
const PASSTHROUGH_EXACT = new Set([
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "fbclid",
  "keyword",
  "creative",
  "matchtype",
  "network",
  "device",
  "placement",
  "campaignid",
  "adgroupid",
  "targetid",
  "loc_physical_ms",
  "lpurl",
]);

export function pickPassthroughParams(
  searchParams: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(searchParams)) {
    const k = key.toLowerCase();
    if (!(PASSTHROUGH_EXACT.has(k) || k.startsWith("utm_"))) continue;
    const v = Array.isArray(raw) ? raw[0] : raw;
    if (typeof v === "string" && v.length > 0 && v.length <= 500) out[key] = v;
  }
  return out;
}

export function buildCtaHref(baseUrl: string, params: Record<string, string>) {
  if (!baseUrl) return "#";
  if (Object.keys(params).length === 0) return baseUrl;
  try {
    const url = new URL(baseUrl);
    for (const [k, v] of Object.entries(params)) {
      if (!url.searchParams.has(k)) url.searchParams.set(k, v);
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}
