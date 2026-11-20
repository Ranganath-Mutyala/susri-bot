export const CATEGORIES = [
  {
    slug: "ai-saas",
    name: "AI & SaaS",
    longName: "AI & B2B Productivity SaaS",
    description:
      "Hands-on comparisons of AI assistants, automation platforms and B2B productivity software — tested against real team workflows.",
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
