"use client";
import { useActionState } from "react";
import { saveOfferLink } from "@/app/admin/actions";

type L = { key: string; label: string; url: string; campaignId: string; notes: string };

export function OfferLinkForm({ link, isNew = false }: { link: L; isNew?: boolean }) {
  const [state, action, pending] = useActionState(saveOfferLink, null);
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[140px_160px_1fr_auto] sm:items-end">
      <label className="text-xs text-ink-mute">Key{isNew ? " (e.g. nordvpn)" : ""}
        <input name="key" defaultValue={link.key} readOnly={!isNew} required className={`input mt-1 font-mono text-xs ${isNew ? "" : "bg-gray-50"}`} />
      </label>
      <label className="text-xs text-ink-mute">Label / brand
        <input name="label" defaultValue={link.label} className="input mt-1 text-xs" />
      </label>
      <label className="text-xs text-ink-mute">Tracking link (MyLead or BeMob)
        <input name="url" defaultValue={link.url} placeholder="https://…" className="input mt-1 font-mono text-xs" />
      </label>
      <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : isNew ? "Add" : "Save"}</button>
      <input type="hidden" name="campaignId" defaultValue={link.campaignId} />
      <input type="hidden" name="notes" defaultValue={link.notes} />
      {state && <p className={`text-xs sm:col-span-4 ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</p>}
    </form>
  );
}
