import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="anim-fade-up">
      <Skeleton w={260} h={34} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr) 1.3fr", gap: 14, marginTop: 22 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} h={92} style={{ borderRadius: 12 }} />
        ))}
      </div>
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "260px minmax(0,1fr)", gap: 20 }}>
        <Skeleton h={420} style={{ borderRadius: 14 }} />
        <Skeleton h={420} style={{ borderRadius: 14 }} />
      </div>
    </div>
  );
}
