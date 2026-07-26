import { CareerRootWorkspace } from "@/modules/employer/components/career-root-workspace";
import { careerRootPolish } from "@/modules/employer/components/career-root-polish";
import { careerRootClarity } from "@/modules/employer/components/career-root-clarity";
import { getCareerRootSnapshot } from "@/modules/employer/career-root-db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const snapshot = await getCareerRootSnapshot();

  return (
    <>
      <CareerRootWorkspace
        initialRoles={snapshot.roles}
        initialBranches={snapshot.branches}
        dataSource={snapshot.source}
      />
      <style>{careerRootPolish}</style>
      <style>{careerRootClarity}</style>
    </>
  );
}
