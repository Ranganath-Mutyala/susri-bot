import Link from "next/link";

export function DisclosureBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div role="note" className="border-b border-amber-200 bg-amber-50 text-amber-900">
      <p className={`container-page ${compact ? "py-1.5 text-[11px]" : "py-2 text-xs"} leading-5`}>
        <strong className="font-semibold">Advertiser Disclosure:</strong> We are an independent, reader-supported
        comparison site. We may earn a commission when you click links or sign up through this page, at no extra
        cost to you. This does not influence our ratings.{" "}
        <Link href="/affiliate-disclosure" className="font-medium underline">
          Read our full disclosure
        </Link>
        .
      </p>
    </div>
  );
}
