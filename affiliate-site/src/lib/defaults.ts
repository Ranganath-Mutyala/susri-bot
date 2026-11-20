import type { ArticlePayload, LandingPayload } from "@/app/admin/actions";

export function emptyLanding(): LandingPayload {
  return {
    slug: "", title: "", category: "ai-saas", status: "draft", metaTitle: "", metaDescription: "",
    offerName: "", ctaUrl: "", pixelScript: "", pixelPlacement: "head", passthroughParams: true, payout: 0, geos: ["US"], internalNotes: "",
    badgeText: `Updated for ${new Date().getFullYear()}`, headline: "", subheadline: "", heroBullets: ["", "", ""], ctaText: "Check Availability", ctaSubtext: "",
    comparisonTitle: "", comparisonColumns: ["Best For", "Pricing / Free Trial", "Key Advantage"], comparisonRows: [],
    body: "", pros: [""], cons: [""], verdict: "",
    showComparison: true, showEmailCapture: false, showStickyCta: true,
    emailHeadline: "Get our free buyer's checklist", emailSubtext: "One useful email. No spam. Unsubscribe anytime.",
  };
}

export function emptyArticle(): ArticlePayload {
  return { slug: "", title: "", excerpt: "", category: "ai-saas", content: "", status: "draft", featured: false, coverImage: "", metaTitle: "", metaDescription: "", authorName: "Editorial Team", authorRole: "", authorBio: "" };
}
