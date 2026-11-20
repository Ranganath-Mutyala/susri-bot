"use client";
import { useActionState } from "react";
import { quickSwapOffer } from "@/app/admin/actions";

export function QuickSwap({ id, ctaUrl, offerName }: { id: string; ctaUrl: string; offerName: string }) {
  const [state, action, pending] = useActionState(quickSwapOffer, null);
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[1fr_200px_auto] sm:items-center">
      <input type="hidden" name="id" value={id} />
      <input name="ctaUrl" defaultValue={ctaUrl} placeholder="https://xxxx.bemobtrk.com/click" className="input font-mono text-xs" aria-label="BeMob CTA URL" required />
      <input name="offerName" defaultValue={offerName} placeholder="Offer name (internal)" className="input text-xs" aria-label="Offer name" />
      <button className="btn-cta" disabled={pending}>{pending ? "Saving…" : "Swap live"}</button>
      {state && <p className={`text-xs sm:col-span-3 ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</p>}
    </form>
  );
}
