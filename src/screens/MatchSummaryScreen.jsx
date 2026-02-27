import { useState } from "react";
import { C, font } from "../utils/theme";
import { Btn, Card, Badge } from "../components/Primitives";
import { ovDisp } from "../utils/helpers";

export default function MatchSummaryScreen({
  nav,
  teams,
  matchState,
  innings1Stats,
  onSave,
  onSameTeams,
  onModify,
  onNew
}) {

  const [saved, setSaved] = useState(false);

  // ─────────────────────────────────────────────────────────
  // Innings Identification (CORRECTED LOGIC)
  // ─────────────────────────────────────────────────────────

  const i1 = innings1Stats;

  const firstInningsTeamKey = i1?.battingTeam;
  const secondInningsTeamKey = matchState?.battingTeam;

  const firstTeamName = teams[firstInningsTeamKey]?.name || "Team 1";
  const secondTeamName = teams[secondInningsTeamKey]?.name || "Team 2";

  const firstScore = i1?.score ?? 0;
  const firstWickets = i1?.wickets ?? 0;
  const firstOver = i1?.over ?? 0;
  const firstBall = i1?.ball ?? 0;

  const secondScore = matchState?.score ?? 0;
  const secondWickets = matchState?.wickets ?? 0;
  const secondOver = matchState?.over ?? 0;
  const secondBall = matchState?.ball ?? 0;

  const required = firstScore + 1;

  const won = secondScore >= required;
  const tie = secondScore === firstScore;

  const winner = tie
    ? "Match Tied"
    : won
    ? secondTeamName
    : firstTeamName;

  // ─────────────────────────────────────────────────────────
  // Player Stats
  // ─────────────────────────────────────────────────────────

  const allPlayers = [
    ...(teams.team1?.players || []),
    ...(teams.team2?.players || [])
  ];

  const bestBat = [...allPlayers].sort((a, b) => (b.runs || 0) - (a.runs || 0))[0];
  const bestBowl = [...allPlayers].sort((a, b) => (b.wickets || 0) - (a.wickets || 0))[0];

  const playersWithStats = allPlayers.filter(
    p => (p.balls > 0) || (p.ballsBowled > 0)
  );

  // ─────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────

  return (
    <div>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
        <div style={{ fontSize: 42 }}>🏆</div>
        <div style={{ color: C.textMuted, fontSize: 13, marginTop: 6, fontFamily: font }}>
          Match Summary
        </div>
        <div style={{ color: C.textMuted, fontSize: 12, fontFamily: font }}>
          {firstTeamName} vs {secondTeamName}
        </div>
      </div>

      {/* Winner Card */}
      <Card
        glow={tie ? C.yellow : won ? C.green : C.red}
        style={{ textAlign: "center", marginBottom: 16 }}
      >
        <div
          style={{
            color: C.textMuted,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            fontFamily: font
          }}
        >
          {tie ? "It's a Tie!" : "Winner"}
        </div>

        <div
          style={{
            color: tie ? C.yellow : won ? C.green : C.red,
            fontWeight: 900,
            fontSize: 26,
            fontFamily: font
          }}
        >
          {winner}
        </div>

        {!tie && (
          <div
            style={{
              color: C.textMuted,
              fontSize: 12,
              marginTop: 4,
              fontFamily: font
            }}
          >
            {won
              ? `${secondTeamName} chased ${required}`
              : `${firstTeamName} defended ${firstScore}`}
          </div>
        )}
      </Card>

      {/* Innings Score Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>

        <Card style={{ textAlign: "center" }}>
          <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, fontFamily: font }}>
            1st Innings
          </div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 13, fontFamily: font }}>
            {firstTeamName}
          </div>
          <div style={{ color: C.white, fontWeight: 900, fontSize: 20, fontFamily: font }}>
            {firstScore}/{firstWickets}
          </div>
          <div style={{ color: C.textMuted, fontSize: 11, fontFamily: font }}>
            {ovDisp(firstOver, firstBall)} overs
          </div>
        </Card>

        <Card style={{ textAlign: "center" }}>
          <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, fontFamily: font }}>
            2nd Innings
          </div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 13, fontFamily: font }}>
            {secondTeamName}
          </div>
          <div style={{ color: C.white, fontWeight: 900, fontSize: 20, fontFamily: font }}>
            {secondScore}/{secondWickets}
          </div>
          <div style={{ color: C.textMuted, fontSize: 11, fontFamily: font }}>
            {ovDisp(secondOver, secondBall)} overs
          </div>
        </Card>

      </div>

      {/* Awards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          {
            icon: "🏏",
            title: "Best Bat",
            name: bestBat?.name || "-",
            stat: `${bestBat?.runs ?? 0} runs`,
            color: C.green
          },
          {
            icon: "⚡",
            title: "Best Bowl",
            name: bestBowl?.name || "-",
            stat: `${bestBowl?.wickets ?? 0} wkts`,
            color: C.red
          },
          {
            icon: "🎯",
            title: "Target",
            name: required,
            stat: won ? "Achieved" : "Not achieved",
            color: won ? C.green : C.red
          }
        ].map(({ icon, title, name, stat, color }) => (
          <Card key={title} style={{ padding: 12 }}>
            <div style={{ fontSize: 18 }}>{icon}</div>
            <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, fontFamily: font }}>
              {title}
            </div>
            <div style={{ color: color, fontWeight: 700, fontSize: 13, fontFamily: font }}>
              {name}
            </div>
            <div style={{ color: C.textMuted, fontSize: 11, fontFamily: font }}>
              {stat}
            </div>
          </Card>
        ))}
      </div>

      {/* Player Stats */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 10, fontFamily: font }}>
          Player Stats
        </div>

        {playersWithStats.length > 0 ? (
          playersWithStats.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: `1px solid ${C.border}`,
                fontFamily: font
              }}
            >
              <div>
                <span style={{ color: C.text }}>{p.name}</span>
                {p.out && <Badge color={C.red}>out</Badge>}
              </div>
              <div style={{ color: C.textSub }}>
                {p.balls > 0 ? `${p.runs}R/${p.balls}B` : ""}
                {p.balls > 0 && p.ballsBowled > 0 ? " · " : ""}
                {p.ballsBowled > 0 ? `${p.wickets}W` : ""}
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: C.textMuted }}>No stats recorded</div>
        )}
      </Card>

      {/* Save Button */}
      {!saved ? (
        <Btn
          label="💾 Save Match"
          color={C.blue}
          onClick={() => {
            onSave();
            setSaved(true);
          }}
          style={{ width: "100%", marginBottom: 12 }}
        />
      ) : (
        <div style={{ color: C.green, textAlign: "center", marginBottom: 12 }}>
          ✓ Saved successfully
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn label="Rematch" color={C.green} onClick={() => { onSameTeams(); nav("MatchSetup"); }} />
        <Btn label="Modify Teams" color={C.blue} onClick={() => { onModify(); nav("TeamSetup"); }} />
        <Btn label="New Match" color={C.purple} onClick={() => { onNew(); nav("TeamSetup"); }} />
      </div>

    </div>
  );
}