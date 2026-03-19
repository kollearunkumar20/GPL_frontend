import React, { useState } from "react";
import { C, font } from "../utils/theme";
import api from "../api/api";
import { Btn, BackBtn, SectionTitle } from "../components/Primitives";

export default function ComparePlayersScreen({ nav, globalPlayers, showSnack }) {
  const [p1Id, setP1Id] = useState("");
  const [p2Id, setP2Id] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleCompare = async () => {
    if (!p1Id || !p2Id) {
      showSnack("Please select two distinct players.", "error");
      return;
    }
    if (p1Id === p2Id) {
      showSnack("Cannot compare a player with themselves.", "error");
      return;
    }

    setLoading(true);
    setStats(null);
    try {
      const allMatches = await api.getAllMatchData();
      
      let p1BatStats = { runs: 0, balls: 0, outs: 0 };
      let p2BatStats = { runs: 0, balls: 0, outs: 0 };

      // Iterate through all historical ball-by-ball records
      allMatches.forEach(matchRow => {
        const md = matchRow.match_data;
        if (!md) return;
        
        const processInnings = (innings) => {
          if (!innings || !innings.balls) return;
          innings.balls.forEach(b => {
             if (!b.snapshot) return;
             const batId = String(b.snapshot.batsman?.id);
             const bowlId = String(b.snapshot.bowler?.id);

             // P1 Batting vs P2 Bowling
             if (batId === p1Id && bowlId === p2Id) {
               p1BatStats.runs += b.run;
               if (!b.reball) p1BatStats.balls += 1;
               if (b.wicket) p1BatStats.outs += 1;
             }
             // P2 Batting vs P1 Bowling
             else if (batId === p2Id && bowlId === p1Id) {
               p2BatStats.runs += b.run;
               if (!b.reball) p2BatStats.balls += 1;
               if (b.wicket) p2BatStats.outs += 1;
             }
          });
        };

        processInnings(md.innings1);
        processInnings(md.innings2);
      });

      setStats({ p1BatStats, p2BatStats });
    } catch (err) {
      console.error(err);
      showSnack("Failed to compute head-to-head stats.", "error");
    } finally {
      setLoading(false);
    }
  };

  const p1 = globalPlayers.find(p => String(p.id) === String(p1Id));
  const p2 = globalPlayers.find(p => String(p.id) === String(p2Id));

  const StatBox = ({ label, valueP1, valueP2, invert = false }) => {
    const p1Better = invert ? valueP1 < valueP2 : valueP1 > valueP2;
    const p2Better = invert ? valueP2 < valueP1 : valueP2 > valueP1;
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}55` }}>
        <div style={{ width: 40, textAlign: "center", fontWeight: 800, color: p1Better ? C.green : C.text, fontSize: 16 }}>
          {valueP1}
        </div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
          {label}
        </div>
        <div style={{ width: 40, textAlign: "center", fontWeight: 800, color: p2Better ? C.green : C.text, fontSize: 16 }}>
          {valueP2}
        </div>
      </div>
    );
  };

  return (
    <div>
      <BackBtn onClick={() => nav("Players")} />
      <SectionTitle title="Head to Head" sub="Historical Matchups" />

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>PLAYER A</div>
          <select 
            value={p1Id} 
            onChange={(e) => setP1Id(e.target.value)}
            style={{ 
              width: "100%", padding: 12, borderRadius: 10, background: C.surface, color: C.text, 
              border: `1px solid ${C.border}`, fontFamily: font, fontWeight: 600
            }}
          >
            <option value="">Select...</option>
            {globalPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 10, fontWeight: 800, color: C.textMuted }}>VS</div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>PLAYER B</div>
          <select 
            value={p2Id} 
            onChange={(e) => setP2Id(e.target.value)}
            style={{ 
              width: "100%", padding: 12, borderRadius: 10, background: C.surface, color: C.text, 
              border: `1px solid ${C.border}`, fontFamily: font, fontWeight: 600
            }}
          >
            <option value="">Select...</option>
            {globalPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <Btn 
        label={loading ? "Calculating..." : "Compare"} 
        color={C.blue} 
        disabled={loading || !p1Id || !p2Id}
        onClick={handleCompare} 
      />

      {stats && p1 && p2 && (
        <div style={{ 
          marginTop: 30, background: C.surface, borderRadius: 16, 
          border: `1px solid ${C.border}`, padding: "20px 16px" 
        }}>
          {/* Header Row */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.blue }}>{p1.name}</div>
            </div>
            <div style={{ width: 1, background: C.border }} />
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.purple }}>{p2.name}</div>
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 800, color: C.textMuted, textAlign: "center", marginBottom: 12, background: C.border + "33", padding: "6px 0", borderRadius: 6 }}>
            Run Scoring Matches
          </div>
          
          <StatBox 
            label="Runs Scored off each other" 
            valueP1={stats.p1BatStats.runs} 
            valueP2={stats.p2BatStats.runs} 
          />
          <StatBox 
            label="Balls Faced" 
            valueP1={stats.p1BatStats.balls} 
            valueP2={stats.p2BatStats.balls} 
          />
          <StatBox 
            label="Times Dismissed" 
            valueP1={stats.p1BatStats.outs} 
            valueP2={stats.p2BatStats.outs} 
            invert={true} // fewer times dismissed is better
          />
          <StatBox 
            label="Strike Rate against" 
            valueP1={stats.p1BatStats.balls > 0 ? ((stats.p1BatStats.runs / stats.p1BatStats.balls) * 100).toFixed(0) : "0"} 
            valueP2={stats.p2BatStats.balls > 0 ? ((stats.p2BatStats.runs / stats.p2BatStats.balls) * 100).toFixed(0) : "0"} 
          />
        </div>
      )}
    </div>
  );
}
