import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  // Relative Location so the redirect is correct behind Nginx / Cloudflare.
  const res = new NextResponse(null, { status: 303, headers: { Location: "/admin/login" } });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
