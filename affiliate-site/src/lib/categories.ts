export const CATEGORIES = [
  {
    slug: "ai-saas",
    name: "AI & Software",
    longName: "AI Tools, Software & Online Privacy",
    description:
      "Plain-English guides to AI assistants, productivity software and VPNs — what they really do, what they cost, and how to choose safely.",
  },
  {
    slug: "finance",
    name: "Finance",
    longName: "Consumer Finance & Credit Tools",
    description:
      "Plain-English guides to credit monitoring, budgeting apps and personal finance tools, with the fees and fine print up front.",
  },
  {
    slug: "home-insurance",
    name: "Home & Insurance",
    longName: "Home Services & Insurance Quotes",
    description:
      "How to compare home insurance quotes, warranties and home services — what coverage actually means and where costs hide.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryName(slug: string) {
  return getCategory(slug)?.name ?? slug;
}
