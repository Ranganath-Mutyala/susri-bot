import { LandingPageForm } from "@/components/admin/LandingPageForm";
import { emptyLanding } from "@/lib/defaults";
import { PageHeader } from "@/components/admin/ui";

export default function NewLandingPage() {
  return (
    <>
      <PageHeader title="New landing page" />
      <LandingPageForm initial={emptyLanding()} />
    </>
  );
}
