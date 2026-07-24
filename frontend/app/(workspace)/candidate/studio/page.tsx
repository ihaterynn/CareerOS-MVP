import { getStudioData } from "@/modules/candidate/studio/queries";
import { StudioPanel } from "@/modules/candidate/studio/components/studio-panel";

// Deep-linked from Tracker: /candidate/studio?applicationId=<id> (spec §6).
export default async function StudioPage({
  searchParams
}: {
  searchParams: Promise<{ applicationId?: string }>;
}) {
  const { applicationId } = await searchParams;
  const data = await getStudioData(applicationId);
  return <StudioPanel data={data} applicationId={applicationId} />;
}
