import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export function SiteHeader({ siteName, logoUrl }: { siteName: string; logoUrl?: string }) {
  const links = [
    ...CATEGORIES.map((c) => ({ href: `/${c.slug}`, label: c.name })),
    { href: "/articles", label: "Guides & Reviews" },
    { href: "/about", label: "About" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo siteName={siteName} logoUrl={logoUrl} />
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium text-ink-soft md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand-700">
              {l.label}
            </Link>
          ))}
        </nav>
        <MobileNav links={links} />
      </div>
    </header>
  );
}
