import type { LucideIcon } from "lucide-react";
import { Bell, Building2, Compass, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import type { Portal } from "@careeros/shared";

export type SidebarNavItem<TId extends string> = {
  id: TId;
  label: string;
  description: string;
  icon: LucideIcon;
};

type PortalOption = {
  id: Portal;
  label: string;
  icon: LucideIcon;
};

const portalOptions: PortalOption[] = [
  { id: "employer", label: "Employer", icon: Building2 },
  { id: "candidate", label: "Candidate", icon: UserRound }
];

export function WorkspaceShell<TId extends string>({
  portal,
  onPortalChange,
  sidebarTitle,
  navItems,
  activeId,
  onActiveChange,
  children
}: {
  portal: Portal;
  onPortalChange: (portal: Portal) => void;
  sidebarTitle: string;
  navItems: SidebarNavItem<TId>[];
  activeId: TId;
  onActiveChange: (id: TId) => void;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen w-full px-3 sm:px-4 lg:px-5">
      <header className="sticky top-0 z-40 flex h-auto flex-col gap-4 border-b border-line bg-cream/90 py-4 backdrop-blur lg:h-16 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="grid size-[34px] place-items-center rounded-[10px] bg-gold text-[#1c1402] shadow-[0_3px_10px_rgba(169,128,47,.30)]">
            <Compass size={20} aria-hidden="true" />
          </div>
          <div>
            <div className="font-serif text-lg font-semibold leading-none text-ink">CareerOS</div>
            <div className="mono mt-1 text-[9.5px] font-semibold uppercase tracking-[.12em] text-faint">
              Talent Mobility
            </div>
          </div>
        </div>

        <div className="flex flex-1 justify-start lg:justify-center">
          <div className="inline-flex rounded-full border border-line bg-mist p-1" role="tablist" aria-label="CareerOS portal">
            {portalOptions.map((option) => {
              const Icon = option.icon;
              const active = portal === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onPortalChange(option.id)}
                  className={[
                    "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition",
                    active ? "bg-gold text-[#1c1402] shadow-sm" : "text-muted hover:text-ink"
                  ].join(" ")}
                >
                  <Icon size={15} aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative grid size-9 place-items-center rounded-[9px] border border-line bg-mist text-muted"
            title="Notifications"
          >
            <Bell size={17} aria-hidden="true" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-bad" />
          </button>
          <div className="grid size-9 place-items-center rounded-full bg-ink text-sm font-bold text-paper">
            {portal === "candidate" ? "AR" : "TT"}
          </div>
        </div>
      </header>

      <div className="grid gap-0 lg:grid-cols-[236px_minmax(0,1fr)]">
        <aside className="border-line py-4 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:border-r lg:pr-4">
          <div className="kicker mb-3 px-2">{sidebarTitle}</div>
          <nav className="grid gap-1" aria-label={`${sidebarTitle} pages`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onActiveChange(item.id)}
                  title={item.description}
                  className={[
                    "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-semibold transition",
                    active
                      ? "bg-[#F3EAD3] text-gold shadow-[inset_3px_0_0_var(--accent)]"
                      : "text-muted hover:bg-mist hover:text-ink"
                  ].join(" ")}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 py-4 lg:pl-5">{children}</section>
      </div>
    </main>
  );
}
