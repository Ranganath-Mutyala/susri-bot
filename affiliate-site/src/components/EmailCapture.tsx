"use client";
import { useState } from "react";

export function EmailCapture({ slug, headline, subtext }: { slug: string; headline: string; subtext: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), consent: fd.get("consent") === "on", website: fd.get("website"), slug }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) setState("done");
    else {
      setMsg(body.error || "Please try again.");
      setState("error");
    }
  }

  return (
    <section aria-labelledby="newsletter" className="mt-12 rounded-2xl bg-brand-900 p-6 text-white sm:p-8">
      <h2 id="newsletter" className="font-serif text-2xl font-bold">{headline}</h2>
      <p className="mt-2 text-sm text-white/80">{subtext}</p>
      {state === "done" ? (
        <p className="mt-5 rounded-md bg-white/10 p-4 text-sm">You&apos;re in — check your inbox shortly.</p>
      ) : (
        <form onSubmit={submit} className="mt-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="lead-email" className="sr-only">Email address</label>
            <input id="lead-email" name="email" type="email" required placeholder="you@example.com" className="input flex-1 border-0 py-3" />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <button className="btn-cta px-6 py-3" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send it to me"}</button>
          </div>
          <label className="mt-3 flex items-start gap-2 text-xs text-white/80">
            <input type="checkbox" name="consent" required className="mt-0.5" />
            <span>I agree to receive emails and accept the <a href="/privacy-policy" className="underline">privacy policy</a>. Unsubscribe anytime.</span>
          </label>
          {state === "error" && <p className="mt-2 text-sm text-red-200">{msg}</p>}
        </form>
      )}
    </section>
  );
}
