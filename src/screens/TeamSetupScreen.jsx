import { useState } from "react";
import { C, font } from "../utils/theme";
import { Btn, BackBtn, SectionTitle, Input, Badge, Lbl, Divider } from "../components/Primitives";

export default function TeamSetupScreen({ nav, teams, globalPlayers, onSave, onToggleJoker }) {
  const [t1Name, setT1Name] = useState(teams.team1.name || "Six Smashers");
  const [t2Name, setT2Name] = useState(teams.team2.name || "Yorker Kings");
  const [oversInput, setOversInput] = useState(String(teams.overs || 5));
  const [t1Selected, setT1Selected] = useState(new Set(teams.team1.players.map(p => p.id)));
  const [t2Selected, setT2Selected] = useState(new Set(teams.team2.players.map(p => p.id)));

  const overs = parseInt(oversInput) || 0;
  const jokerCount = globalPlayers.filter(p => p.isJoker).length;
  const jokerPlayer = globalPlayers.find(p => p.isJoker);

  const toggle = (setFn, id) =>
    setFn(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const toggleJoker = (id) => {
    const inBoth = t1Selected.has(id) && t2Selected.has(id);
    const op = (prev) => {
      const next = new Set(prev);
      inBoth ? next.delete(id) : next.add(id);
      return next;
    };
    setT1Selected(op);
    setT2Selected(op);
    onToggleJoker(id);
  };

  const canProceed =
    t1Name.trim() && t2Name.trim() &&
    t1Selected.size >= 2 && t2Selected.size >= 2 &&
    overs >= 1;

  const handleSave = () => {
    const resolve = (selected) =>
      globalPlayers
        .filter(p => selected.has(p.id))
        .map(p => ({
          ...p,
          runs: 0, balls: 0, out: false,
          wickets: 0, runsConceded: 0,
          ballsBowled: 0, oversBowled: 0,
        }));

    onSave({
      team1: { name: t1Name.trim(), players: resolve(t1Selected) },
      team2: { name: t2Name.trim(), players: resolve(t2Selected) },
      overs,
    });
    nav("MatchSetup");
  };

  return (
    <div>
      <BackBtn onClick={() => nav("Home")} />
      <SectionTitle title="Team Setup" sub="Name teams and pick players from pool" />

      {/* Overs */}
      <div style={{ marginBottom: 20 }}>
        <Lbl>Overs per innings</Lbl>
        <input
          type="number" min="1" placeholder="e.g. 5"
          value={oversInput} onChange={e => setOversInput(e.target.value)}
          style={{
            width: "100%", background: C.surface,
            border: `1.5px solid ${overs >= 1 ? C.green : C.border}`,
            borderRadius: 10, padding: "11px 13px",
            color: C.text, fontSize: 18, fontWeight: 800,
            outline: "none", boxSizing: "border-box", fontFamily: font,
          }}
        />
        {overs < 1 && oversInput !== "" && (
          <div style={{ color: C.red, fontSize: 11, marginTop: 4, fontFamily: font }}>
            Enter at least 1 over
          </div>
        )}
      </div>

      <Divider />

      {globalPlayers.length === 0 && (
        <div style={{
          background: C.yellow + "12", border: `1px solid ${C.yellow}33`,
          borderRadius: 12, padding: "14px 16px", marginBottom: 16, fontFamily: font,
        }}>
          <div style={{ color: C.yellow, fontWeight: 700, fontSize: 13 }}>⚠ No players in pool</div>
          <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>
            Go to <strong style={{ color: C.blue }}>Manage Players</strong> from Home to add players first.
          </div>
        </div>
      )}

      {/* ── Joker info banner ── */}
      {jokerCount > 0 && (
        <div style={{
          background: "#a78bfa15", border: "1px solid #a78bfa44",
          borderRadius: 10, padding: "10px 14px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8, fontFamily: font,
        }}>
          <span style={{ fontSize: 18 }}>🃏</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 12 }}>
              {jokerPlayer?.name} is the Joker
            </div>
            <div style={{ color: C.textMuted, fontSize: 11, marginTop: 1 }}>
              Joker plays for both teams · auto-selected below
            </div>
          </div>
        </div>
      )}

      {[
        { n: 1, name: t1Name, setName: setT1Name, selected: t1Selected, setSelected: setT1Selected },
        { n: 2, name: t2Name, setName: setT2Name, selected: t2Selected, setSelected: setT2Selected },
      ].map(({ n, name, setName, selected, setSelected }) => (
        <div key={n} style={{ marginBottom: 24 }}>
          <Input placeholder={`Team ${n} Name`} value={name} onChange={setName} style={{ marginBottom: 12 }} />
          <Lbl>
            Players for Team {n}&nbsp;
            <span style={{ color: selected.size >= 2 ? C.green : C.blue, fontWeight: 700 }}>
              ({selected.size} selected)
            </span>
          </Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {globalPlayers.map(p => {
              const sel = selected.has(p.id);
              const otherSelected = n === 1 ? t2Selected : t1Selected;
              const lockedByOther = otherSelected.has(p.id) && !p.isJoker;
              const jokerInBoth = p.isJoker && t1Selected.has(p.id) && t2Selected.has(p.id);

              const handleClick = () => {
                if (lockedByOther) return;
                if (p.isJoker) toggleJoker(p.id);
                else toggle(setSelected, p.id);
              };

              return (
                <div
                  key={p.id}
                  onClick={handleClick}
                  style={{
                    background: sel
                      ? (p.isJoker ? "#a78bfa18" : C.green + "18")
                      : lockedByOther ? "#ffffff06" : C.surface,
                    border: `1.5px solid ${
                      jokerInBoth ? "#a78bfa"
                        : sel ? C.green
                        : lockedByOther ? C.border + "44"
                        : C.border
                    }`,
                    borderRadius: 10, padding: "10px 14px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: lockedByOther ? "not-allowed" : "pointer",
                    opacity: lockedByOther ? 0.35 : 1,
                    fontFamily: font,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: jokerInBoth ? "#a78bfa33" : sel ? C.green + "33" : C.borderBright,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13,
                      color: jokerInBoth ? "#a78bfa" : sel ? C.green : C.text,
                    }}>
                      {String(p?.name || "?").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div style={{
                        fontSize: 14, display: "flex", alignItems: "center", gap: 5,
                        color: sel ? C.text : lockedByOther ? C.textMuted : C.text,
                      }}>
                        {p.name}
                        {p.isJoker && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: "#a78bfa",
                            background: "#a78bfa22", border: "1px solid #a78bfa44",
                            borderRadius: 4, padding: "1px 4px",
                          }}>
                            🃏 JOKER
                          </span>
                        )}
                      </div>
                      {p.isJoker && (
                        <div style={{ color: "#a78bfa88", fontSize: 10, marginTop: 1 }}>
                          {jokerInBoth ? "✓ Selected for both teams" : "Tap to add to both teams"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {/* Joker toggle button */}
                    {!lockedByOther && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!p.isJoker && jokerCount >= 1) return; // already a joker set
                          toggleJoker(p.id);
                        }}
                        style={{
                          background: p.isJoker ? "#a78bfa22" : "transparent",
                          border: `1.5px solid ${p.isJoker ? "#a78bfa" : C.border}`,
                          borderRadius: 8,
                          color: p.isJoker ? "#a78bfa" : (!p.isJoker && jokerCount >= 1) ? C.border : C.textMuted,
                          fontSize: 11, fontWeight: 700,
                          padding: "4px 8px", cursor: (!p.isJoker && jokerCount >= 1) ? "not-allowed" : "pointer",
                          fontFamily: font, flexShrink: 0,
                          opacity: (!p.isJoker && jokerCount >= 1) ? 0.3 : 1,
                          transition: "all 0.15s",
                        }}
                      >
                        {p.isJoker ? "🃏 Joker" : "🃏"}
                      </button>
                    )}

                    {lockedByOther && (
                      <Badge color={C.textMuted}>In Team {n === 1 ? 2 : 1}</Badge>
                    )}
                    {p.isJoker && jokerInBoth && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: "#a78bfa",
                        background: "#a78bfa22", border: "1px solid #a78bfa55",
                        borderRadius: 6, padding: "2px 7px",
                      }}>
                        ✓ Both
                      </span>
                    )}
                    {!p.isJoker && sel && (
                      <span style={{ color: C.green, fontSize: 18, fontWeight: 900 }}>✓</span>
                    )}
                  </div>
                </div>
              );
            })}
            {globalPlayers.length === 0 && (
              <div style={{ color: C.textMuted, fontSize: 12, padding: "8px 0", fontFamily: font }}>
                No players available
              </div>
            )}
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

      <Btn
        label="Continue to Match Setup →"
        color={C.green}
        disabled={!canProceed}
        onClick={handleSave}
        style={{ width: "100%", fontSize: 15 }}
      />
    </div>
  );
}
