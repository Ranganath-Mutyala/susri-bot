import { StaticPage, staticPageMetadata } from "@/components/StaticPage";

export const generateMetadata = () => staticPageMetadata("affiliate-disclosure");

export default function Page() {
  return <StaticPage slug="affiliate-disclosure" />;
}
