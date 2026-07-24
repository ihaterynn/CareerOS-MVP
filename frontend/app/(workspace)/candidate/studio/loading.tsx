import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="anim-fade-up">
      <Skeleton w={220} h={34} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 20, marginTop: 20 }}>
        <Skeleton h={520} style={{ borderRadius: 14 }} />
        <Skeleton h={520} style={{ borderRadius: 14 }} />
      </div>
    </div>
  );
}
