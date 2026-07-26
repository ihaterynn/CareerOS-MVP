import { JobbyPanel } from "@/modules/employer/components/jobby-panel";
import { getJobbyBootstrap } from "@/modules/employer/jobby-db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const bootstrap = await getJobbyBootstrap();
  return <JobbyPanel bootstrap={bootstrap} />;
}
