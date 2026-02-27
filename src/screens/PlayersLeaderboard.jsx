import React, { useState } from "react";
import { C, font } from "../utils/theme";
import { Btn, BackBtn, SectionTitle, Input } from "../components/Primitives";
import api from "../api/api";
import { PlayerProfile } from "./PlayerProfile";

export function PlayersScreen({ nav, globalPlayers, onAdd, onDel }) {
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  if (selectedPlayer) {
    return <PlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />;
  }

  return (
    <div>
      <BackBtn onClick={() => nav("Home")} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionTitle title="Player Pool" sub={`${globalPlayers.length} players`} />
        <Btn label={show ? "Cancel" : "+ Add"} sm color={C.blue} onClick={() => setShow(!show)} />
      </div>
      {show && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ color: C.text, fontWeight: 700, marginBottom: 10, fontFamily: font }}>New Player</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Input placeholder="Player name" value={name} onChange={setName} style={{ flex: 1 }} />
            <Btn
              label="Add"
              sm
              color={C.green}
              onClick={() => {
                if (name.trim()) {
                  api.createPlayer(name.trim())
                    .then(newPlayer => {
                      onAdd(newPlayer);
                      setName("");
                      setShow(false);
                    })
                    .catch(() => alert("Failed to create player"));
                }
              }}
              disabled={!name.trim()}
            />
            <Btn label="Cancel" sm color={C.textMuted} onClick={() => setShow(false)} />
          </div>
        </div>
      )}
      {globalPlayers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted, fontFamily: font }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
          <div>No players yet</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Add players to the pool to use them in matches</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {globalPlayers.map((p, i) => (
            <div
              key={p.id || i}
              onClick={() => {
                api.getPlayerStats(p.id)
                  .then(fullData => setSelectedPlayer(fullData))
                  .catch(() => alert("Failed to load player details"));
              }}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                fontFamily: font, cursor: "pointer",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.blue}33, ${C.purple}33)`,
                border: `1.5px solid ${C.blue}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, color: C.blue, fontSize: 15,
              }}>
                {String(p?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontWeight: 600 }}>{p.name}</div>
                <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{p.totalRuns || p.runs || 0}R · {p.totalWickets || p.wickets || 0}W</div>
              </div>
              <div style={{ color: C.textMuted, fontSize: 14 }}>›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LeaderboardScreen({ nav }) {
  const [tab, setTab] = useState("batting");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const load = (type) => {
    setLoading(true); setError(null);
    api.getLeaderboard(type)
      .then(data => { setPlayers(data); setLoading(false); })
      .catch(() => { setError("Could not load leaderboard from server."); setLoading(false); });
  };

  React.useEffect(() => { load(tab); }, [tab]);

  if (selectedPlayer) {
    return <PlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />;
  }

  const medals = [C.yellow, "#94a3b8", "#b45309"];

  return (
    <div>
      <BackBtn onClick={() => nav("Home")} />
      <SectionTitle title="Leaderboard" sub="Career stats · powered by backend" />

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[["batting", "🏏 Batting"], ["bowling", "⚡ Bowling"]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            flex: 1, padding: "10px 0", borderRadius: 10, fontFamily: font, fontWeight: 700, fontSize: 13,
            background: tab === v ? C.yellow + "22" : "transparent",
            border: `1.5px solid ${tab === v ? C.yellow : C.border}`,
            color: tab === v ? C.yellow : C.textMuted, cursor: "pointer",
          }}>{l}</button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted, fontFamily: font }}>
          Loading leaderboard...
        </div>
      )}
      {error && (
        <div style={{ background: C.red + "15", border: `1px solid ${C.red}33`, borderRadius: 10, padding: "12px 14px", color: C.red, fontSize: 13, fontFamily: font }}>
          {error}
        </div>
      )}
      {!loading && !error && players.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted, fontFamily: font }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🏆</div>
          <div style={{ fontWeight: 700 }}>No data yet</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Play matches and sync stats to see rankings.</div>
        </div>
      )}

      {!loading && players.map((p, i) => (
        <div key={p.id} onClick={() => {
          api.getPlayerStats(p.id)
            .then(fullData => setSelectedPlayer(fullData))
            .catch(() => alert("Failed to load player details"));
        }} style={{
          background: C.card,
          border: `1px solid ${i < 3 ? medals[i] + "44" : C.border}`,
          borderRadius: 12, padding: "13px 16px",
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 8, cursor: "pointer", fontFamily: font,
        }}>
          <div style={{ color: medals[i] || C.textMuted, fontWeight: 900, fontSize: i < 3 ? 20 : 16, width: 28, textAlign: "center" }}>
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.blue}33, ${C.purple}33)`,
            border: `1.5px solid ${C.blue}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 15, color: C.blue, flexShrink: 0,
          }}>
            {String(p?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{p.name}</div>
            <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
              {tab === "batting"
                ? `SR ${p.strikeRate != null ? p.strikeRate.toFixed(1) : "-"} · Avg ${p.battingAverage != null ? p.battingAverage.toFixed(1) : "-"} · ${p.totalMatches ?? 0}m`
                : `Eco ${p.economy != null ? p.economy.toFixed(2) : "-"} · Avg ${p.bowlingAverage != null ? p.bowlingAverage.toFixed(1) : "-"} · ${p.totalMatches ?? 0}m`}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: tab === "batting" ? C.green : C.red, fontWeight: 900, fontSize: 22 }}>
              {tab === "batting" ? (p.totalRuns ?? 0) : (p.totalWickets ?? 0)}
            </div>
            <div style={{ color: C.textMuted, fontSize: 10 }}>{tab === "batting" ? "runs" : "wkts"}</div>
          </div>
          <div style={{ color: C.textMuted, fontSize: 14 }}>›</div>
        </div>
      ))}
    </div>
  );
}