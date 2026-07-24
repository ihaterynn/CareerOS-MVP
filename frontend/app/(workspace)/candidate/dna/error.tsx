"use client";

import { Button } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="anim-fade-up" style={{ padding: "60px 0", textAlign: "center", color: "var(--text-2)" }}>
      <div className="kicker" style={{ color: "var(--risk-bad)" }}>Something went wrong</div>
      <h1 className="ser" style={{ fontSize: 24, margin: "10px 0 6px" }}>Couldn’t load your DNA</h1>
      <p style={{ fontSize: 13, marginBottom: 16 }}>An unexpected error occurred.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
