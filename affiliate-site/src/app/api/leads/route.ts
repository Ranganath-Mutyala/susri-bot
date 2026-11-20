import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  if (!rateLimit(`lead:${clientIp(req.headers)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (body.website) return NextResponse.json({ ok: true }); // honeypot

  const email = String(body.email ?? "").trim().toLowerCase();
  const slug = String(body.slug ?? "").trim();
  if (!EMAIL_RE.test(email) || email.length > 200) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!body.consent) return NextResponse.json({ error: "Please tick the consent box." }, { status: 400 });

  const lp = await prisma.landingPage.findUnique({ where: { slug }, select: { id: true, showEmailCapture: true } });
  if (!lp || !lp.showEmailCapture) return NextResponse.json({ error: "Signup is not available on this page." }, { status: 400 });

  await prisma.lead.upsert({
    where: { email_sourceSlug: { email, sourceSlug: slug } },
    update: {},
    create: { email, sourceSlug: slug, landingPageId: lp.id, consent: true, userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300) },
  });
  return NextResponse.json({ ok: true });
}
