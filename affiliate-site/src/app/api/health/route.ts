import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Uptime check: confirms the app is running and the SQLite database is readable. */
export async function GET() {
  try {
    await prisma.setting.findFirst({ select: { id: true } });
    return Response.json({ status: "ok", time: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "error", db: "unreachable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
