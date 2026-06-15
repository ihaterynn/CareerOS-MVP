import { CandidateDnaPanel } from "@/modules/candidate/components/candidate-dna-panel";
import { CandidateHeader } from "@/modules/candidate/candidate-header";

export default function Page() {
  return (
    <CandidateHeader>
      <CandidateDnaPanel />
    </CandidateHeader>
  );
}
