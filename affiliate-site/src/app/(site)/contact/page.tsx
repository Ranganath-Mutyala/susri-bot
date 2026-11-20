import { StaticPage, staticPageMetadata } from "@/components/StaticPage";
import { ContactForm } from "@/components/ContactForm";
import { getSettings } from "@/lib/settings";

export const generateMetadata = () => staticPageMetadata("contact");

export default async function Page() {
  const s = await getSettings();
  return (
    <StaticPage slug="contact">
      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_280px]">
        <div className="card p-6">
          <h2 className="font-serif text-2xl font-semibold">Send us a message</h2>
          <ContactForm />
        </div>
        <aside className="card h-fit p-6 text-sm leading-6">
          <h2 className="font-semibold">Business contact</h2>
          <dl className="mt-3 space-y-3 text-ink-soft">
            {s.contactEmail && (<div><dt className="font-medium text-ink">Email</dt><dd><a className="underline" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></dd></div>)}
            {s.contactPhone && (<div><dt className="font-medium text-ink">Phone</dt><dd>{s.contactPhone}</dd></div>)}
            {s.contactAddress && (<div><dt className="font-medium text-ink">Mailing address</dt><dd className="whitespace-pre-line">{s.contactAddress}</dd></div>)}
          </dl>
        </aside>
      </div>
    </StaticPage>
  );
}
