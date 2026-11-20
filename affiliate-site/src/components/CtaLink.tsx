import { cn } from "@/lib/utils";

/** Direct, single-hop sponsored link to the tracker's CTA URL. */
export function CtaLink({
  href,
  children,
  className,
  size = "md",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" };
  return (
    <a href={href} rel="nofollow sponsored" className={cn("btn-cta", sizes[size], className)}>
      {children}
    </a>
  );
}
