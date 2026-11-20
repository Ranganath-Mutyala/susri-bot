"use client";
import { useState } from "react";

export function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    if (res.ok) {
      window.location.href = next;
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error || "Login failed");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required className="input" /></div>
      <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="input" /></div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary py-2.5" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
