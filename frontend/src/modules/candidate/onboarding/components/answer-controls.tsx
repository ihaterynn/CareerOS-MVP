"use client";

import { useState } from "react";
import type { AnswerControl, AnswerValue } from "../types";

/**
 * Renders the AnswerControl union. Controls are data on the turn (spec §3), so adding a question
 * type is a mock/backend change, never a new component in the conversation.
 */
export function AnswerControls({
  control,
  onAnswer,
  disabled
}: {
  control: AnswerControl;
  onAnswer: (value: AnswerValue) => void;
  disabled?: boolean;
}) {
  switch (control.kind) {
    case "confirm":
      return (
        <Row>
          <Chip label="All correct" tone="primary" disabled={disabled} onClick={() => onAnswer("yes")} />
          <Chip label="Something's wrong" disabled={disabled} onClick={() => onAnswer("no")} />
        </Row>
      );
    case "chips":
      return (
        <Row>
          {control.options.map((option) => (
            <Chip key={option} label={option} disabled={disabled} onClick={() => onAnswer(option)} />
          ))}
        </Row>
      );
    case "multi":
      return <MultiSelect control={control} onAnswer={onAnswer} disabled={disabled} />;
    case "range":
      return <RangeSelect control={control} onAnswer={onAnswer} disabled={disabled} />;
    case "location":
      return (
        <FreeText
          placeholder="City, state"
          cta="Set location"
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "text":
      return (
        <FreeText
          placeholder={control.placeholder}
          multiline={control.multiline}
          cta="Save"
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
  }
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 11 }}>{children}</div>;
}

function Chip({
  label,
  onClick,
  selected,
  tone = "default",
  disabled
}: {
  label: string;
  onClick: () => void;
  selected?: boolean;
  tone?: "default" | "primary";
  disabled?: boolean;
}) {
  const on = selected || tone === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      style={{
        padding: "8px 14px",
        fontSize: 12,
        fontWeight: 600,
        background: on ? "var(--accent)" : "var(--surface)",
        color: on ? "var(--accent-contrast)" : "var(--text)",
        border: `1px solid ${on ? "var(--accent)" : "var(--border-2)"}`,
        borderRadius: 99,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background .15s var(--ease)"
      }}
    >
      {label}
    </button>
  );
}

function MultiSelect({
  control,
  onAnswer,
  disabled
}: {
  control: Extract<AnswerControl, { kind: "multi" }>;
  onAnswer: (value: AnswerValue) => void;
  disabled?: boolean;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const atMax = control.max != null && picked.length >= control.max;

  const toggle = (option: string) =>
    setPicked((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : atMax ? prev : [...prev, option]
    );

  return (
    <div style={{ marginTop: 11 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {control.options.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={picked.includes(option)}
            disabled={disabled || (atMax && !picked.includes(option))}
            onClick={() => toggle(option)}
          />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <button
          type="button"
          disabled={disabled || picked.length === 0}
          onClick={() => onAnswer(picked)}
          style={ctaStyle(picked.length === 0 || !!disabled)}
        >
          Continue
        </button>
        {control.max ? (
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>
            {picked.length} / {control.max} picked
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RangeSelect({
  control,
  onAnswer,
  disabled
}: {
  control: Extract<AnswerControl, { kind: "range" }>;
  onAnswer: (value: AnswerValue) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(
    Math.round((control.min + control.max) / 2 / control.step) * control.step
  );

  return (
    <div style={{ marginTop: 11 }}>
      <div className="ser" style={{ fontSize: 24, color: "var(--accent)" }}>
        {control.unit === "RM" ? `RM ${value.toLocaleString()}` : `${value} ${control.unit}`}
      </div>
      <input
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        disabled={disabled}
        aria-label={`Select value in ${control.unit}`}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: "100%", maxWidth: 320, marginTop: 8, accentColor: "var(--accent)" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: 320,
          fontSize: 10.5,
          color: "var(--text-3)"
        }}
      >
        <span>{control.min.toLocaleString()}</span>
        <span>{control.max.toLocaleString()}</span>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onAnswer(value)}
        style={{ ...ctaStyle(!!disabled), marginTop: 10 }}
      >
        Continue
      </button>
    </div>
  );
}

function FreeText({
  placeholder,
  multiline,
  cta,
  onAnswer,
  disabled
}: {
  placeholder: string;
  multiline?: boolean;
  cta: string;
  onAnswer: (value: AnswerValue) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const empty = value.trim().length === 0;

  const send = () => {
    if (empty) return;
    onAnswer(value.trim());
    setValue("");
  };

  return (
    <div style={{ marginTop: 11, maxWidth: 460 }}>
      {multiline ? (
        <textarea
          value={value}
          rows={3}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
        />
      ) : (
        <input
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
          style={inputStyle}
        />
      )}
      <button type="button" disabled={disabled || empty} onClick={send} style={{ ...ctaStyle(empty || !!disabled), marginTop: 8 }}>
        {cta}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 12.5,
  background: "var(--inset)",
  border: "1px solid var(--border-2)",
  borderRadius: "var(--r-sm)",
  color: "var(--text)",
  fontFamily: "inherit"
} as const;

function ctaStyle(inactive: boolean) {
  return {
    padding: "9px 16px",
    fontSize: 12,
    fontWeight: 700,
    background: inactive ? "var(--surface-2)" : "var(--accent)",
    color: inactive ? "var(--text-3)" : "var(--accent-contrast)",
    border: `1px solid ${inactive ? "var(--border-2)" : "var(--accent)"}`,
    borderRadius: "var(--r-sm)",
    cursor: inactive ? "default" : "pointer"
  } as const;
}
