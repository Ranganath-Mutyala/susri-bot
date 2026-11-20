import Link from "next/link";

export function Logo({ siteName, logoUrl, href = "/" }: { siteName: string; logoUrl?: string; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-ink">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
      ) : (
        <>
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-md bg-brand-600 text-base text-white">
            {siteName.charAt(0)}
          </span>
          <span>{siteName}</span>
        </>
      )}
    </Link>
  );
}
