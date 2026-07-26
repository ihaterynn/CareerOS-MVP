import { CvIngestionPanel } from "@/modules/employer/components/ingestion-panel";
import { getCvIngestionRecords } from "@/modules/employer/queries";

export const dynamic = "force-dynamic";

export default async function Page() {
  return <CvIngestionPanel records={await getCvIngestionRecords()} />;
}
