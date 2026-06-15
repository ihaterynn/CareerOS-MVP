import { JobSearchPanel } from "@/modules/candidate/components/job-search-panel";
import { CandidateHeader } from "@/modules/candidate/candidate-header";

export default function Page() {
  return (
    <CandidateHeader>
      <JobSearchPanel />
    </CandidateHeader>
  );
}
