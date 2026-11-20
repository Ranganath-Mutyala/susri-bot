"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "cookie-consent-v1";

export function CookieBanner({ raised = false }: { raised?: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage unavailable */
    }
  }, []);
  const choose = (value: "accepted" | "essential") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: value }));
    setShow(false);
  };
  if (!show) return null;
  return (
    <div role="dialog" aria-label="Cookie consent" className={`fixed inset-x-3 ${raised ? "bottom-20 md:bottom-3" : "bottom-3"} z-50 mx-auto max-w-2xl rounded-xl border border-line bg-white p-4 shadow-lg sm:flex sm:items-center sm:gap-4`}>
      <p className="text-sm leading-6 text-ink-soft">
        We use essential cookies to run this site and, with your consent, analytics and affiliate tracking cookies
        to measure performance. See our <Link href="/privacy-policy" className="underline">Privacy & Cookie Policy</Link>.
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button className="btn-outline" onClick={() => choose("essential")}>Essential only</button>
        <button className="btn-primary" onClick={() => choose("accepted")}>Accept all</button>
      </div>
    </div>
  );
}
