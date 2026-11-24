import { Marked, type Tokens } from "marked";

export type TocItem = { id: string; text: string; level: number };

function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Render admin-authored Markdown to HTML. Headings get stable ids for the
 * table of contents; external links get rel="noopener" and open in a new tab.
 * Content is authored only by authenticated admins, so raw HTML is allowed.
 */
/**
 * Offer links: write [Check price](offer:nordvpn) in Markdown. The key is looked up in the
 * OfferLink table. With a URL it becomes a sponsored link; without one it renders as plain text,
 * so articles never show broken links. Add the title "button" to style it as a CTA button:
 * [See NordVPN plans](offer:nordvpn "button").
 * When `offers` is undefined (admin live preview), pending offer links are highlighted instead.
 */
export function renderMarkdown(
  md: string,
  offers?: Record<string, { url: string; label: string }>,
): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const marked = new Marked({ gfm: true });

  marked.use({
    renderer: {
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        let id = headingId(token.text) || "section";
        const n = used.get(id) ?? 0;
        used.set(id, n + 1);
        if (n) id = `${id}-${n}`;
        if (token.depth === 2 || token.depth === 3) toc.push({ id, text: token.text.replace(/[*_`]/g, ""), level: token.depth });
        return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`;
      },
      link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Link) {
        const text = this.parser.parseInline(token.tokens);
        if (token.href.startsWith("offer:")) {
          const key = token.href.slice("offer:".length).trim().toLowerCase();
          const asButton = token.title === "button";
          const url = offers?.[key]?.url;
          if (url) {
            const cls = asButton ? ' class="offer-cta"' : "";
            return `<a href="${escapeAttr(url)}" rel="nofollow sponsored noopener" target="_blank"${cls}>${text}</a>`;
          }
          if (!offers) return `<span class="offer-pending" title="Offer link pending: ${escapeAttr(key)}">${text}</span>`;
          return asButton ? "" : `<span>${text}</span>`;
        }
        const external = /^https?:\/\//.test(token.href);
        const title = token.title ? ` title="${token.title}"` : "";
        return external
          ? `<a href="${token.href}"${title} target="_blank" rel="noopener nofollow">${text}</a>`
          : `<a href="${token.href}"${title}>${text}</a>`;
      },
    },
  });

  const raw = marked.parse(md || "", { async: false }) as string;
  // Wrap tables so wide comparison tables scroll sideways on phones instead of breaking the layout.
  const html = raw.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");
  return { html, toc };
}

function escapeAttr(v: string) {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
