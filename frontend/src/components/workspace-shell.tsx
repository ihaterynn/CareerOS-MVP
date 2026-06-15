"use client";
import { useState, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bell, Building2, UserRound } from "lucide-react";
import type { Portal } from "@careeros/shared";
import { Icon } from "./icon";
import { Avatar, Card } from "./ui";
import { TweaksPanel } from "./tweaks-panel";
import { shellNav } from "./nav-config";

export type ShellNavItem = {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
};

export type ShellNav = {
  candidate: { title: string; items: ShellNavItem[]; defaultHref: string };
  employer: { title: string; items: ShellNavItem[]; defaultHref: string };
};

const portalOptions: { id: Portal; label: string; icon: LucideIcon }[] = [
  { id: "employer", label: "Employer", icon: Building2 },
  { id: "candidate", label: "Candidate", icon: UserRound }
];

function ThemeToggle({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title="Toggle theme"
      style={{
        position: "relative",
        width: 58,
        height: 30,
        borderRadius: 99,
        border: "1px solid var(--border-2)",
        background: "var(--surface-2)",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2.5,
          left: theme === "dark" ? 30 : 2.5,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "var(--surface)",
          boxShadow: "var(--shadow-sm)",
          display: "grid",
          placeItems: "center",
          color: "var(--accent)",
          transition: "left .28s var(--ease-spring)"
        }}
      >
        <Icon name={theme === "dark" ? "moon" : "sun"} size={14} />
      </span>
    </button>
  );
}

function PortalSwitch({ portal, onChange }: { portal: Portal; onChange: (p: Portal) => void }) {
  return (
    <div style={{ display: "inline-flex", padding: 4, background: "var(--surface-2)", borderRadius: 999, border: "1px solid var(--border)", position: "relative" }}>
      <span
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          width: "calc(50% - 4px)",
          left: portal === "employer" ? 4 : "calc(50%)",
          background: "var(--accent)",
          borderRadius: 999,
          transition: "left .3s var(--ease-spring)",
          boxShadow: "0 2px 8px var(--accent-glow)"
        }}
      />
      {portalOptions.map((p) => {
        const PIcon = p.icon;
        const on = portal === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            style={{
              position: "relative",
              zIndex: 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 16px",
              border: "none",
              background: "none",
              borderRadius: 999,
              fontSize: 13.5,
              fontWeight: 700,
              color: on ? "var(--accent-contrast)" : "var(--text-2)",
              transition: "color .25s"
            }}
          >
            <PIcon size={15} aria-hidden="true" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

function SidebarNav({
  title,
  items,
  pathname,
  onNavigate
}: {
  title: string;
  items: ShellNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="kicker" style={{ padding: "0 10px", marginBottom: 8 }}>{title}</div>
      {items.map((n) => {
        const NIcon = n.icon;
        const on = pathname === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            title={n.description}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "10px 12px",
              borderRadius: "var(--r-sm)",
              textDecoration: "none",
              background: on ? "var(--accent-soft)" : "transparent",
              color: on ? "var(--accent)" : "var(--text-2)",
              fontWeight: 600,
              fontSize: 14,
              transition: "all .18s",
              boxShadow: on ? "inset 2.5px 0 0 var(--accent)" : "none"
            }}
          >
            <NIcon size={18} aria-hidden="true" />
            {n.label}
          </Link>
        );
      })}
    </>
  );
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const portal: Portal = pathname.startsWith("/employer") ? "employer" : "candidate";
  const side = shellNav[portal];

  // Lazy init from localStorage (pre-paint script already set the attribute).
  const [theme, setTheme] = useState<string>(() =>
    typeof localStorage !== "undefined" ? localStorage.getItem("cos_theme") || "light" : "light"
  );
  const [drawer, setDrawer] = useState(false);

  // Sync theme to the DOM/localStorage (external-system sync, not derived state).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cos_theme", theme);
  }, [theme]);

  const switchPortal = (p: Portal) => {
    setDrawer(false);
    router.push(shellNav[p].defaultHref);
  };

  return (
    <div className="app-shell">
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 16px",
          background: "color-mix(in srgb, var(--bg) 86%, transparent)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)"
        }}
      >
        <button
          onClick={() => setDrawer((d) => !d)}
          aria-label="Menu"
          className="cos-burger"
          style={{
            display: "none",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 9,
            padding: 8,
            color: "var(--text-2)"
          }}
        >
          <Icon name="grid" size={17} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--accent)",
              color: "var(--accent-contrast)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 3px 10px var(--accent-glow)"
            }}
          >
            <Icon name="compass" size={20} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: 18, lineHeight: 1 }}>CareerOS</div>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: ".1em", marginTop: 2 }}>TALENT MOBILITY</div>
          </div>
        </div>

        <div className="cos-portal-wrap" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <PortalSwitch portal={portal} onChange={switchPortal} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
          <button
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 9, padding: 8, color: "var(--text-2)", position: "relative" }}
            aria-label="Notifications"
          >
            <Bell size={17} aria-hidden="true" />
            <span style={{ position: "absolute", top: 6, right: 7, width: 7, height: 7, borderRadius: "50%", background: "var(--risk-bad)", border: "1.5px solid var(--surface)" }} />
          </button>
          <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "light" ? "dark" : "light"))} />
          <Avatar name={portal === "candidate" ? "Aishah Rahman" : "Talent Team"} size={34} />
        </div>
      </header>

      <div className="cos-body" style={{ display: "grid", gridTemplateColumns: "clamp(216px, 16vw, 264px) minmax(0, 1fr)", width: "100%", margin: "0 auto" }}>
        <aside
          className="cos-sidebar"
          style={{
            position: "sticky",
            top: 64,
            height: "calc(100vh - 64px)",
            padding: "22px 1vw",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}
        >
          <SidebarNav title={side.title} items={side.items} pathname={pathname} />
          <div style={{ marginTop: "auto" }}>
            <Card pad={15} style={{ background: "var(--surface-2)", boxShadow: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <Icon name="sparkles" size={15} style={{ color: "var(--accent)" }} />
                <span style={{ fontWeight: 700, fontSize: 12.5 }}>{portal === "candidate" ? "Living profile" : "Living ecosystem"}</span>
              </div>
              <p style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
                {portal === "candidate"
                  ? "Employers see you upskilling in real time as you grow."
                  : "See candidates upskilling toward your open roles, live."}
              </p>
            </Card>
          </div>
        </aside>

        <main key={pathname} className="anim-fade-up" style={{ padding: "3vh 2vw 8vh", minWidth: 0, minHeight: "calc(100vh - 64px)" }}>
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="cos-drawer-overlay" onClick={() => setDrawer(false)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(10,12,22,.5)", backdropFilter: "blur(4px)" }}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="anim-fade-up"
            style={{
              width: 264,
              height: "100%",
              background: "var(--surface)",
              borderRight: "1px solid var(--border)",
              padding: "22px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              boxShadow: "var(--shadow-lg)"
            }}
          >
            <SidebarNav title={side.title} items={side.items} pathname={pathname} onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <TweaksPanel />

      <style>{`
        @media (max-width: 1023px) {
          .cos-body { grid-template-columns: 1fr !important; }
          .cos-sidebar { display: none !important; }
          .cos-burger { display: grid !important; }
          .cos-portal-wrap { justify-content: flex-start !important; }
          .app-shell main { padding: 2.5vh 4vw 8vh !important; }
        }
      `}</style>
    </div>
  );
}
