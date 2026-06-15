import { JobbyAiPanel } from "@/modules/candidate/components/jobby-ai-panel";
import { CandidateHeader } from "@/modules/candidate/candidate-header";

export default function Page() {
  return (
    <CandidateHeader>
      <JobbyAiPanel />
    </CandidateHeader>
  );
}
