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

/**
 * Display dates for an article. A scheduled post's row is created before it goes live,
 * so "modified" is never earlier than "published", and "Updated" only shows for real edits
 * made more than a day after publishing.
 */
export function articleDates(a: { publishedAt: Date | null; updatedAt: Date }) {
  const published = a.publishedAt ?? a.updatedAt;
  const modified = a.updatedAt > published ? a.updatedAt : published;
  const wasEdited = modified.getTime() - published.getTime() > 86_400_000;
  return { published, modified, wasEdited };
}
