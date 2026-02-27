import { useState, useCallback, useRef } from "react";
import { C, font } from "../utils/theme";

/* ── useSnackbar hook ─────────────────────────────────── */
export function useSnackbar() {
  const [snack, setSnack] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((message, type = "info", duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSnack({ message, type, id: Date.now() });
    timerRef.current = setTimeout(() => setSnack(null), duration);
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSnack(null);
  }, []);

  return { snack, show, hide };
}

/* ── Snackbar component ───────────────────────────────── */
const TYPE_CONFIG = {
  success: { icon: "✅", color: C.green  ?? "#4ade80" },
  error:   { icon: "❌", color: C.red    ?? "#f87171" },
  info:    { icon: "ℹ️",  color: C.blue   ?? "#60a5fa" },
  warn:    { icon: "⚠️", color: C.yellow ?? "#fbbf24" },
};

export function Snackbar({ snack, onHide }) {
  if (!snack) return null;
  const { icon, color } = TYPE_CONFIG[snack.type] || TYPE_CONFIG.info;

  return (
    <div
      key={snack.id}
      onClick={onHide}
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        maxWidth: "90vw",
        minWidth: 220,
        background: C.surface ?? "#1e1e2e",
        border: `1px solid ${color}44`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 12,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: `0 8px 32px rgba(0,0,0,0.45)`,
        fontFamily: font,
        cursor: "pointer",
        animation: "snack-in 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <style>{`
        @keyframes snack-in {
          from { opacity: 0; transform: translateX(-50%) translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);    }
        }
      `}</style>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <span style={{ color: C.text ?? "#fff", fontSize: 13, fontWeight: 600, flex: 1 }}>
        {snack.message}
      </span>
      <span style={{ color: C.textMuted ?? "#888", fontSize: 18, lineHeight: 1, paddingLeft: 4 }}>×</span>
    </div>
  );
}