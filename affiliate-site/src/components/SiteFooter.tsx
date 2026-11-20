import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function SiteFooter({ siteName, footerText }: { siteName: string; footerText: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-lg font-bold">{siteName}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">{footerText}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Categories</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="hover:text-brand-700">{c.longName}</Link>
              </li>
            ))}
            <li><Link href="/articles" className="hover:text-brand-700">All guides & reviews</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li><Link href="/about" className="hover:text-brand-700">About & Editorial Standards</Link></li>
            <li><Link href="/contact" className="hover:text-brand-700">Contact</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-brand-700">Privacy & Cookie Policy</Link></li>
            <li><Link href="/affiliate-disclosure" className="hover:text-brand-700">Affiliate Disclosure</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-mute sm:flex-row sm:justify-between">
          <p>© {year} {siteName}. All rights reserved.</p>
          <p>
            We may earn a commission when you click links on this site.{" "}
            <Link href="/affiliate-disclosure" className="underline">Learn more</Link>.
          </p>
        </div>
      </div>
    </footer>
  );
}
