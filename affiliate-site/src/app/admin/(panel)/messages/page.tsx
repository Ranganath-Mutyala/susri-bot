import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteMessage, toggleMessageRead } from "../../actions";

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return (
    <>
      <PageHeader title="Contact messages" description="Submissions from the /contact form." />
      <div className="grid gap-3">
        {messages.length === 0 && <p className="card p-6 text-sm text-ink-mute">No messages yet.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`card p-5 ${m.read ? "" : "border-brand-500"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{m.subject || "(no subject)"} {!m.read && <span className="badge ml-1 bg-brand-600 text-white">New</span>}</p>
                <p className="text-sm text-ink-mute">{m.name} · <a href={`mailto:${m.email}`} className="underline">{m.email}</a> · {m.createdAt.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <form action={toggleMessageRead}><input type="hidden" name="id" value={m.id} /><button className="btn-outline px-2.5 py-1 text-xs">{m.read ? "Mark unread" : "Mark read"}</button></form>
                <form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><ConfirmButton message="Delete this message?" className="btn-outline px-2.5 py-1 text-xs text-red-600">Delete</ConfirmButton></form>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{m.message}</p>
          </div>
        ))}
      </div>
    </>
  );
}
