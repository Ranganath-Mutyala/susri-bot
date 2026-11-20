import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseLanding } from "@/lib/landing";
import { LandingPageForm } from "@/components/admin/LandingPageForm";
import { PageHeader } from "@/components/admin/ui";
import { deleteLandingPage, duplicateLandingPage } from "../../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export default async function EditLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lp = await prisma.landingPage.findUnique({ where: { id } });
  if (!lp) notFound();
  const d = parseLanding(lp);
  const { createdAt, updatedAt, ...initial } = d; // eslint-disable-line @typescript-eslint/no-unused-vars
  return (
    <>
      <PageHeader
        title={`Edit: ${lp.title}`}
        description={`Last saved ${lp.updatedAt.toLocaleString()}`}
        actions={
          <>
            <a href={`/offers/${lp.slug}`} target="_blank" className="btn-outline">{lp.status === "published" ? "View live" : "Preview draft"}</a>
            <form action={duplicateLandingPage}><input type="hidden" name="id" value={lp.id} /><button className="btn-outline">Duplicate</button></form>
            <form action={deleteLandingPage}><input type="hidden" name="id" value={lp.id} /><ConfirmButton message="Delete this landing page permanently?">Delete</ConfirmButton></form>
          </>
        }
      />
      <LandingPageForm initial={initial} />
    </>
  );
}
