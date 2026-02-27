import { C, font } from "../utils/theme";

export function Modal({ children, visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000a",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 100, padding: "0 0 0",
    }}>
      <div style={{
        background: C.card,
        border: `1px solid ${C.borderBright}`,
        borderRadius: "20px 20px 0 0",
        padding: 24,
        width: "100%",
        maxWidth: 480,
        maxHeight: "80vh",
        overflowY: "auto",
        fontFamily: font,
      }}>
        {children}
      </div>
    </div>
  );
}

export function PlayerSelector({ players, onSelect, exclude = [], title, subtitle }) {
    console.log("Players:", players);
  const avail = players.filter((p) => !p.out && !exclude.includes(p.id));
  return (
    <div>
      <div style={{ color: C.text, fontWeight: 800, fontSize: 17, marginBottom: 6, fontFamily: font }}>{title}</div>
      {subtitle && <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 14, fontFamily: font }}>{subtitle}</div>}
      {avail.length === 0 && <div style={{ color: C.textMuted, fontSize: 13, padding: "12px 0", fontFamily: font }}>No players available</div>}
      {avail.map((p) => (
        <div key={p.id} onClick={() => onSelect(p)} style={{
          background: C.surface,
          border: `1.5px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          color: C.text,
          fontFamily: font,
          marginBottom: 6,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: C.borderBright,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, color: C.text,
          }}>
            {String(p?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
            <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{p.runs}R · {p.balls}B</div>
          </div>
        </div>
      ))}
    </div>
  );
}