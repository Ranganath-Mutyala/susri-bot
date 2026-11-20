import { CategoryPage, categoryMetadata } from "@/components/CategoryPage";

export const metadata = categoryMetadata("home-insurance");

export default function Page() {
  return <CategoryPage slug="home-insurance" />;
}
