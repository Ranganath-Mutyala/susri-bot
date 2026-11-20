import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Logo } from "@/components/Logo";
import { DisclosureBanner } from "@/components/DisclosureBanner";
import { CookieBanner } from "@/components/CookieBanner";

/** Distraction-free layout for paid-traffic landing pages. */
export default async function OfferLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const year = new Date().getFullYear();
  return (
    <>
      <DisclosureBanner compact />
      <header className="border-b border-line bg-white">
        <div className="container-page flex h-14 items-center justify-between">
          <Logo siteName={s.siteName} logoUrl={s.logoUrl} />
          <Link href="/affiliate-disclosure" className="text-xs font-medium text-ink-mute underline">
            How we make money
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-line bg-white pb-24 md:pb-0">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {s.siteName}. Independent comparison content. Ratings reflect our editorial opinion.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-4">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <Link href="/affiliate-disclosure" className="hover:underline">Affiliate Disclosure</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </nav>
        </div>
      </footer>
      <CookieBanner raised />
    </>
  );
}
