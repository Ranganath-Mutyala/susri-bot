import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const s = await getSettings();
  return (
    <div className="min-h-screen bg-gray-50 md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b border-line bg-white md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex h-14 items-center justify-between px-4 md:h-16">
          <Link href="/admin" className="font-serif text-lg font-bold">{s.siteName} <span className="text-xs font-sans font-medium text-ink-mute">Admin</span></Link>
        </div>
        <AdminNav />
        <div className="hidden border-t border-line p-4 text-xs text-ink-mute md:block md:absolute md:bottom-0 md:w-[229px]">
          <p className="truncate">{String(session.sub)}</p>
          <div className="mt-2 flex gap-3">
            <a href="/" target="_blank" className="underline">View site</a>
            <form action="/api/auth/logout" method="post"><button className="underline">Log out</button></form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex justify-end gap-3 border-b border-line bg-white px-4 py-2 text-xs md:hidden">
          <a href="/" target="_blank" className="underline">View site</a>
          <form action="/api/auth/logout" method="post"><button className="underline">Log out</button></form>
        </div>
        <div className="mx-auto max-w-6xl p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
