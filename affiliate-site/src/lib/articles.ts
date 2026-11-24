/** Articles visible to the public: published AND their publish date has arrived (supports scheduling). */
export function liveArticleWhere() {
  return { status: "published", publishedAt: { lte: new Date() } } as const;
}

export function isLive(a: { status: string; publishedAt: Date | null }) {
  return a.status === "published" && !!a.publishedAt && a.publishedAt.getTime() <= Date.now();
}

export function isScheduled(a: { status: string; publishedAt: Date | null }) {
  return a.status === "published" && !!a.publishedAt && a.publishedAt.getTime() > Date.now();
}
