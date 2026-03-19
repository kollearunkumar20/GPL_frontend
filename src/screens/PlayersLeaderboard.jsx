import React, { useState } from "react";
import { C, font } from "../utils/theme";
import { Btn, BackBtn, SectionTitle, Input } from "../components/Primitives";
import api from "../api/api";
import { PlayerProfile } from "./PlayerProfile";

export function PlayersScreen({ nav, globalPlayers, onAdd, onDel, onToggleJoker, showSnack }) {
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [nameError, setNameError] = useState("");

  if (selectedPlayer) {
    return <PlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />;
  }

  const handleNameChange = (val) => {
    setName(val);
    if (!val.trim()) { setNameError(""); return; }
    const duplicate = globalPlayers.some(
      (p) => p.name.trim().toLowerCase() === val.trim().toLowerCase()
    );
    setNameError(duplicate ? `"${val.trim()}" already exists in the player pool.` : "");
  };

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const duplicate = globalPlayers.some(
      (p) => p.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setNameError(`"${trimmed}" already exists in the player pool.`);
      return;
    }

    api.createPlayer(trimmed)
      .then((newPlayer) => {
        onAdd(newPlayer);
        setName("");
        setNameError("");
        setShow(false);
        showSnack(`"${trimmed}" added to player pool!`, "success");
      })
      .catch(() => showSnack("Failed to create player. Try again.", "error"));
  };

  const canSubmit = name.trim() && !nameError;

  // How many jokers are currently set
  const jokerCount = globalPlayers.filter(p => p.isJoker).length;

  return (
    <div>
      <BackBtn onClick={() => nav("Home")} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionTitle title="Player Pool" sub={`${globalPlayers.length} players`} />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Compare" sm color={C.yellow} onClick={() => nav("Compare")} />
          <Btn
            label={show ? "Cancel" : "+ Add"}
            sm color={C.blue}
            onClick={() => { setShow(!show); setName(""); setNameError(""); }}
          />
        </div>
      </div>

      {/* ── Joker info banner (shows once any joker is set) ── */}
      {jokerCount > 0 && (
        <div style={{
          background: "#a78bfa15", border: "1px solid #a78bfa44",
          borderRadius: 10, padding: "10px 14px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 10, fontFamily: font,
        }}>
          <span style={{ fontSize: 20 }}>🃏</span>
          <div>
            <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 12 }}>
              {jokerCount === 1
                ? `${globalPlayers.find(p => p.isJoker)?.name} is the Joker`
                : `${jokerCount} Jokers set`}
            </div>
            <div style={{ color: C.textMuted, fontSize: 11, marginTop: 1 }}>
              Joker can bat &amp; bowl for either team
            </div>
          </div>
        </div>
      )}

      {/* ── Add player form ── */}
      {show && (
        <div style={{
          background: C.card,
          border: `1px solid ${nameError ? C.red + "66" : C.border}`,
          borderRadius: 14, padding: 16, marginBottom: 16,
          transition: "border-color 0.2s",
        }}>
          <div style={{ color: C.text, fontWeight: 700, marginBottom: 10, fontFamily: font }}>New Player</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              placeholder="Player name"
              value={name}
              onChange={handleNameChange}
              style={{ flex: 1, borderColor: nameError ? C.red : undefined }}
            />
            <Btn label="Add" sm color={C.green} onClick={handleAdd} disabled={!canSubmit} />
            <Btn label="Cancel" sm color={C.textMuted} onClick={() => { setShow(false); setName(""); setNameError(""); }} />
          </div>

          {name.trim() && (
            <div style={{ marginTop: 10, fontSize: 12, fontFamily: font, color: nameError ? C.red : C.green, display: "flex", alignItems: "center", gap: 6 }}>
              <span>{nameError ? "⚠️" : "✅"}</span>
              <span>{nameError || `"${name.trim()}" is available`}</span>
            </div>
          )}

          {name.trim() && !nameError && (() => {
            const similar = globalPlayers.filter((p) =>
              p.name.toLowerCase().includes(name.trim().toLowerCase())
            );
            return similar.length > 0 ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ color: C.textMuted, fontSize: 11, fontFamily: font, marginBottom: 6 }}>Similar existing players:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {similar.map((p) => (
                    <span key={p.id} style={{ background: C.blue + "18", border: `1px solid ${C.blue}33`, borderRadius: 8, padding: "3px 10px", fontSize: 12, color: C.blue, fontFamily: font }}>
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* ── Player list ── */}
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
              style={{
                background: p.isJoker ? "#a78bfa0e" : C.card,
                border: `1px solid ${p.isJoker ? "#a78bfa55" : C.border}`,
                borderRadius: 12, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                fontFamily: font,
              }}
            >
              {/* Avatar — tap to open profile */}
              <div
                onClick={() => {
                  api.getPlayerStats(p.id)
                    .then((fullData) => setSelectedPlayer(fullData))
                    .catch(() => showSnack("Failed to load player details.", "error"));
                }}
                style={{
                  width: 36, height: 36, borderRadius: "50%", cursor: "pointer", flexShrink: 0,
                  background: p.isJoker
                    ? `linear-gradient(135deg, #a78bfa55, #7c3aed55)`
                    : `linear-gradient(135deg, ${C.blue}33, ${C.purple}33)`,
                  border: `1.5px solid ${p.isJoker ? "#a78bfa55" : C.blue + "33"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 15,
                  color: p.isJoker ? "#a78bfa" : C.blue,
                }}
              >
                {String(p?.name || "?").charAt(0).toUpperCase()}
              </div>

              {/* Name + stats — tap to open profile */}
              <div
                onClick={() => {
                  api.getPlayerStats(p.id)
                    .then((fullData) => setSelectedPlayer(fullData))
                    .catch(() => showSnack("Failed to load player details.", "error"));
                }}
                style={{ flex: 1, cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: C.text, fontWeight: 600 }}>{p.name}</span>
                  {p.isJoker && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: "#a78bfa",
                      background: "#a78bfa22", border: "1px solid #a78bfa44",
                      borderRadius: 4, padding: "1px 5px", letterSpacing: 0.5,
                    }}>
                      🃏 JOKER
                    </span>
                  )}
                </div>
                <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
                  {p.totalRuns || p.runs || 0}R · {p.totalWickets || p.wickets || 0}W
                </div>
              </div>

              {/* ── Joker toggle button ── */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Only allow setting joker if none set yet, or this player is already the joker
                  if (!p.isJoker && jokerCount >= 1) {
                    showSnack("Only 1 Joker allowed. Remove the current Joker first.", "error");
                    return;
                  }
                  onToggleJoker(p.id);
                  showSnack(
                    p.isJoker ? `${p.name} is no longer Joker` : `${p.name} is now the 🃏 Joker!`,
                    p.isJoker ? "info" : "success"
                  );
                }}
                style={{
                  background: p.isJoker ? "#a78bfa22" : "transparent",
                  border: `1.5px solid ${p.isJoker ? "#a78bfa" : C.border}`,
                  borderRadius: 8,
                  color: p.isJoker ? "#a78bfa" : C.textMuted,
                  fontSize: 11, fontWeight: 700,
                  padding: "5px 9px", cursor: "pointer",
                  fontFamily: font, flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {p.isJoker ? "🃏 Joker" : "🃏"}
              </button>

              {/* Profile arrow */}
              <div
                onClick={() => {
                  api.getPlayerStats(p.id)
                    .then((fullData) => setSelectedPlayer(fullData))
                    .catch(() => showSnack("Failed to load player details.", "error"));
                }}
                style={{ color: C.textMuted, fontSize: 14, cursor: "pointer" }}
              >
                ›
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LeaderboardScreen({ nav, showSnack }) {
  const [tab, setTab] = useState("batting");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const load = (type) => {
    setLoading(true); setError(null);
    api.getLeaderboard(type)
      .then((data) => { setPlayers(data); setLoading(false); })
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
        <div
          key={p.id}
          onClick={() => {
            api.getPlayerStats(p.id)
              .then((fullData) => setSelectedPlayer(fullData))
              .catch(() => showSnack("Failed to load player details.", "error"));
          }}
          style={{
            background: C.card,
            border: `1px solid ${i < 3 ? medals[i] + "44" : C.border}`,
            borderRadius: 12, padding: "13px 16px",
            display: "flex", alignItems: "center", gap: 12,
            marginBottom: 8, cursor: "pointer", fontFamily: font,
          }}
        >
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