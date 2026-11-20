import { StaticPage, staticPageMetadata } from "@/components/StaticPage";

export const generateMetadata = () => staticPageMetadata("privacy-policy");

export default function Page() {
  return <StaticPage slug="privacy-policy" />;
}
