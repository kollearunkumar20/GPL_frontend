import { useState, useCallback } from "react";
import { C, font } from "../utils/theme";
import { Btn, ActionBtn, Card } from "../components/Primitives";
import { Modal, PlayerSelector } from "../components/Modal";
import { ovDisp } from "../utils/helpers";

// ─── Ball Bubble ──────────────────────────────────────────────────────────────
function BallBubble({ b, size = 28 }) {
  const color = b.reball ? C.yellow : b.wicket ? C.red : b.run === 1 ? C.green : C.textMuted;
  const label = b.reball ? "R" : b.wicket ? "W" : b.run;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `1.5px solid ${color}55`,
      background: color + "22",
      display: "flex", alignItems: "center", justifyContent: "center",
      color, fontSize: size * 0.42, fontWeight: 700, fontFamily: font, flexShrink: 0,
    }}>
      {label}
    </div>
  );
}

// ─── Structured Overs Display ─────────────────────────────────────────────────
function OversDisplay({ balls }) {
  if (!balls || balls.length === 0) return null;

  const overs = [];
  let currentOver = [];
  let overNum = 0;

  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    currentOver.push(b);
    const legalInCurrent = currentOver.filter(x => !x.reball).length;
    if (!b.reball && legalInCurrent === 6) {
      overs.push({ num: overNum, balls: currentOver, current: false });
      currentOver = [];
      overNum++;
    }
  }
  if (currentOver.length > 0) {
    overs.push({ num: overNum, balls: currentOver, current: true });
  }

  const visible = overs.slice(-3);

  return (
    <div style={{
      marginBottom: 16,
      background: C.border + "33",
      borderRadius: 12,
      padding: "10px 12px",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{
        color: C.textMuted, fontSize: 10, fontWeight: 700,
        letterSpacing: 1, fontFamily: font, marginBottom: 2,
      }}>
        BALL-BY-BALL
      </div>

      {visible.map((ov) => {
        const legalBalls = ov.balls.filter(b => !b.reball).length;
        const runs = ov.balls.reduce((s, b) => s + (!b.wicket && !b.reball ? b.run : 0), 0);
        const wkts = ov.balls.filter(b => b.wicket).length;

        return (
          <div key={ov.num} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              minWidth: 38, color: ov.current ? C.blue : C.textMuted,
              fontSize: 11, fontWeight: 700, fontFamily: font,
            }}>
              Ov {ov.num + 1}
              {ov.current && (
                <span style={{ display: "block", fontSize: 9, color: C.blue + "aa" }}>live</span>
              )}
            </div>

            <div style={{ display: "flex", gap: 5, flexWrap: "nowrap" }}>
              {ov.balls.map((b, i) => <BallBubble key={i} b={b} size={26} />)}
              {ov.current && Array.from({ length: Math.max(0, 6 - legalBalls) }).map((_, i) => (
                <div key={"e" + i} style={{
                  width: 26, height: 26, borderRadius: "50%",
                  border: `1.5px dashed ${C.border}`, opacity: 0.4,
                }} />
              ))}
            </div>

            {!ov.current && (
              <div style={{
                marginLeft: "auto", color: C.textMuted,
                fontSize: 11, fontFamily: font, whiteSpace: "nowrap",
              }}>
                {runs}r{wkts > 0 ? ` ${wkts}w` : ""}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LiveMatchScreen({
  nav, teams, matchState,
  onBall, onUndoBall,
  onBowlerChange, onBatsmanChange,
  onInningsEnd, onMatchEnd,
  jokers = [],
}) {
  const {
    innings, battingTeam, bowlingTeam,
    batsman, bowler, score, wickets, over, ball, balls, target,
  } = matchState;

  const batting = teams[battingTeam];
  const bowling = teams[bowlingTeam];

  const [modal, setModal] = useState(null);
  // ─── NEW: queue a modal to open after the current one closes ─────────────
  const [pendingModal, setPendingModal] = useState(null);

  // ─── Joker pool merging ───────────────────────────────────────────────────
  const jokerIds = new Set(jokers.map(j => j.id));

  const battingPool = [
    ...batting.players,
    ...bowling.players.filter(p => jokerIds.has(p.id) && !batting.players.find(b => b.id === p.id)),
  ];

  const bowlingPool = [
    ...bowling.players,
    ...batting.players.filter(p => jokerIds.has(p.id) && !bowling.players.find(b => b.id === p.id)),
  ];

  const totalBalls = teams.overs * 6;
  const ballsBowled = over * 6 + ball;
  const progress = Math.min((ballsBowled / totalBalls) * 100, 100);
  const rr = ballsBowled > 0 ? ((score / ballsBowled) * 6).toFixed(2) : "0.00";

  const doInningsEnd = useCallback(() => {
    if (innings === 1) setModal({ type: "inningsEnd" });
    else onMatchEnd();
  }, [innings, onMatchEnd]);

  // ─── handleBall ──────────────────────────────────────────────────────────
  const handleBall = (type) => {
    if (type === "REBALL") { onBall(type); return; }

    const projScore = score + (type === "TOUCH" ? 1 : 0);
    const projWickets = wickets + (type === "WICKET" ? 1 : 0);
    const newBall = ball + 1;
    const newOver = newBall === 6 ? over + 1 : over;
    const oversEnded = newOver >= teams.overs;
    const isOverEnd = newBall === 6;

    onBall(type);

    if (type === "WICKET") {
      // All out → innings end regardless of balls left
      if (projWickets >= battingPool.length) {
        setTimeout(doInningsEnd, 300);
        return;
      }

      const outIds = battingPool.filter(p => p.out).map(p => p.id);

      if (isOverEnd && !oversEnded) {
        // ── 6th ball wicket, NOT last over:
        // Show batsman modal first; queue bowler modal to open after.
        setPendingModal({ type: "bowler", lastBowler: bowler.id });
      }
      // If isOverEnd && oversEnded → innings ends after batsman is selected (handled in onSelect)

      setModal({ type: "batsman", exclude: [...outIds, batsman.id], reason: "wicket", oversEnded });
      return;
    }

    // ── Innings 2 chase complete ─────────────────────────────────────────
    if (innings === 2 && target !== null && projScore > target) {
      setTimeout(onMatchEnd, 300);
      return;
    }

    // ── End of over ──────────────────────────────────────────────────────
    if (isOverEnd) {
      if (oversEnded) setTimeout(doInningsEnd, 300);
      else setModal({ type: "bowler", lastBowler: bowler.id });
    }
  };

  // ─── Batsman selected ────────────────────────────────────────────────────
  // After picking new batsman:
  //   • If a bowler modal is pending (6th-ball wicket) → open it next.
  //   • If the over was the last one (oversEnded flag) → trigger innings end.
  //   • Otherwise just close.
  const handleBatsmanSelect = (p) => {
    onBatsmanChange(p);
    const pending = pendingModal;
    const wasOversEnded = modal?.oversEnded;
    setModal(null);
    setPendingModal(null);

    if (pending) {
      setTimeout(() => setModal(pending), 150);
    } else if (wasOversEnded) {
      setTimeout(doInningsEnd, 300);
    }
  };

  const canUndo = balls && balls.length > 0;

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ color: C.textMuted, fontSize: 12, fontFamily: font }}>Innings {innings}</div>
          {innings === 2 && target !== null && (
            <div style={{ color: C.yellow, fontSize: 12, fontFamily: font, fontWeight: 700 }}>
              Need {Math.max(0, target + 1 - score)} from {totalBalls - ballsBowled} balls
            </div>
          )}
        </div>
        <div style={{ color: C.textMuted, fontSize: 12, fontFamily: font, marginBottom: 8 }}>{batting.name}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ color: C.white, fontWeight: 900, fontSize: 48, fontFamily: font, lineHeight: 1 }}>{score}/{wickets}</div>
          <div>
            <div style={{ color: C.textMuted, fontSize: 11, fontFamily: font }}>RR: {rr}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ color: C.textSub, fontSize: 13, fontFamily: font }}>Overs {over}.{ball}/{teams.overs}</div>
          <div style={{ color: C.textMuted, fontSize: 12, fontFamily: font }}>{totalBalls - ballsBowled}b left</div>
        </div>
        <div style={{ height: 4, background: C.border, borderRadius: 4, marginTop: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${C.green}, ${C.blue})`, borderRadius: 4, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* ── Players ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>

        {/* Batsman card */}
        <Card style={{ padding: 14, position: "relative" }}>
          <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 4, fontFamily: font }}>🏏 Batting</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 14, fontFamily: font }}>{batsman?.name || "—"}</div>
            {batsman?.isJoker && (
              <span style={{ fontSize: 9, color: "#a78bfa", fontWeight: 700, background: "#a78bfa22", borderRadius: 4, padding: "1px 4px" }}>🃏</span>
            )}
          </div>
          <div style={{ color: C.green, fontSize: 11, marginTop: 3, fontFamily: font }}>
            {batsman?.runs || 0}R · {batsman?.balls || 0}B
          </div>
          <button
            onClick={() => {
              const outIds = battingPool.filter(p => p.out).map(p => p.id);
              setModal({ type: "batsman", exclude: outIds, reason: "swap" });
            }}
            style={{
              position: "absolute", top: 8, right: 8,
              background: C.green + "22", border: `1px solid ${C.green}44`,
              borderRadius: 6, color: C.green, fontSize: 10,
              fontFamily: font, fontWeight: 700, padding: "2px 7px", cursor: "pointer",
            }}
          >
            swap
          </button>
        </Card>

        {/* Bowler card */}
        <Card style={{ padding: 14, position: "relative" }}>
          <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 4, fontFamily: font }}>⚡ Bowling</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 14, fontFamily: font }}>{bowler?.name || "—"}</div>
            {bowler?.isJoker && (
              <span style={{ fontSize: 9, color: "#a78bfa", fontWeight: 700, background: "#a78bfa22", borderRadius: 4, padding: "1px 4px" }}>🃏</span>
            )}
          </div>
          <div style={{ color: C.red, fontSize: 11, marginTop: 3, fontFamily: font }}>
            {bowler?.wickets || 0}W · {bowler?.oversBowled || 0}ov
          </div>
          <button
            onClick={() => setModal({ type: "bowler", lastBowler: null, midOver: true })}
            style={{
              position: "absolute", top: 8, right: 8,
              background: C.red + "22", border: `1px solid ${C.red}44`,
              borderRadius: 6, color: C.red, fontSize: 10,
              fontFamily: font, fontWeight: 700, padding: "2px 7px", cursor: "pointer",
            }}
          >
            swap
          </button>
        </Card>
      </div>

      {/* ── Structured Overs ────────────────────────────────── */}
      <OversDisplay balls={balls} />

      {/* ── Action Buttons ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <ActionBtn label="TOUCH" sub="+1 run" color={C.green} icon="🏏" onClick={() => handleBall("TOUCH")} />
        <ActionBtn label="DOT" sub="No run" color={C.textMuted} icon="●" onClick={() => handleBall("DOT")} />
        <ActionBtn label="WICKET" sub="Out!" color={C.red} icon="💥" onClick={() => handleBall("WICKET")} />
        <ActionBtn label="REBALL" sub="Free hit / no ball" color={C.yellow} icon="🔄" onClick={() => handleBall("REBALL")} />
      </div>

      {/* ── Undo Button ──────────────────────────────────────── */}
      {canUndo && (
        <button
          onClick={onUndoBall}
          style={{
            width: "100%", marginBottom: 12,
            background: C.yellow + "15",
            border: `1px solid ${C.yellow}44`,
            borderRadius: 10, padding: "11px 0",
            color: C.yellow, fontWeight: 700, fontSize: 13,
            fontFamily: font, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          ↩ Undo Last Ball
        </button>
      )}

      <Btn label="End Match" color={C.red} outline onClick={() => onMatchEnd()} />

      {/* ── Bowler Change Modal ──────────────────────────────── */}
      <Modal visible={modal?.type === "bowler"}>
        <PlayerSelector
          players={bowlingPool}
          exclude={modal?.midOver ? [] : (modal?.lastBowler ? [modal.lastBowler] : [])}
          title={modal?.midOver ? "Change Bowler (Mid-Over)" : "Change Bowler"}
          subtitle={
            modal?.midOver
              ? "Changing bowler mid-over"
              : "Same bowler can't bowl consecutive overs"
          }
          filterOut={false}
          onSelect={(p) => { onBowlerChange(p); setModal(null); }}
        />
        <Btn
          label={modal?.midOver ? "Cancel" : "Keep Same Bowler"}
          sm color={C.textMuted}
          onClick={() => setModal(null)}
          style={{ marginTop: 12, width: "100%" }}
        />
      </Modal>

      {/* ── Batsman Change Modal ─────────────────────────────── */}
      <Modal visible={modal?.type === "batsman"}>
        <PlayerSelector
          players={battingPool}
          exclude={modal?.exclude || []}
          title={modal?.reason === "wicket" ? "New Batsman" : "Change Batsman"}
          subtitle={
            modal?.reason === "wicket"
              ? "Select next batsman"
              : "Swap current batsman (dismissed players excluded)"
          }
          filterOut={true}
          onSelect={
            modal?.reason === "wicket"
              ? handleBatsmanSelect          // ← uses the new chained handler
              : (p) => { onBatsmanChange(p); setModal(null); }   // swap: plain close
          }
        />
        {modal?.reason === "swap" && (
          <Btn label="Cancel" sm color={C.textMuted}
            onClick={() => setModal(null)}
            style={{ marginTop: 12, width: "100%" }}
          />
        )}
      </Modal>

      {/* ── Innings End Modal ────────────────────────────────── */}
      <Modal visible={modal?.type === "inningsEnd"}>
        <div style={{ textAlign: "center", fontFamily: font }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏏</div>
          <div style={{ color: C.text, fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Innings 1 Complete!</div>
          <div style={{ color: C.textMuted, fontSize: 14, marginBottom: 8 }}>
            {batting.name} scored {score}/{wickets} in {ovDisp(over, ball)} overs
          </div>
          <div style={{ color: C.green, fontWeight: 800, fontSize: 22, marginBottom: 20 }}>
            Target: {score + 1} runs
          </div>
          <Btn
            label="Start 2nd Innings →"
            color={C.green}
            onClick={() => { setModal(null); onInningsEnd(); nav("MatchSetup2"); }}
            style={{ width: "100%" }}
          />
        </div>
      </Modal>
    </div>
  );
}
