import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="anim-fade-up">
      <Skeleton w={220} h={34} />
      <Skeleton h={520} style={{ borderRadius: 14, marginTop: 20 }} />
    </div>
  );
}
