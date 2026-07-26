import type { ReactNode } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { shellNav } from "@/components/nav-config";

// Deliberately NOT inside (workspace): onboarding is a focus surface, not a module (spec §2).
// No sidebar, no portal switch — just an escape hatch out.
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "18px 28px",
          borderBottom: "1px solid var(--border)"
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            background: "var(--accent)",
            color: "var(--accent-contrast)"
          }}
        >
          <Compass size={17} aria-hidden="true" />
        </div>
        <div>
          <div className="ser" style={{ fontSize: 15, lineHeight: 1.1 }}>
            CareerOS
          </div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-3)" }}>
            Setting up
          </div>
        </div>

        <Link
          href={shellNav.candidate.defaultHref}
          style={{
            marginLeft: "auto",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-3)",
            textDecoration: "none"
          }}
        >
          Skip for now
        </Link>
      </header>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 28px 64px" }}>{children}</div>
    </main>
  );
}
