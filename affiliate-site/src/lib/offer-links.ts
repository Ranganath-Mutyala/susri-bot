import { cache } from "react";
import { prisma } from "./db";

export type OfferLinkMap = Record<string, { url: string; label: string }>;

/** All offer links keyed by their short key (e.g. "nordvpn"), loaded once per request. */
export const getOfferLinkMap = cache(async (): Promise<OfferLinkMap> => {
  const rows = await prisma.offerLink.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, { url: r.url, label: r.label }]));
});
