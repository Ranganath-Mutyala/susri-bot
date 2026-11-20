import type { LandingPage } from "@prisma/client";
import { parseJson } from "./utils";

export type ComparisonRow = {
  name: string;
  tagline?: string;
  highlight?: boolean;
  rating: number;
  cells: string[];
  ctaUrl?: string;
  ctaLabel?: string;
};

export type LandingData = Omit<
  LandingPage,
  "geos" | "heroBullets" | "comparisonColumns" | "comparisonRows" | "pros" | "cons"
> & {
  geos: string[];
  heroBullets: string[];
  comparisonColumns: string[];
  comparisonRows: ComparisonRow[];
  pros: string[];
  cons: string[];
};

export function parseLanding(lp: LandingPage): LandingData {
  return {
    ...lp,
    geos: parseJson<string[]>(lp.geos, []),
    heroBullets: parseJson<string[]>(lp.heroBullets, []),
    comparisonColumns: parseJson<string[]>(lp.comparisonColumns, []),
    comparisonRows: parseJson<ComparisonRow[]>(lp.comparisonRows, []),
    pros: parseJson<string[]>(lp.pros, []),
    cons: parseJson<string[]>(lp.cons, []),
  };
}

export const GEO_OPTIONS = ["US", "UK", "CA", "AU"] as const;
