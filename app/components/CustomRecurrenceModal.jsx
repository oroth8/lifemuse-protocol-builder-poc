"use client";

import { useState } from "react";
import {
  CUSTOM_RECURRENCE_UNITS,
  CUSTOM_WEEKDAY_PICKER,
  normalizeRecurrenceCustom,
} from "../lib/customRecurrence";

const V = {
  bgCard: "#FFFFFF",
  bdr: "#D8DDEA",
  tx: "#1B2230",
  txM: "#5E6980",
  acc: "#5B5FED",
};
const F = `"Instrument Sans","DM Sans",-apple-system,sans-serif`;

const S = {
  modal: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, .18)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modalC: { background: V.bgCard, border: `1px solid ${V.bdr}`, borderRadius: 14, width: "100%", maxWidth: 620, maxHeight: "80vh", overflow: "auto" },
  modalH: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${V.bdr}` },
  modalB: { padding: "18px 20px" },
  lbl: { fontSize: 11, fontWeight: 600, color: V.txM, textTransform: "uppercase", letterSpacing: "0.06em" },
  inp: { background: "#FFFFFF", border: `1px solid ${V.bdr}`, borderRadius: 6, padding: "8px 10px", fontSize: 13, color: V.tx, fontFamily: F, outline: "none", width: "100%", boxSizing: "border-box" },
  sel: { background: "#FFFFFF", border: `1px solid ${V.bdr}`, borderRadius: 6, padding: "8px 10px", fontSize: 13, color: V.tx, fontFamily: F, outline: "none", width: "100%", boxSizing: "border-box" },
  btnP: { background: V.acc, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F },
  btnS: { background: "transparent", color: V.txM, border: `1px solid ${V.bdr}`, borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: F },
  btnG: { background: "transparent", color: V.txM, border: "none", padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: F, borderRadius: 6 },
};

function ModalCloseButton({ onClose }) {
  return (
    <button
      type="button"
      style={{
        ...S.btnG,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        padding: 0,
        borderRadius: 8,
        flexShrink: 0,
      }}
      onClick={onClose}
      aria-label="Close"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ display: "block" }}>
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/**
 * @param {{
 *   initial?: { repeat_every?: number, repeat_unit?: string, repeat_on?: number[] } | null,
 *   onDone: (custom: { repeat_every: number, repeat_unit: string, repeat_on: number[] }) => void,
 *   onCancel: () => void,
 * }} props
 */
export function CustomRecurrenceModal({ initial, onDone, onCancel }) {
  const base = normalizeRecurrenceCustom(initial);
  const [every, setEvery] = useState(base.repeat_every);
  const [unit, setUnit] = useState(base.repeat_unit);
  const [onDays, setOnDays] = useState(() => [...base.repeat_on]);

  const toggleDay = (d) => {
    setOnDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)));
  };

  const dayBtn = (active) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: `1px solid ${active ? V.acc : V.bdr}`,
    background: active ? V.acc : V.bgCard,
    color: active ? "#fff" : V.tx,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: F,
    padding: 0,
    flexShrink: 0,
  });

  return (
    <div style={S.modal} onClick={onCancel} role="presentation">
      <div style={{ ...S.modalC, maxWidth: 420 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="custom-recurrence-title">
        <div style={{ ...S.modalH, borderBottom: "none", paddingBottom: 0 }}>
          <span id="custom-recurrence-title" style={{ ...S.lbl, fontSize: 13, letterSpacing: "0.08em" }}>
            Custom…
          </span>
          <ModalCloseButton onClose={onCancel} />
        </div>
        <div style={{ ...S.modalB, paddingTop: 12 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ ...S.lbl, display: "block", marginBottom: 8 }}>Repeat every</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <input
                style={{ ...S.inp, width: 72 }}
                type="number"
                min={1}
                step={1}
                value={every}
                onChange={(e) => setEvery(Math.max(1, Number(e.target.value) || 1))}
              />
              <select style={{ ...S.sel, flex: 1, minWidth: 120 }} value={unit} onChange={(e) => setUnit(e.target.value)}>
                {CUSTOM_RECURRENCE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {unit !== "day" && (
            <div style={{ marginBottom: 22 }}>
              <span style={{ ...S.lbl, display: "block", marginBottom: 10 }}>Repeat on</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CUSTOM_WEEKDAY_PICKER.map(({ letter, day }) => (
                  <button key={`${letter}-${day}`} type="button" style={dayBtn(onDays.includes(day))} onClick={() => toggleDay(day)} aria-pressed={onDays.includes(day)}>
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" style={S.btnS} onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              style={S.btnP}
              onClick={() =>
                onDone({
                  repeat_every: every,
                  repeat_unit: unit,
                  repeat_on: unit === "day" ? [] : [...onDays],
                })}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
