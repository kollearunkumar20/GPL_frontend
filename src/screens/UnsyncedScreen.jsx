import { C, font } from "../utils/theme";
import { Btn, BackBtn, SectionTitle } from "../components/Primitives";

export default function UnsyncedScreen({ nav, unsynced, onSync, onDel }) {
  return (
    <div>
      <BackBtn onClick={() => nav("Home")} />
      <SectionTitle title="Unsynced Matches" sub="Saved locally, pending upload" />
      {unsynced.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted, fontFamily: font }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div>All synced!</div>
        </div>
      ) : unsynced.map((m, i) => (
        <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10, fontFamily: font }}>
          <div style={{ color: C.text, fontWeight: 700, marginBottom: 4 }}>{m.team1Name} vs {m.team2Name}</div>
          <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 12 }}>{new Date(m.timestamp).toLocaleDateString()}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Sync" sm color={C.green} onClick={() => onSync(i)} style={{ flex: 1 }} />
            <Btn label="Delete" sm color={C.red} onClick={() => onDel(i)} style={{ flex: 1 }} />
          </div>
        </div>
      ))}
    </div>
  );
}