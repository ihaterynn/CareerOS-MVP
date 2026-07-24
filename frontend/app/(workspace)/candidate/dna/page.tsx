import { getDnaData } from "@/modules/candidate/dna/queries";
import { DnaPanel } from "@/modules/candidate/dna/components/dna-panel";

export default async function DnaPage() {
  const data = await getDnaData();
  return <DnaPanel data={data} />;
}
