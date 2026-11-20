import { StaticPage, staticPageMetadata } from "@/components/StaticPage";

export const generateMetadata = () => staticPageMetadata("about");

export default function Page() {
  return <StaticPage slug="about" />;
}
