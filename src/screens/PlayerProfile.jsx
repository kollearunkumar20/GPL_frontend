import React, { useState } from "react";
import { C, font } from "../utils/theme";
import { BackBtn } from "../components/Primitives";
import api from "../api/api";
import { Lbl, Card } from "../components/Primitives";
export function PlayerProfile({ player, onBack }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    React.useEffect(() => {
      setLoading(true);
      api.getPlayerStats(player.id)
        .then(data => { setStats(data); setLoading(false); })
        .catch(() => { setError("Could not load career stats."); setLoading(false); });
    }, [player.id]);
  
    const s = stats;
  
    return (
      <div>
        <BackBtn onClick={onBack} />
  
        {/* Player header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.blue}55, ${C.purple}55)`,
            border: `2px solid ${C.blue}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 30, color: C.blue,
            margin: "0 auto 14px",
          }}>
            {player.name[0].toUpperCase()}
          </div>
          <div style={{ color: C.text, fontWeight: 900, fontSize: 24, fontFamily: font }}>{player.name}</div>
          {s && <div style={{ color: C.textMuted, fontSize: 13, marginTop: 4, fontFamily: font }}>{s.totalMatches ?? 0} matches played</div>}
        </div>
  
        {loading && (
          <div style={{ textAlign: "center", padding: "32px 0", color: C.textMuted, fontFamily: font }}>
            Loading career stats...
          </div>
        )}
  
        {error && (
          <div style={{ background: C.red + "15", border: `1px solid ${C.red}33`, borderRadius: 10, padding: "12px 14px", color: C.red, fontSize: 13, fontFamily: font, textAlign: "center" }}>
            {error}
          </div>
        )}
  
        {s && !loading && (
          <>
            {/* Batting summary row */}
            <div style={{ marginBottom: 8 }}>
              <Lbl>Batting</Lbl>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "Runs", value: s.totalRuns ?? 0, color: C.green },
                  { label: "Balls", value: s.totalBallsFaced ?? 0, color: C.textSub },
                  { label: "SR", value: s.strikeRate != null ? s.strikeRate.toFixed(1) : "-", color: C.yellow },
                  { label: "Avg", value: s.battingAverage != null ? s.battingAverage.toFixed(1) : "-", color: C.blue },
                ].map(({ label, value, color }) => (
                  <Card key={label} style={{ textAlign: "center", padding: "12px 6px" }}>
                    <div style={{ color, fontWeight: 900, fontSize: 18, fontFamily: font }}>{value}</div>
                    <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginTop: 4, fontFamily: font }}>{label}</div>
                  </Card>
                ))}
              </div>
            </div>
  
            {/* Bowling summary row */}
            <div style={{ marginBottom: 16 }}>
              <Lbl>Bowling</Lbl>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "Wkts", value: s.totalWickets ?? 0, color: C.red },
                  { label: "Balls", value: s.totalBallsBowled ?? 0, color: C.textSub },
                  { label: "Eco", value: s.economy != null ? s.economy.toFixed(2) : "-", color: C.purple },
                  { label: "Avg", value: s.bowlingAverage != null ? s.bowlingAverage.toFixed(1) : "-", color: C.blue },
                ].map(({ label, value, color }) => (
                  <Card key={label} style={{ textAlign: "center", padding: "12px 6px" }}>
                    <div style={{ color, fontWeight: 900, fontSize: 18, fontFamily: font }}>{value}</div>
                    <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginTop: 4, fontFamily: font }}>{label}</div>
                  </Card>
                ))}
              </div>
            </div>
  
            {/* Full stat breakdown */}
            <Card>
              <div style={{ color: C.text, fontWeight: 700, fontSize: 13, marginBottom: 12, fontFamily: font }}>Full Career Breakdown</div>
              {[
                ["Matches Played",    s.totalMatches ?? 0],
                ["— Batting —",       null],
                ["Total Runs",         s.totalRuns ?? 0],
                ["Balls Faced",        s.totalBallsFaced ?? 0],
                ["Strike Rate",        s.strikeRate != null ? s.strikeRate.toFixed(2) : "-"],
                ["Batting Average",    s.battingAverage != null ? s.battingAverage.toFixed(2) : "-"],
                ["— Bowling —",       null],
                ["Wickets Taken",      s.totalWickets ?? 0],
                ["Balls Bowled",       s.totalBallsBowled ?? 0],
                ["Runs Conceded",      s.totalRunsConceded ?? 0],
                ["Economy Rate",       s.economy != null ? s.economy.toFixed(2) : "-"],
                ["Bowling Average",    s.bowlingAverage != null ? s.bowlingAverage.toFixed(2) : "-"],
              ].map(([label, value]) =>
                value === null ? (
                  <div key={label} style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, padding: "10px 0 4px", fontFamily: font }}>{label}</div>
                ) : (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.textSub, fontSize: 13, fontFamily: font }}>{label}</span>
                    <span style={{ color: C.text, fontWeight: 700, fontSize: 13, fontFamily: font }}>{value}</span>
                  </div>
                )
              )}
            </Card>
          </>
        )}
      </div>
    );
  }