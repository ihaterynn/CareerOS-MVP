import { CareerPathNavigatorPanel } from "@/modules/candidate/components/career-path-navigator-panel";
import { CandidateHeader } from "@/modules/candidate/candidate-header";

export default function Page() {
  return (
    <CandidateHeader>
      <CareerPathNavigatorPanel />
    </CandidateHeader>
  );
}
