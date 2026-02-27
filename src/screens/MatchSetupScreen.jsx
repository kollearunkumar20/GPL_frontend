import { useState } from "react";
import { font } from "../utils/theme";
import { Btn, BackBtn, SectionTitle, Lbl, SelectRow } from "../components/Primitives";
import {C} from "../utils/theme";

export function MatchSetupScreen({ nav, teams, onSetup, label = "1st" }) {
  const [battingTeam, setBT] = useState("team1");
  const [bat, setBat] = useState(null);
  const [bowl, setBowl] = useState(null);
  const bowlingKey = battingTeam === "team1" ? "team2" : "team1";

  return (
    <div>
      <BackBtn onClick={() => nav("TeamSetup")} />
      <SectionTitle title={`${label} Innings Setup`} sub="Choose opening batsman & bowler" />

      <div style={{ marginBottom: 18 }}>
        <Lbl>Batting Team</Lbl>
        <div style={{ display: "flex", gap: 10 }}>
          {["team1", "team2"].map((k) => (
            <button
              key={k}
              onClick={() => { setBT(k); setBat(null); setBowl(null); }}
              style={{
                flex: 1, padding: "11px 0", borderRadius: 10,
                background: battingTeam === k ? "#f59e0b25" : "#0d1424",
                border: `1.5px solid ${battingTeam === k ? "#f59e0b" : "#1e2d45"}`,
                color: battingTeam === k ? "#f59e0b" : "#94a3b8",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font,
              }}
            >
              {teams[k].name || `Team ${k === "team1" ? 1 : 2}`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Lbl>Opening Batsman ({teams[battingTeam].name})</Lbl>
        {teams[battingTeam].players.map((p) => (
          <SelectRow key={p.id} player={p} selected={bat?.id === p.id} onClick={() => setBat(p)} color="#10b981" />
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <Lbl>Opening Bowler ({teams[bowlingKey].name})</Lbl>
        {teams[bowlingKey].players.map((p) => (
          <SelectRow key={p.id} player={p} selected={bowl?.id === p.id} onClick={() => setBowl(p)} color="#f43f5e" />
        ))}
      </div>

      <Btn
        label="Start Match →"
        color="#10b981"
        disabled={!bat || !bowl}
        onClick={() => { onSetup({ battingTeam, bowlingTeam: bowlingKey, batsman: bat, bowler: bowl }); nav("LiveMatch"); }}
        style={{ width: "100%", fontSize: 15 }}
      />
    </div>
  );
}

export function MatchSetup2Screen({ nav, teams, matchState, onSetup2 }) {
  // matchState still reflects end of innings 1:
  // matchState.battingTeam = who batted in innings 1 → now BOWLS
  // matchState.bowlingTeam = who bowled in innings 1 → now BATS
  const battingTeamKey = matchState.battingTeam;
  const bowlingTeamKey = matchState.bowlingTeam;
  const [bat, setBat] = useState(null);
  const [bowl, setBowl] = useState(null);
  return (
    <div>
      <SectionTitle title="2nd Innings Setup" sub="Choose openers for the chase" />
      <div style={{ background: C.green + "15", border: `1px solid ${C.green}33`, borderRadius: 14, padding: "16px 18px", marginBottom: 20, textAlign: "center", fontFamily: font }}>
        <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 4 }}>TARGET</div>
        <div style={{ color: C.green, fontWeight: 900, fontSize: 36 }}>{matchState.target + 1}</div>
        <div style={{ color: C.textMuted, fontSize: 13 }}>{teams[battingTeamKey].name} need {matchState.target + 1} in {teams.overs} overs</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Lbl>Opening Batsman — {teams[battingTeamKey].name} (chasing)</Lbl>
        {teams[battingTeamKey].players.map(p => (
          <SelectRow key={p.id} player={p} selected={bat?.id === p.id} onClick={() => setBat(p)} color={C.green} />
        ))}
      </div>
      <div style={{ marginBottom: 20 }}>
        <Lbl>Opening Bowler — {teams[bowlingTeamKey].name} (defending)</Lbl>
        {teams[bowlingTeamKey].players.map(p => (
          <SelectRow key={p.id} player={p} selected={bowl?.id === p.id} onClick={() => setBowl(p)} color={C.red} />
        ))}
      </div>
      <Btn
        label="Start 2nd Innings →"
        color={C.green}
        disabled={!bat || !bowl}
        onClick={() => { onSetup2(battingTeamKey, bowlingTeamKey, bat, bowl); nav("LiveMatch"); }}
        style={{ width: "100%", fontSize: 15 }}
      />
    </div>
  );
}