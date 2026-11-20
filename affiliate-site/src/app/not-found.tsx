import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-serif text-4xl font-bold">Page not found</h1>
        <p className="mt-3 text-ink-soft">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className="btn-primary mt-6">Back to homepage</Link>
      </div>
    </div>
  );
}
