import React, { useState, useEffect } from "react";
import { C } from "../utils/theme";
import api from "../api/api";
import { Btn } from "../components/Primitives";

export default function MatchHistoryScreen({ nav, onSelectMatch }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getMatchHistory()
      .then(data => {
        setMatches(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load match history");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: C.textMuted }}>
        Loading matches...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: C.red }}>
        {error}
        <div style={{ marginTop: 20 }}>
          <Btn onClick={() => nav("Home")} variant="outline">Go Back</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => nav("Home")}
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
        <span style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Match History</span>
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: C.textMuted }}>
          No matches played yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {matches.map(m => {
            const date = new Date(m.created_at).toLocaleDateString(undefined, {
              month: "short", day: "numeric", year: "numeric"
            });
            return (
              <div
                key={m.id}
                onClick={() => onSelectMatch(m.id)}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 16,
                  cursor: "pointer",
                  transition: "border-color 0.2s"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{date}</span>
                  <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>
                    {m.winner === "Draw" ? "Match Drawn" : `${m.winner} Won`}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{m.team1_name}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
                      {m.team1_score}/{m.team1_wickets} <span style={{ opacity: 0.6 }}>({m.team1_overs})</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: C.textMuted, padding: "0 10px", fontWeight: 700 }}>VS</div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{m.team2_name}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
                      {m.team2_score}/{m.team2_wickets} <span style={{ opacity: 0.6 }}>({m.team2_overs})</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 16, textAlign: "center", opacity: 0.7 }}>
                  {m.overs} Overs • Toss: {m.toss_winner} ({m.toss_decision})
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
