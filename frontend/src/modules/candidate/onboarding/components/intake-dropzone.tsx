"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import type { IntakeSourceKind } from "../types";
import { parseStartOnboarding } from "../schema";

/**
 * The one screen that matters: four ways in, all of them one action. The résumé drop is the
 * headline because parsing is what saves the candidate the form (spec §1).
 */
export function IntakeDropzone({
  onStart,
  busy
}: {
  onStart: (kind: IntakeSourceKind, payload?: string, file?: File) => void;
  busy: boolean;
}) {
  const [mode, setMode] = useState<"idle" | "linkedin" | "paste">("idle");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const submit = (kind: "linkedin" | "paste") => {
    const result = parseStartOnboarding({ sourceKind: kind, payload: value });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onStart(kind, result.data.payload);
  };

  const takeFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    onStart("resume", file.name, file);
  };

  return (
    <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          takeFile(e.dataTransfer.files?.[0]);
        }}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-2)"}`,
          background: dragging ? "var(--accent-soft)" : "var(--inset)",
          borderRadius: "var(--r-lg)",
          padding: "34px 24px",
          textAlign: "center",
          transition: "background .2s var(--ease), border-color .2s var(--ease)"
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            margin: "0 auto",
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "var(--accent-soft)",
            color: "var(--accent)"
          }}
        >
          <Icon name="sparkles" size={22} />
        </div>
        <div className="ser" style={{ fontSize: 19, marginTop: 12 }}>
          Drop your résumé
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-2)", margin: "6px 0 0", lineHeight: 1.55 }}>
          PDF or DOCX. I&rsquo;ll read it and only ask about what it doesn&rsquo;t tell me.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
          style={{
            marginTop: 14,
            padding: "10px 18px",
            fontSize: 12.5,
            fontWeight: 700,
            background: "var(--accent)",
            color: "var(--accent-contrast)",
            border: "none",
            borderRadius: "var(--r-sm)",
            boxShadow: "0 6px 18px var(--accent-glow)",
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1
          }}
        >
          Choose file
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => takeFile(e.target.files?.[0])}
          style={{ display: "none" }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "var(--text-3)" }}>
        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
        or
        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
        <AltRoute
          icon="building"
          label="LinkedIn URL"
          active={mode === "linkedin"}
          onClick={() => {
            setMode(mode === "linkedin" ? "idle" : "linkedin");
            setValue("");
            setError(null);
          }}
        />
        <AltRoute
          icon="edit"
          label="Paste résumé"
          active={mode === "paste"}
          onClick={() => {
            setMode(mode === "paste" ? "idle" : "paste");
            setValue("");
            setError(null);
          }}
        />
        <AltRoute icon="message" label="Just talk to me" onClick={() => onStart("conversation")} />
      </div>

      {mode !== "idle" ? (
        <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mode === "linkedin" ? (
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit("linkedin");
              }}
              placeholder="https://linkedin.com/in/your-handle"
              style={fieldStyle}
            />
          ) : (
            <textarea
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={6}
              placeholder="Paste the text of your résumé…"
              style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55 }}
            />
          )}
          {error ? (
            <p style={{ fontSize: 11.5, color: "var(--risk-bad)", margin: 0 }} role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => submit(mode)}
            style={{
              alignSelf: "flex-start",
              padding: "9px 16px",
              fontSize: 12.5,
              fontWeight: 700,
              background: "var(--accent)",
              color: "var(--accent-contrast)",
              border: "none",
              borderRadius: "var(--r-sm)",
              cursor: "pointer"
            }}
          >
            Read it
          </button>
        </div>
      ) : null}
    </div>
  );
}

const fieldStyle = {
  width: "100%",
  padding: "11px 13px",
  fontSize: 12.5,
  background: "var(--inset)",
  border: "1px solid var(--border-2)",
  borderRadius: "var(--r-sm)",
  color: "var(--text)",
  fontFamily: "inherit"
} as const;

function AltRoute({
  icon,
  label,
  active,
  onClick
}: {
  icon: "building" | "edit" | "message";
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
        padding: "13px 8px",
        fontSize: 11.5,
        fontWeight: 600,
        background: active ? "var(--accent-soft)" : "var(--surface)",
        color: active ? "var(--accent)" : "var(--text-2)",
        border: `1px solid ${active ? "var(--accent-line)" : "var(--border)"}`,
        borderRadius: "var(--r-sm)",
        cursor: "pointer"
      }}
    >
      <Icon name={icon} size={17} />
      {label}
    </button>
  );
}
