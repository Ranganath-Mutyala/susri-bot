import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm, CompliancePageForm } from "@/components/admin/SettingsForms";

const ORDER = ["about", "contact", "privacy-policy", "affiliate-disclosure"];

export default async function SettingsPage() {
  const [s, pages] = await Promise.all([getSettings(), prisma.page.findMany()]);
  const sorted = ORDER.map((slug) => pages.find((p) => p.slug === slug) ?? { slug, title: slug, content: "", metaDescription: "" });
  return (
    <>
      <PageHeader title="Settings & compliance" description="Global site settings, fallback tracking pixel and the four mandatory compliance pages." />
      <SettingsForm settings={{ siteName: s.siteName, tagline: s.tagline, logoUrl: s.logoUrl, footerText: s.footerText, contactEmail: s.contactEmail, contactPhone: s.contactPhone, contactAddress: s.contactAddress, globalPixel: s.globalPixel, headScripts: s.headScripts }} />
      <h2 className="mb-1 mt-10 text-lg font-semibold">Compliance pages</h2>
      <p className="mb-4 text-sm text-ink-mute">Linked in every footer and required by Google Ads and affiliate networks. Markdown supported.</p>
      <div className="grid gap-5">
        {sorted.map((p) => <CompliancePageForm key={p.slug} page={{ slug: p.slug, title: p.title, content: p.content, metaDescription: p.metaDescription }} />)}
      </div>
    </>
  );
}
