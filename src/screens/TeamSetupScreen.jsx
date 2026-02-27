import React, { useState } from "react";
import { C, font } from "../utils/theme";
import { Btn, BackBtn, SectionTitle, Input, Badge, Lbl, Divider } from "../components/Primitives";

/**
 * TeamSetupScreen
 * - Choose team names
 * - Pick players from globalPlayers pool (checkbox style)
 * - OR create new players on the fly (they also get added to pool via onAddGlobalPlayer)
 * - Set overs
 */
export default function TeamSetupScreen({ nav, teams, globalPlayers, onSave }) {
  const [t1Name, setT1Name] = useState(teams.team1.name || "");
  const [t2Name, setT2Name] = useState(teams.team2.name || "");
  const [oversInput, setOversInput] = useState(String(teams.overs || 5));
  const [t1Selected, setT1Selected] = useState(new Set(teams.team1.players.map(p => p.id)));
  const [t2Selected, setT2Selected] = useState(new Set(teams.team2.players.map(p => p.id)));

  const overs = parseInt(oversInput) || 0;
  const toggle = (set, setFn, id) => setFn(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const canProceed = t1Name.trim() && t2Name.trim() && t1Selected.size >= 2 && t2Selected.size >= 2 && overs >= 1;

  const handleSave = () => {
    const resolve = (selected) =>
      globalPlayers
        .filter(p => selected.has(p.id))
        .map(p => ({
          ...p,
          runs: 0,
          balls: 0,
          out: false,
          wickets: 0,
          runsConceded: 0,
          ballsBowled: 0,
          oversBowled: 0,
        }));    onSave({ team1: { name: t1Name.trim(), players: resolve(t1Selected) }, team2: { name: t2Name.trim(), players: resolve(t2Selected) }, overs });
    nav("MatchSetup");
  };

  return (
    <div>
      <BackBtn onClick={() => nav("Home")} />
      <SectionTitle title="Team Setup" sub="Name teams and pick players from pool" />

      {/* Overs — typed input */}
      <div style={{ marginBottom: 20 }}>
        <Lbl>Overs per innings</Lbl>
        <input
          type="number"
          min="1"
          placeholder="e.g. 5"
          value={oversInput}
          onChange={e => setOversInput(e.target.value)}
          style={{ width: "100%", background: C.surface, border: `1.5px solid ${overs >= 1 ? C.green : C.border}`, borderRadius: 10, padding: "11px 13px", color: C.text, fontSize: 18, fontWeight: 800, outline: "none", boxSizing: "border-box", fontFamily: font }}
        />
        {overs < 1 && oversInput !== "" && <div style={{ color: C.red, fontSize: 11, marginTop: 4, fontFamily: font }}>Enter at least 1 over</div>}
      </div>

      <Divider />

      {/* No players in pool warning */}
      {globalPlayers.length === 0 && (
        <div style={{ background: C.yellow + "12", border: `1px solid ${C.yellow}33`, borderRadius: 12, padding: "14px 16px", marginBottom: 16, fontFamily: font }}>
          <div style={{ color: C.yellow, fontWeight: 700, fontSize: 13 }}>⚠ No players in pool</div>
          <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>Go to <strong style={{ color: C.blue }}>Manage Players</strong> from Home to add players first.</div>
        </div>
      )}

      {/* Team sections */}
      {[
        { n: 1, name: t1Name, setName: setT1Name, selected: t1Selected, setSelected: setT1Selected },
        { n: 2, name: t2Name, setName: setT2Name, selected: t2Selected, setSelected: setT2Selected },
      ].map(({ n, name, setName, selected, setSelected }) => (
        <div key={n} style={{ marginBottom: 24 }}>
          <Input placeholder={`Team ${n} Name`} value={name} onChange={setName} style={{ marginBottom: 12 }} />
          <Lbl>
            Players for Team {n}&nbsp;
            <span style={{ color: selected.size >= 2 ? C.green : C.blue, fontWeight: 700 }}>({selected.size} selected)</span>
          </Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {globalPlayers.map(p => {
              const sel = selected.has(p.id);
              const otherSelected = n === 1 ? t2Selected : t1Selected;
              const lockedByOther = otherSelected.has(p.id);
              return (
                <div key={p.id} onClick={() => !lockedByOther && toggle(selected, setSelected, p.id)} style={{ background: sel ? C.green + "18" : lockedByOther ? "#ffffff06" : C.surface, border: `1.5px solid ${sel ? C.green : lockedByOther ? C.border + "44" : C.border}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: lockedByOther ? "not-allowed" : "pointer", opacity: lockedByOther ? 0.35 : 1, fontFamily: font }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: sel ? C.green + "33" : C.borderBright, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: sel ? C.green : C.text }}>{String(p?.name || "?").charAt(0).toUpperCase()}</div>
                    <span style={{ color: sel ? C.text : lockedByOther ? C.textMuted : C.text, fontSize: 14 }}>{p.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {lockedByOther && <Badge color={C.textMuted}>In Team {n === 1 ? 2 : 1}</Badge>}
                    {sel && <span style={{ color: C.green, fontSize: 18, fontWeight: 900 }}>✓</span>}
                  </div>
                </div>
              );
            })}
            {globalPlayers.length === 0 && <div style={{ color: C.textMuted, fontSize: 12, padding: "8px 0", fontFamily: font }}>No players available</div>}
          </div>
        </div>
      ))}

      {!canProceed && (t1Name || t2Name) && (
        <div style={{ color: C.red, fontSize: 12, marginBottom: 12, fontFamily: font }}>
          {!t1Name.trim() && <div>• Team 1 name required</div>}
          {!t2Name.trim() && <div>• Team 2 name required</div>}
          {t1Selected.size < 2 && <div>• Team 1 needs at least 2 players</div>}
          {t2Selected.size < 2 && <div>• Team 2 needs at least 2 players</div>}
          {overs < 1 && <div>• Enter valid overs count</div>}
        </div>
      )}
      <Btn label="Continue to Match Setup →" color={C.green} disabled={!canProceed} onClick={handleSave} style={{ width: "100%", fontSize: 15 }} />
    </div>
  );
}
