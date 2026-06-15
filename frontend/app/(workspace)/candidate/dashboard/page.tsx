import { CandidateDashboardPanel } from "@/modules/candidate/components/candidate-dashboard-panel";
import { CandidateHeader } from "@/modules/candidate/candidate-header";

export default function Page() {
  return (
    <CandidateHeader>
      <CandidateDashboardPanel />
    </CandidateHeader>
  );
}
