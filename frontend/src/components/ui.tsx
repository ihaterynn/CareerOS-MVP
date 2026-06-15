"use client";
import { useState, useEffect, useRef, useMemo, type ReactNode, type CSSProperties } from "react";
import { Icon, type IconName } from "./icon";

/* ============================================================
   ui.tsx — shared design-system primitives (CSS-var driven).
   Ported from the careeros design system, typed for strict TS.
   ============================================================ */

type Tone = "neutral" | "accent" | "good" | "warn" | "bad" | "info";

/* ---- Card ---- */
export function Card({
  children,
  className = "",
  style = {},
  pad = 22,
  hover = false,
  onClick
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  pad?: number;
  hover?: boolean;
  onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => setH(false)}
      className={"cos-card " + className}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r)",
        padding: pad,
        boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: h ? "translateY(-2px)" : "none",
        transition: "box-shadow .3s var(--ease), transform .3s var(--ease), border-color .3s, background .4s",
        cursor: onClick ? "pointer" : "default",
        ...style
      }}
    >
      {children}
    </div>
  );
}

/* ---- Button ---- */
type ButtonVariant = "primary" | "soft" | "ghost" | "outline" | "dark";
type ButtonSize = "sm" | "md" | "lg";

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  full,
  onClick,
  disabled,
  style = {},
  className = ""
}: {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  full?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const sizes = {
    sm: { padding: "7px 12px", fontSize: 13, gap: 6, radius: "var(--r-sm)" },
    md: { padding: "10px 16px", fontSize: 14, gap: 8, radius: "var(--r-sm)" },
    lg: { padding: "13px 22px", fontSize: 15, gap: 9, radius: "var(--r)" }
  }[size];
  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: { background: "var(--accent)", color: "var(--accent-contrast)", border: "1px solid transparent", boxShadow: "0 1px 2px rgba(0,0,0,.12), 0 6px 18px var(--accent-glow)" },
    soft: { background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent-line)" },
    ghost: { background: "transparent", color: "var(--text-2)", border: "1px solid transparent" },
    outline: { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border-2)" },
    dark: { background: "var(--text)", color: "var(--surface)", border: "1px solid transparent" }
  };
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sizes.gap,
        padding: sizes.padding,
        fontSize: sizes.fontSize,
        fontWeight: 600,
        borderRadius: sizes.radius,
        width: full ? "100%" : "auto",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
        transition: "transform .15s var(--ease), filter .2s, box-shadow .2s, background .25s",
        transform: h ? "translateY(-1px)" : "none",
        filter: h && variant !== "ghost" ? "brightness(1.04)" : "none",
        ...(h && variant === "ghost" ? { background: "var(--surface-2)", color: "var(--text)" } : {}),
        ...variants[variant],
        ...style
      }}
    >
      {icon && <Icon name={icon} size={sizes.fontSize + 2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sizes.fontSize + 2} />}
    </button>
  );
}

/* ---- Badge / Pill ---- */
export function Badge({
  children,
  tone = "neutral",
  icon,
  soft = true,
  style = {}
}: {
  children?: ReactNode;
  tone?: Tone;
  icon?: IconName;
  soft?: boolean;
  style?: CSSProperties;
}) {
  const tones: Record<Tone, { c: string; bg: string; bd: string }> = {
    neutral: { c: "var(--text-2)", bg: "var(--surface-2)", bd: "var(--border)" },
    accent: { c: "var(--accent)", bg: "var(--accent-soft)", bd: "var(--accent-line)" },
    good: { c: "var(--risk-good)", bg: "var(--risk-good-bg)", bd: "transparent" },
    warn: { c: "var(--risk-warn)", bg: "var(--risk-warn-bg)", bd: "transparent" },
    bad: { c: "var(--risk-bad)", bg: "var(--risk-bad-bg)", bd: "transparent" },
    info: { c: "var(--info)", bg: "var(--info-bg)", bd: "transparent" }
  };
  const tn = tones[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: tn.c,
        background: soft ? tn.bg : "transparent",
        border: "1px solid " + tn.bd,
        whiteSpace: "nowrap",
        ...style
      }}
    >
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/* ---- Avatar (initials) ---- */
export function Avatar({ name, size = 38, src }: { name: string; size?: number; src?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = useMemo(() => (name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 360, [name]);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        fontWeight: 700,
        fontSize: size * 0.38,
        color: "#fff",
        overflow: "hidden",
        background: `linear-gradient(140deg, oklch(.62 .12 ${hue}), oklch(.5 .13 ${hue + 35}))`,
        boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.18)"
      }}
    >
      {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}

/* ---- Progress Ring ---- */
export function ProgressRing({
  value,
  size = 120,
  stroke = 11,
  label,
  sublabel,
  color,
  track,
  animate = true,
  children
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sublabel?: ReactNode;
  color?: string;
  track?: string;
  animate?: boolean;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [v, setV] = useState(animate ? 0 : value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), 80);
    return () => clearTimeout(t);
  }, [value]);
  const off = circ * (1 - v / 100);
  const c = color || "var(--accent)";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track || "var(--surface-3)"} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={c}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.1s var(--ease)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        {children || (
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: size * 0.26, lineHeight: 1, color: "var(--text)" }}>{label}</div>
            {sublabel && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3, fontWeight: 600 }}>{sublabel}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Half-circle gauge ---- */
