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

// filterOut: if true, hides dismissed batsmen (batting use). 
// For bowlers, pass filterOut=false so out players still appear.
export function PlayerSelector({ players, onSelect, exclude = [], title, subtitle, filterOut = true }) {
  const avail = players.filter((p) => {
    if (filterOut && p.out) return false;
    return !exclude.includes(p.id);
  });

  return (
    <div>
      <div style={{ color: C.text, fontWeight: 800, fontSize: 17, marginBottom: 6, fontFamily: font }}>{title}</div>
      {subtitle && <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 14, fontFamily: font }}>{subtitle}</div>}
      {avail.length === 0 && (
        <div style={{ color: C.textMuted, fontSize: 13, padding: "12px 0", fontFamily: font }}>
          No players available
        </div>
      )}
      {avail.map((p) => (
        <div key={p.id} onClick={() => onSelect(p)} style={{
          background: C.surface,
          border: `1.5px solid ${p.isJoker ? "#a78bfa" : C.border}`,
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
            background: p.isJoker ? "#a78bfa33" : C.borderBright,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, color: p.isJoker ? "#a78bfa" : C.text,
          }}>
            {String(p?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
              {p.name}
              {p.isJoker && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#a78bfa",
                  background: "#a78bfa22", border: "1px solid #a78bfa55",
                  borderRadius: 4, padding: "1px 5px", letterSpacing: 0.5,
                }}>
                  🃏 JOKER
                </span>
              )}
            </div>
            <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
              {p.runs ?? 0}R · {p.balls ?? 0}B
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}