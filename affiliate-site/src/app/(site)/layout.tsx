import { getSettings } from "@/lib/settings";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CookieBanner } from "@/components/CookieBanner";
import { PixelInjector } from "@/components/PixelInjector";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <SiteHeader siteName={s.siteName} logoUrl={s.logoUrl} />
      <main>{children}</main>
      <SiteFooter siteName={s.siteName} footerText={s.footerText} />
      <CookieBanner />
      {s.headScripts && <PixelInjector html={s.headScripts} placement="head" id="site-global" />}
    </>
  );
}
