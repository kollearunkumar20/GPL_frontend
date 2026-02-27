import { useEffect } from "react";
import { C, font } from "../utils/theme";
import { Btn, BackBtn, SectionTitle, Card } from "../components/Primitives";

export default function StartMatchScreen({
  nav,
  prevMatch,
  onLoadPrev,
  onModifyPrev,
  onNewMatch,
}) {

  useEffect(() => {
    if (!prevMatch) {
      onNewMatch();
      nav("TeamSetup");
    }
  }, [prevMatch, onNewMatch, nav]);

  if (!prevMatch) return null;

  return (
    <div>
      <BackBtn onClick={() => nav("Home")} />
      <SectionTitle title="Start Match" sub="Continue or start fresh" />

      <Card style={{ marginBottom: 18 }}>
        <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 6, fontFamily: font }}>
          PREVIOUS MATCH
        </div>
        <div style={{ color: C.text, fontWeight: 700, fontSize: 16, fontFamily: font }}>
          {prevMatch.team1.name} vs {prevMatch.team2.name}
        </div>
        <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4, fontFamily: font }}>
          {prevMatch.overs} overs · {prevMatch.team1.players.length + prevMatch.team2.players.length} players
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn
          label="Use Same Teams"
          color="#10b981"
          onClick={() => {
            onLoadPrev();
            nav("MatchSetup");
          }}
          style={{ width: "100%" }}
        />
        <Btn
          label="Modify Teams"
          color="#38bdf8"
          onClick={() => {
            onModifyPrev();
            nav("TeamSetup");
          }}
          style={{ width: "100%" }}
        />
        <Btn
          label="New Match"
          color="#a78bfa"
          onClick={() => {
            onNewMatch();
            nav("TeamSetup");
          }}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}