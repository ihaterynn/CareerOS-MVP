"use client";

import { useEffect } from "react";

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;
  return (
    <div
      role="status"
      className="anim-pop"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 120,
        background: "var(--text)",
        color: "var(--surface)",
        padding: "12px 20px",
        borderRadius: 99,
        fontSize: 12.5,
        fontWeight: 600,
        boxShadow: "var(--shadow-lg)",
        display: "flex",
        alignItems: "center",
        gap: 9
      }}
    >
      <span style={{ color: "var(--accent-2)" }}>✓</span>
      {message}
    </div>
  );
}
