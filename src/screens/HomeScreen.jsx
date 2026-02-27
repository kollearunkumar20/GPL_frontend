import { useState } from "react";
import { C, font } from "../utils/theme";
import { Badge } from "../components/Primitives";

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

export default function HomeScreen({ nav, prevMatch, unsyncedCount }) {
  return (
    <div>
      <div style={{ textAlign: "center", padding: "32px 0 28px" }}>
        <div style={{ fontSize: 48 }}>🏏</div>
        <div style={{ color: C.text, fontWeight: 900, fontSize: 28, letterSpacing: 2, fontFamily: font }}>GPL</div>
        <div style={{ color: C.textMuted, fontSize: 13, marginTop: 4, fontFamily: font }}>Gully Premier League</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <MenuBtn icon="🏏" label="Start Match" sub="Set up teams and play" color={C.green} onClick={() => nav("StartMatch")} />
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