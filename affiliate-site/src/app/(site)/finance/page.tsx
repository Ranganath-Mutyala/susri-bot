import { CategoryPage, categoryMetadata } from "@/components/CategoryPage";

export const metadata = categoryMetadata("finance");

export default function Page() {
  return <CategoryPage slug="finance" />;
}
