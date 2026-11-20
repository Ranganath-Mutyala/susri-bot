import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

function csvCell(v: string) {
  // Quote and neutralise spreadsheet formula injection
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) return new Response("Unauthorized", { status: 401 });

  const source = new URL(req.url).searchParams.get("source") || undefined;
  const leads = await prisma.lead.findMany({ where: source ? { sourceSlug: source } : {}, orderBy: { createdAt: "desc" } });
  const lines = [
    ["email", "source_slug", "consent", "created_at"].join(","),
    ...leads.map((l) => [csvCell(l.email), csvCell(l.sourceSlug), l.consent ? "yes" : "no", l.createdAt.toISOString()].join(",")),
  ];
  const date = new Date().toISOString().slice(0, 10);
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${source ?? "all"}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
