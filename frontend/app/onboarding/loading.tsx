import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="onboarding-grid anim-fade-up">
      <div>
        <Skeleton w={220} h={30} />
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton h={22} w="70%" />
          <Skeleton h={230} style={{ borderRadius: 20 }} />
        </div>
      </div>
      <Skeleton h={320} style={{ borderRadius: 14 }} />
    </div>
  );
}
