"use client";
import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      setState("sent");
      form.reset();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Something went wrong. Please try again.");
      setState("error");
    }
  }

  if (state === "sent") {
    return <p className="mt-4 rounded-md bg-brand-50 p-4 text-brand-900">Thanks — your message has been received. We aim to reply within 2 business days.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required maxLength={120} className="input" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required maxLength={200} className="input" /></div>
      </div>
      <div><label className="label" htmlFor="subject">Subject</label><input id="subject" name="subject" maxLength={200} className="input" /></div>
      <div><label className="label" htmlFor="message">Message</label><textarea id="message" name="message" required rows={6} maxLength={5000} className="input" /></div>
      {/* Honeypot: hidden from humans */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state === "error" && <p className="text-sm text-red-600">{error}</p>}
      <div><button className="btn-primary px-5 py-2.5" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button></div>
      <p className="text-xs text-ink-mute">We use your details only to reply to your message. See our privacy policy.</p>
    </form>
  );
}
