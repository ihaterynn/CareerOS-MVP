import { ApplicationsPanel } from "@/modules/candidate/components/applications-panel";
import { CandidateHeader } from "@/modules/candidate/candidate-header";

export default function Page() {
  return (
    <CandidateHeader>
      <ApplicationsPanel />
    </CandidateHeader>
  );
}
