import { HiringPipeline } from "@/modules/employer/components/hiring-pipeline";
import { hiringPipelinePolish } from "@/modules/employer/components/hiring-pipeline-polish";
import { getLiveHiringPipelineSnapshot } from "@/modules/employer/hiring-pipeline-live-db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const snapshot = await getLiveHiringPipelineSnapshot();

  return (
    <>
      <HiringPipeline initialRoles={snapshot.roles} dataSource={snapshot.source} />
      <style>{hiringPipelinePolish}</style>
    </>
  );
}
