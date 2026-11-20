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
export function renderMarkdown(md: string): { html: string; toc: TocItem[] } {
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
        const external = /^https?:\/\//.test(token.href);
        const title = token.title ? ` title="${token.title}"` : "";
        return external
          ? `<a href="${token.href}"${title} target="_blank" rel="noopener nofollow">${text}</a>`
          : `<a href="${token.href}"${title}>${text}</a>`;
      },
    },
  });

  const html = marked.parse(md || "", { async: false }) as string;
  return { html, toc };
}
