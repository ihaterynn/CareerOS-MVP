import { redirect } from "next/navigation";
import { shellNav } from "@/components/nav-config";
import { getOnboardingData, isOnboardingComplete } from "@/modules/candidate/onboarding/queries";
import { OnboardingPanel } from "@/modules/candidate/onboarding/components/onboarding-panel";

// Server Component: fetch on the server, pass typed data to the client panel.
export default async function OnboardingPage() {
  if (await isOnboardingComplete()) {
    redirect(shellNav.candidate.defaultHref);
  }
  const data = await getOnboardingData();
  return <OnboardingPanel data={data} />;
}
