import { useState } from "react";
import { C, font } from "../utils/theme";

export function Btn({ label, color = C.blue, onClick, style = {}, sm = false, outline = false, disabled = false, icon }) {
  const [p, setP] = useState(false);
  return (
    <button
      onMouseDown={() => setP(true)}
      onMouseUp={() => setP(false)}
      onMouseLeave={() => setP(false)}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: outline ? "transparent" : p ? color + "40" : color + "18",
        color: disabled ? C.textMuted : color,
        border: `1.5px solid ${disabled ? C.border : color + (outline ? "cc" : "55")}`,
        borderRadius: 10,
        padding: sm ? "8px 14px" : "13px 18px",
        fontSize: sm ? 12 : 14,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        letterSpacing: 0.4,
        transition: "all 0.1s",
        fontFamily: font,
        transform: p && !disabled ? "scale(0.97)" : "scale(1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...style,
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

export function Card({ children, style = {}, glow }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 18,
      boxShadow: glow ? `0 0 24px ${glow}22` : "none",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Input({ placeholder, value, onChange, type = "text", style = {} }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        borderRadius: 10,
        padding: "11px 13px",
        color: C.text,
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box",
        fontFamily: font,
        ...style,
      }}
    />
  );
}

export function Badge({ children, color = C.blue }) {
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      borderRadius: 6,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 700,
      fontFamily: font,
    }}>
      {children}
    </span>
  );
}

export function Lbl({ children }) {
  return (
    <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, fontFamily: font }}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ color: C.text, fontWeight: 800, fontSize: 20, fontFamily: font }}>{title}</div>
      {sub && <div style={{ color: C.textMuted, fontSize: 13, marginTop: 4, fontFamily: font }}>{sub}</div>}
    </div>
  );
}

export function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", fontSize: 13, padding: "0 0 14px", fontFamily: font, display: "flex", alignItems: "center", gap: 6 }}>
      ← Back
    </button>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "14px 0" }} />;
}

export function Field({ label, children, style = {} }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <Lbl>{label}</Lbl>
      {children}
    </div>
  );
}

export function SelectRow({ player, selected, onClick, color }) {
  return (
    <div onClick={onClick} style={{
      background: selected ? color + "18" : C.surface,
      border: `1.5px solid ${selected ? color : C.border}`,
      borderRadius: 10,
      padding: "11px 14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      marginBottom: 6,
      fontFamily: font,
    }}>
      <span style={{ color: C.text, fontSize: 14 }}>{player.name}</span>
      {selected && <Badge color={color}>Selected</Badge>}
    </div>
  );
}

export function ActionBtn({ label, sub, color, onClick, icon }) {
  const [p, setP] = useState(false);
  return (
    <div
      onMouseDown={() => setP(true)}
      onMouseUp={() => setP(false)}
      onMouseLeave={() => setP(false)}
      onClick={onClick}
      style={{
        background: p ? color + "30" : color + "15",
        border: `2px solid ${color}${p ? "bb" : "44"}`,
        borderRadius: 14,
        padding: "16px 12px",
        cursor: "pointer",
        transition: "all 0.1s",
        transform: p ? "scale(0.95)" : "scale(1)",
        textAlign: "center",
        fontFamily: font,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ color, fontWeight: 700, fontSize: 13 }}>{label}</div>
      <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{sub}</div>
    </div>
  );
}