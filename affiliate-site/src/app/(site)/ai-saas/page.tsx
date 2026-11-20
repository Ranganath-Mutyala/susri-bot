import { CategoryPage, categoryMetadata } from "@/components/CategoryPage";

export const metadata = categoryMetadata("ai-saas");

export default function Page() {
  return <CategoryPage slug="ai-saas" />;
}
