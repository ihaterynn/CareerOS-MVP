"use client";
import { useState, useCallback } from "react";
import { Icon } from "./icon";

/* ============================================================
   tweaks-panel.tsx — design controls (accent + heading font).
   Clean production rewrite of the careeros prototype scaffold:
   a fixed bottom-right popover, no host/postMessage protocol,
   persists to localStorage and reflects onto <html> data-* attrs.
   ============================================================ */

export type Accent = "gold" | "indigo";
export type HeadingFont = "source" | "newsreader";

const STORE = { accent: "cos_accent", font: "cos_headingfont" } as const;

function read<T extends string>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  return (localStorage.getItem(key) as T) || fallback;
}

export function useDesignControls() {
  // Lazy init from localStorage (pre-paint script already set the attrs).
  const [accent, setAccentState] = useState<Accent>(() => read<Accent>(STORE.accent, "gold"));
  const [headingFont, setFontState] = useState<HeadingFont>(() => read<HeadingFont>(STORE.font, "source"));

  const setAccent = useCallback((v: Accent) => {
    setAccentState(v);
    document.documentElement.setAttribute("data-accent", v);
    localStorage.setItem(STORE.accent, v);
  }, []);

  const setHeadingFont = useCallback((v: HeadingFont) => {
    setFontState(v);
    document.documentElement.setAttribute("data-headingfont", v);
    localStorage.setItem(STORE.font, v);
  }, []);

  return { accent, setAccent, headingFont, setHeadingFont };
}

function Segmented<T extends string>({
  value,
  options,
  onChange
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "inline-flex", padding: 3, background: "var(--surface-2)", borderRadius: 999, border: "1px solid var(--border)", width: "100%" }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              flex: 1,
              padding: "6px 10px",
              border: "none",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              background: on ? "var(--accent)" : "transparent",
              color: on ? "var(--accent-contrast)" : "var(--text-2)",
              transition: "background .2s var(--ease), color .2s"
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const { accent, setAccent, headingFont, setHeadingFont } = useDesignControls();

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 90 }}>
      {open && (
        <div
          className="anim-pop"
          style={{
            position: "absolute",
            bottom: 52,
            right: 0,
            width: 240,
            background: "var(--surface)",
            border: "1px solid var(--border-2)",
            borderRadius: "var(--r)",
            boxShadow: "var(--shadow-lg)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}
        >
          <div>
            <div className="kicker" style={{ marginBottom: 8 }}>Brand accent</div>
            <Segmented
              value={accent}
              onChange={setAccent}
              options={[
                { value: "gold", label: "Gold" },
                { value: "indigo", label: "Indigo" }
              ]}
            />
          </div>
          <div>
            <div className="kicker" style={{ marginBottom: 8 }}>Heading font</div>
            <Segmented
              value={headingFont}
              onChange={setHeadingFont}
              options={[
                { value: "source", label: "Source" },
                { value: "newsreader", label: "Newsreader" }
              ]}
            />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Design tweaks"
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid var(--border-2)",
          background: "var(--surface)",
          color: "var(--accent)",
          display: "grid",
          placeItems: "center",
          boxShadow: "var(--shadow)",
          marginLeft: "auto"
        }}
      >
        <Icon name="sparkles" size={18} />
      </button>
    </div>
  );
}