export function Gauge({
  value,
  size = 200,
  label,
  sublabel,
  color
}: {
  value: number;
  size?: number;
  label?: ReactNode;
  sublabel?: ReactNode;
  color?: string;
}) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const circ = Math.PI * r;
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(value), 90);
    return () => clearTimeout(t);
  }, [value]);
  const off = circ * (1 - v / 100);
  const c = color || "var(--accent)";
  return (
    <div style={{ width: size, height: size / 2 + 14, position: "relative" }}>
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        <path d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} strokeLinecap="round" />
        <path
          d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke={c}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.2s var(--ease)" }}
        />
      </svg>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: size * 0.2, lineHeight: 1, color: "var(--text)" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, fontWeight: 600 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

/* ---- Tabs ---- */
type TabItem = { id: string; label: string; icon?: IconName };
export function Tabs({
  tabs,
  active,
  onChange,
  size = "md"
}: {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div style={{ display: "inline-flex", gap: 3, padding: 4, background: "var(--surface-2)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: size === "sm" ? "6px 11px" : "8px 15px",
              fontSize: size === "sm" ? 12.5 : 13.5,
              fontWeight: 600,
              border: "none",
              borderRadius: "var(--r-xs)",
              background: on ? "var(--surface)" : "transparent",
              color: on ? "var(--text)" : "var(--text-2)",
              boxShadow: on ? "var(--shadow-sm)" : "none",
              transition: "all .2s var(--ease)"
            }}
          >
            {t.icon && <Icon name={t.icon} size={14} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---- Segmented signal bar ---- */
type SignalTone = "accent" | "good" | "warn" | "bad" | "info";
export function SignalBar({ value, tone = "accent", height = 8 }: { value: number; tone?: SignalTone; height?: number }) {
  const tones: Record<SignalTone, string> = {
    accent: "var(--accent)",
    good: "var(--risk-good)",
    warn: "var(--risk-warn)",
    bad: "var(--risk-bad)",
    info: "var(--info)"
  };
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 100);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div style={{ height, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: w + "%", background: tones[tone], borderRadius: 99, transition: "width 1s var(--ease)" }} />
    </div>
  );
}

/* ---- Popover (click) ---- */
export function Popover({
  trigger,
  children,
  width = 280,
  align = "left"
}: {
  trigger: ReactNode;
  children: ReactNode;
  width?: number;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", f);
    return () => document.removeEventListener("mousedown", f);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className="anim-pop"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            zIndex: 40,
            [align]: 0,
            width,
            background: "var(--surface)",
            border: "1px solid var(--border-2)",
            borderRadius: "var(--r)",
            boxShadow: "var(--shadow-lg)",
            padding: 14
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ---- Skeleton ---- */
export function Skeleton({ w = "100%", h = 12, style = {} }: { w?: number | string; h?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: "linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)",
        backgroundSize: "200% 100%",
        animation: "sheen 1.3s linear infinite",
        ...style
      }}
    />
  );
}

/* ---- Modal shell ---- */
export function Modal({
  open,
  onClose,
  children,
  width = 720
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", f);
    return () => document.removeEventListener("keydown", f);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(10,12,22,.55)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: 24,
        animation: "fade-up .25s var(--ease)"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="anim-pop"
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflow: "auto",
          background: "var(--surface)",
          border: "1px solid var(--border-2)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---- Stat tile ---- */
export function Stat({
  label,
  value,
  delta,
  deltaTone = "good",
  icon,
  suffix
}: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  deltaTone?: "good" | "bad" | "neutral";
  icon?: IconName;
  suffix?: ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)", marginBottom: 8 }}>
        {icon && <Icon name={icon} size={14} />}
        <span className="kicker" style={{ fontSize: 10.5 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: 30, lineHeight: 1, color: "var(--text)" }}>{value}</span>
        {suffix && <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600 }}>{suffix}</span>}
      </div>
      {delta && (
        <div
          style={{
            marginTop: 7,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12.5,
            fontWeight: 600,
            color: deltaTone === "good" ? "var(--risk-good)" : deltaTone === "bad" ? "var(--risk-bad)" : "var(--text-2)"
          }}
        >
          <Icon name={deltaTone === "bad" ? "trendDown" : "trend"} size={13} />
          {delta}
        </div>
      )}
    </div>
  );
}

/* ---- Confetti burst ---- */
export function Confetti({ run }: { run: boolean }) {
  // Deterministic pseudo-random so SSR/client match and we avoid Math.random in render paths.
  const bits = useMemo(() => {
    const cols = ["var(--accent)", "var(--risk-good)", "var(--info)", "var(--accent-2)", "var(--risk-warn)"];
    return Array.from({ length: 90 }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      const rnd2 = ((i * 4099 + 1) % 233280) / 233280;
      return {
        left: rnd * 100,
        delay: rnd2 * 0.35,
        dur: 1.6 + rnd * 1.4,
        sz: 6 + rnd2 * 8,
        flat: rnd > 0.5,
        round: rnd2 > 0.5,
        col: cols[i % cols.length]
      };
    });
  }, []);
  if (!run) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>
      {bits.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: b.left + "%",
            width: b.sz,
            height: b.sz * (b.flat ? 0.5 : 1),
            background: b.col,
            borderRadius: b.round ? "2px" : "50%",
            animation: `confetti-fall ${b.dur}s var(--ease) ${b.delay}s forwards`
          }}
        />
      ))}
    </div>
  );
}
