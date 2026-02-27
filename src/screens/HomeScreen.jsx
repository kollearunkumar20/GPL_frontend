import { useState } from "react";
import { C, font } from "../utils/theme";
import { Badge } from "../components/Primitives";

/* ── Coin Toss Modal ─────────────────────────────────── */
function TossModal({ onClose }) {
  const [phase, setPhase] = useState("idle"); // idle | flipping | result
  const [result, setResult] = useState(null);
  const [choice, setChoice] = useState(null);

  const flip = (picked) => {
    setChoice(picked);
    setPhase("flipping");
    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? "Heads" : "Tails";
      setResult(outcome);
      setPhase("result");
    }, 1800);
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setChoice(null);
  };

  const won = result === choice;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface ?? "#1a1a2e",
          border: `1px solid ${C.border ?? "#ffffff22"}`,
          borderRadius: 20,
          padding: "28px 24px",
          width: "min(340px, 90vw)",
          fontFamily: font,
          position: "relative",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "transparent",
            border: "none",
            color: C.textMuted ?? "#888",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ color: C.text ?? "#fff", fontWeight: 900, fontSize: 20, letterSpacing: 1 }}>
            🪙 Coin Toss
          </div>
          <div style={{ color: C.textMuted ?? "#888", fontSize: 12, marginTop: 4 }}>
            Pick a side, then flip!
          </div>
        </div>

        {/* Coin */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background:
                phase === "result"
                  ? won
                    ? `radial-gradient(circle at 35% 35%, #4ade80, #16a34a)`
                    : `radial-gradient(circle at 35% 35%, #f87171, #dc2626)`
                  : `radial-gradient(circle at 35% 35%, #fde68a, #d97706)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              animation: phase === "flipping" ? "spin 1.8s ease-in-out" : "none",
              transition: "background 0.4s",
            }}
          >
            {phase === "idle" && "🪙"}
            {phase === "flipping" && "🪙"}
            {phase === "result" && (result === "Heads" ? "👑" : "🔵")}
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0%   { transform: rotateY(0deg) scale(1); }
            25%  { transform: rotateY(720deg) scale(1.15); }
            75%  { transform: rotateY(1440deg) scale(1.1); }
            100% { transform: rotateY(1800deg) scale(1); }
          }
        `}</style>

        {/* Result text */}
        {phase === "result" && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: won ? (C.green ?? "#4ade80") : (C.red ?? "#f87171"),
                marginBottom: 4,
              }}
            >
              {won ? "🎉 You Won the Toss!" : "😔 You Lost the Toss"}
            </div>
            <div style={{ color: C.textMuted ?? "#888", fontSize: 13 }}>
              Coin landed on <strong style={{ color: C.text ?? "#fff" }}>{result}</strong>
              {" "}· You chose <strong style={{ color: C.text ?? "#fff" }}>{choice}</strong>
            </div>
          </div>
        )}

        {/* Actions */}
        {phase === "idle" && (
          <>
            <div style={{ color: C.textMuted ?? "#888", fontSize: 12, textAlign: "center", marginBottom: 10 }}>
              Choose your side:
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {["Heads", "Tails"].map((side) => (
                <button
                  key={side}
                  onClick={() => flip(side)}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: 12,
                    border: `1px solid ${C.yellow ?? "#d97706"}55`,
                    background: (C.yellow ?? "#d97706") + "18",
                    color: C.yellow ?? "#d97706",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: font,
                    transition: "all 0.15s",
                  }}
                >
                  {side === "Heads" ? "👑 Heads" : "🔵 Tails"}
                </button>
              ))}
            </div>
          </>
        )}

        {phase === "flipping" && (
          <div style={{ textAlign: "center", color: C.textMuted ?? "#888", fontSize: 14, paddingTop: 4 }}>
            Flipping…
          </div>
        )}

        {phase === "result" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={reset}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 12,
                border: `1px solid ${C.border ?? "#ffffff22"}`,
                background: "transparent",
                color: C.textMuted ?? "#888",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: font,
              }}
            >
              Flip Again
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 12,
                border: "none",
                background: C.green ?? "#16a34a",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: font,
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MenuBtn ─────────────────────────────────────────── */
function MenuBtn({ icon, label, sub, color, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={onClick}
      style={{
        background: h ? color + "18" : color + "0d",
        border: `1px solid ${h ? color + "66" : color + "33"}`,
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transition: "all 0.15s",
        textAlign: "left",
        fontFamily: font,
        width: "100%",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{label}</div>
        <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  );
}

/* ── HomeScreen ──────────────────────────────────────── */
export default function HomeScreen({ nav, prevMatch, unsyncedCount }) {
  const [showToss, setShowToss] = useState(false);

  return (
    <div>
      {showToss && <TossModal onClose={() => setShowToss(false)} />}

      <div style={{ textAlign: "center", padding: "32px 0 28px" }}>
        <div style={{ fontSize: 48 }}>🏏</div>
        <div style={{ color: C.text, fontWeight: 900, fontSize: 28, letterSpacing: 2, fontFamily: font }}>GPL</div>
        <div style={{ color: C.textMuted, fontSize: 13, marginTop: 4, fontFamily: font }}>Gully Premier League</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <MenuBtn icon="🏏" label="Start Match" sub="Set up teams and play" color={C.green} onClick={() => nav("StartMatch")} />
        <MenuBtn icon="🪙" label="Toss a Coin" sub="Decide who bats first" color={C.yellow} onClick={() => setShowToss(true)} />
        <MenuBtn icon="👥" label="Manage Players" sub="Add or remove players from pool" color={C.blue} onClick={() => nav("Players")} />
        <MenuBtn icon="🏆" label="Leaderboard" sub="Career stats and rankings" color={C.yellow} onClick={() => nav("Leaderboard")} />
        <div
          onClick={() => nav("UnsyncedMatches")}
          style={{
            background: unsyncedCount > 0 ? C.red + "12" : "transparent",
            border: `1px solid ${unsyncedCount > 0 ? C.red + "44" : C.border}`,
            borderRadius: 14,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            color: unsyncedCount > 0 ? C.text : C.textMuted,
            fontFamily: font,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 22 }}>🔄</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Unsynced Matches</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>{unsyncedCount} pending</div>
            </div>
          </div>
          {unsyncedCount > 0 && <Badge color={C.red}>{unsyncedCount}</Badge>}
        </div>
      </div>
    </div>
  );
}