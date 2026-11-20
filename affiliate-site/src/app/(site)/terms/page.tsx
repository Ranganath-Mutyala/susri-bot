import { StaticPage, staticPageMetadata } from "@/components/StaticPage";

export const generateMetadata = () => staticPageMetadata("terms");

export default function Page() {
  return <StaticPage slug="terms" />;
}
