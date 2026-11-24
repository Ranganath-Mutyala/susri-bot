"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/landing-pages", label: "Landing Pages" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/offer-links", label: "Offer Links" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings & Compliance" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-3 md:pb-0">
      {ITEMS.map((i) => {
        const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-gray-100"}`}>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
