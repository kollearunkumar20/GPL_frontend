import React, { useState, useEffect } from "react";
import { C } from "../utils/theme";
import api from "../api/api";
import { Btn } from "../components/Primitives";

export default function MatchDetailsScreen({ nav, matchId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("scorecard"); // "scorecard" | "balls"

  useEffect(() => {
    if (!matchId) {
      nav("MatchHistory");
      return;
    }
    
    api.getMatchDetails(matchId)
      .then(matchData => {
        setData(matchData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load match details.");
        setLoading(false);
      });
  }, [matchId, nav]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: C.textMuted }}>
        Loading scorecard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: C.red }}>
        {error || "Match data not found."}
        <div style={{ marginTop: 20 }}>
          <Btn onClick={() => nav("MatchHistory")} variant="outline">Back to History</Btn>
        </div>
      </div>
    );
  }

  const { teams, innings1, innings2 } = data;
  
  const renderTeamScorecard = (team) => (
    <div style={{ marginBottom: 24, background: C.surface, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 12 }}>
        {team.name} Players
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, fontSize: 11, color: C.textMuted, borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8, fontWeight: 700 }}>
        <div>PLAYER</div>
        <div style={{ textAlign: "right" }}>R(B)</div>
        <div style={{ textAlign: "right" }}>W(O)</div>
        <div style={{ textAlign: "right" }}>RC</div>
      </div>
      {team.players.map(p => (
        <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, fontSize: 13, color: C.text, padding: "8px 0", borderBottom: `1px solid ${C.border}55` }}>
          <div style={{ fontWeight: 600 }}>{p.name} {p.out ? <span style={{ color: C.red, fontSize: 10 }}>(Out)</span> : ""}</div>
          <div style={{ textAlign: "right", fontWeight: 700 }}>{p.runs}<span style={{ fontSize: 10, color: C.textMuted, fontWeight: 400 }}>({p.balls})</span></div>
          <div style={{ textAlign: "right", fontWeight: 700 }}>{p.wickets}<span style={{ fontSize: 10, color: C.textMuted, fontWeight: 400 }}>({p.oversBowled}.{p.ballsBowled % 6})</span></div>
          <div style={{ textAlign: "right" }}>{p.runsConceded}</div>
        </div>
      ))}
    </div>
  );

  const renderBalls = (innings, title) => {
    if (!innings || !innings.balls) return null;
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 12, paddingLeft: 8 }}>{title} Timeline</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {innings.balls.map((b, i) => {
            const isWicket = b.wicket;
            const isDot = b.run === 0 && !b.wicket && !b.reball;
            const bg = isWicket ? C.red : isDot ? C.border : C.green;
            const color = isDot ? C.text : "#fff";
            
            const batName = b.snapshot?.batsman?.name || "Unknown";
            const bowlName = b.snapshot?.bowler?.name || "Unknown";
            const overLabel = b.snapshot ? `${b.snapshot.over}.${b.snapshot.ball + 1}` : "?";
            
            return (
              <div key={i} style={{
                background: C.surface, borderRadius: 8, padding: "10px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                border: `1px solid ${C.border}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 700, width: 32 }}>{overLabel}</div>
                  <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>
                    {bowlName} <span style={{ color: C.textMuted, fontSize: 12, fontWeight: 400, margin: "0 6px" }}>to</span> {batName}
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 12, color: isWicket ? C.red : C.text, fontWeight: 700, opacity: isDot ? 0.6 : 1 }}>
                    {isWicket ? "WICKET!" : b.reball ? "Reball" : `${b.run} Run${b.run !== 1 ? "s" : ""}`}
                  </div>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: bg, color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13
                  }}>
                    {isWicket ? "W" : b.reball ? "Re" : b.run}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => nav("MatchHistory")}
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            color: C.text,
            width: 36, height: 36,
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer"
          }}
        >
          ←
        </button>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Match Details</span>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setTab("scorecard")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer", fontWeight: 700,
            background: tab === "scorecard" ? C.blue : "transparent",
            color: tab === "scorecard" ? "#fff" : C.textMuted,
            border: `1px solid ${tab === "scorecard" ? C.blue : C.border}`
          }}
        >
          Scorecard
        </button>
        <button
          onClick={() => setTab("balls")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer", fontWeight: 700,
            background: tab === "balls" ? C.blue : "transparent",
            color: tab === "balls" ? "#fff" : C.textMuted,
            border: `1px solid ${tab === "balls" ? C.blue : C.border}`
          }}
        >
          Ball by Ball
        </button>
      </div>

      {tab === "scorecard" ? (
        <div>
          {teams && teams.team1 && renderTeamScorecard(teams.team1)}
          {teams && teams.team2 && renderTeamScorecard(teams.team2)}
        </div>
      ) : (
        <div>
          {renderBalls(innings1, "1st Innings")}
          {renderBalls(innings2, "2nd Innings")}
        </div>
      )}
    </div>
  );
}
