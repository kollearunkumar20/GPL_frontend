import { useState, useCallback } from "react";
import { C, font } from "./utils/theme";
import { emptyTeams, initMatch, resetPlayer } from "./utils/helpers";

// Screens
import HomeScreen from "./screens/HomeScreen";
import StartMatchScreen from "./screens/StartMatchScreen";
import TeamSetupScreen from "./screens/TeamSetupScreen";
import { MatchSetupScreen, MatchSetup2Screen } from "./screens/MatchSetupScreen";
import LiveMatchScreen from "./screens/LiveMatchScreen";
import MatchSummaryScreen from "./screens/MatchSummaryScreen";
import { PlayersScreen, LeaderboardScreen } from "./screens/PlayersLeaderboard";
import UnsyncedScreen from "./screens/UnsyncedScreen";
import React, { useEffect } from "react";
import api from "./api/api";

export default function App() {
  const [screen, setScreen] = useState("Home");
  const [teams, setTeams] = useState(emptyTeams());
  const [prevTeams, setPrevTeams] = useState(null);
  const [match, setMatch] = useState(initMatch());
  const [innings1, setInnings1] = useState(null);
  const [unsynced, setUnsynced] = useState([]);

  // Global player pool — persists across matches
  const [globalPlayers, setGlobalPlayers] = useState([]);

  const nav = useCallback((s) => setScreen(s), []);

  // ── Match lifecycle ──────────────────────────────────────────────────────────
  const handleSetup = ({ battingTeam, bowlingTeam, batsman, bowler }) => {
    setMatch({ ...initMatch(), innings: 1, battingTeam, bowlingTeam, batsman, bowler });
  };

  useEffect(() => {
    api.getPlayers()
      .then(data => setGlobalPlayers(data))
      .catch(() => console.log("Failed to load players"));
  }, []);

  // ── handleBall ───────────────────────────────────────────────────────────────
  const handleBall = useCallback((type) => {
    setMatch((prev) => {
      if (type === "REBALL") {
        return {
          ...prev,
          balls: [
            ...prev.balls,
            { run: 0, wicket: false, reball: true, snapshot: null }
          ]
        };
      }

      const ns = prev.score + (type === "TOUCH" ? 1 : 0);
      const nw = prev.wickets + (type === "WICKET" ? 1 : 0);

      let nb = prev.ball + 1;
      let no = prev.over;
      if (nb === 6) { no++; nb = 0; }

      const bat = { ...prev.batsman };
      const bowl = { ...prev.bowler };

      if (type === "TOUCH") bat.runs++;
      if (type !== "REBALL") bat.balls++;
      if (type === "WICKET") bat.out = true;

      if (type !== "REBALL") {
        bowl.ballsBowled++;
        if (bowl.ballsBowled % 6 === 0) bowl.oversBowled++;
      }
      if (type === "WICKET") bowl.wickets++;
      if (type === "TOUCH") bowl.runsConceded++;

      // Update teams state
      setTeams(prevTeams => {
        const updatePlayers = (players) =>
          players.map(p => {
            if (p.id === bat.id) return bat;
            if (p.id === bowl.id) return bowl;
            return p;
          });
        return {
          ...prevTeams,
          team1: { ...prevTeams.team1, players: updatePlayers(prevTeams.team1.players) },
          team2: { ...prevTeams.team2, players: updatePlayers(prevTeams.team2.players) },
        };
      });

      return {
        ...prev,
        score: ns,
        wickets: nw,
        ball: nb,
        over: no,
        // Each ball stores a snapshot of PREVIOUS state so undo can restore it
        balls: [...prev.balls, {
          run: type === "TOUCH" ? 1 : 0,
          wicket: type === "WICKET",
          reball: false,
          snapshot: {
            score: prev.score,
            wickets: prev.wickets,
            ball: prev.ball,
            over: prev.over,
            batsman: { ...prev.batsman },
            bowler: { ...prev.bowler },
          }
        }],
        batsman: bat,
        bowler: bowl,
      };
    });
  }, []);

  // ── handleUndoBall ───────────────────────────────────────────────────────────
  const handleUndoBall = useCallback(() => {
    setMatch((prev) => {
      if (!prev.balls || prev.balls.length === 0) return prev;

      const balls = [...prev.balls];
      const lastBall = balls.pop(); // remove last ball

      // If it was a reball (no snapshot), just remove the ball entry
      if (lastBall.reball || !lastBall.snapshot) {
        return { ...prev, balls };
      }

      const { score, wickets, ball, over, batsman, bowler } = lastBall.snapshot;

      // Restore teams state with snapshotted batsman/bowler stats
      setTeams(prevTeams => {
        const updatePlayers = (players) =>
          players.map(p => {
            if (p.id === batsman.id) return { ...p, ...batsman };
            if (p.id === bowler.id) return { ...p, ...bowler };
            return p;
          });
        return {
          ...prevTeams,
          team1: { ...prevTeams.team1, players: updatePlayers(prevTeams.team1.players) },
          team2: { ...prevTeams.team2, players: updatePlayers(prevTeams.team2.players) },
        };
      });

      return {
        ...prev,
        score,
        wickets,
        ball,
        over,
        batsman: { ...batsman, out: false }, // restore batsman (undo wicket)
        bowler,
        balls,
      };
    });
  }, []);

  // ── Bowler / Batsman change ──────────────────────────────────────────────────
  const handleBowlerChange = (p) => setMatch((prev) => ({ ...prev, bowler: p }));
  const handleBatsmanChange = (p) => setMatch((prev) => ({ ...prev, batsman: p }));

  const handleInningsEnd = () => {
    setInnings1(match);
    setMatch(prev => ({
      ...initMatch(),
      innings: 2,
      battingTeam: prev.bowlingTeam,
      bowlingTeam: prev.battingTeam,
      target: prev.score
    }));
  };

  const handleSetup2 = (bt, bwt, bat, bowl) =>
    setMatch((prev) => ({ ...prev, battingTeam: bt, bowlingTeam: bwt, batsman: bat, bowler: bowl }));

  const handleMatchEnd = () => {
    setPrevTeams({ ...teams });
    nav("MatchSummary");
  };

  const handleSaveMatch = async () => {
    try {
      const payload = api.buildPerformancePayload(teams);
      console.log("SYNC PAYLOAD:", JSON.stringify(payload, null, 2));
      await api.syncPerformance(payload);
      alert("Player stats synced successfully!");
    } catch (err) {
      alert("Sync failed");
    }
  };

  // ── Team management ──────────────────────────────────────────────────────────
  const handleTeamSave = (newTeams) => setTeams(newTeams);

  const handleLoadPrev = () => {
    if (prevTeams)
      setTeams({
        ...prevTeams,
        team1: { ...prevTeams.team1, players: prevTeams.team1.players.map(resetPlayer) },
        team2: { ...prevTeams.team2, players: prevTeams.team2.players.map(resetPlayer) },
      });
  };

  const handleNewMatch = () => setTeams(emptyTeams());

  // ── Global player pool management ────────────────────────────────────────────
  const handleAddPlayerToPool = (playerFromBackend) =>
    setGlobalPlayers(prev => [
      ...prev,
      {
        id: playerFromBackend.id,
        name: playerFromBackend.name,
        role: playerFromBackend.role,
        totalRuns: playerFromBackend.totalRuns ?? 0,
        totalWickets: playerFromBackend.totalWickets ?? 0
      }
    ]);

  const handleDelPlayerFromPool = (i) =>
    setGlobalPlayers((p) => p.filter((_, idx) => idx !== i));

  // All players for leaderboard
  const allTeamPlayers = [...teams.team1.players, ...teams.team2.players];
  const leaderboardPlayers = globalPlayers.map((gp) => {
    const teamMatch = allTeamPlayers.find((tp) => tp.id === gp.id);
    return teamMatch || gp;
  });

  // ── Screen map ───────────────────────────────────────────────────────────────
  const screens = {
    Home: <HomeScreen nav={nav} prevMatch={prevTeams} unsyncedCount={unsynced.length} />,

    StartMatch: (
      <StartMatchScreen
        nav={nav}
        prevMatch={prevTeams}
        onLoadPrev={handleLoadPrev}
        onModifyPrev={handleLoadPrev}
        onNewMatch={handleNewMatch}
      />
    ),

    TeamSetup: (
      <TeamSetupScreen
        nav={nav}
        teams={teams}
        globalPlayers={globalPlayers}
        onSave={handleTeamSave}
      />
    ),

    MatchSetup: (
      <MatchSetupScreen
        nav={nav}
        teams={teams}
        onSetup={handleSetup}
      />
    ),

    LiveMatch: (
      <LiveMatchScreen
        nav={nav}
        teams={teams}
        matchState={match}
        onBall={handleBall}
        onUndoBall={handleUndoBall}
        onBowlerChange={handleBowlerChange}
        onBatsmanChange={handleBatsmanChange}
        onInningsEnd={handleInningsEnd}
        onMatchEnd={handleMatchEnd}
      />
    ),

    MatchSetup2: (
      <MatchSetup2Screen
        nav={nav}
        teams={teams}
        matchState={match}
        onSetup2={handleSetup2}
      />
    ),

    MatchSummary: (
      <MatchSummaryScreen
        nav={nav}
        teams={teams}
        matchState={match}
        innings1Stats={innings1}
        onSave={handleSaveMatch}
        onSameTeams={handleLoadPrev}
        onModify={handleLoadPrev}
        onNew={handleNewMatch}
      />
    ),

    Players: (
      <PlayersScreen
        nav={nav}
        globalPlayers={globalPlayers}
        onAdd={handleAddPlayerToPool}
        onDel={handleDelPlayerFromPool}
      />
    ),

    Leaderboard: (
      <LeaderboardScreen
        nav={nav}
        players={leaderboardPlayers}
      />
    ),

    UnsyncedMatches: (
      <UnsyncedScreen
        nav={nav}
        unsynced={unsynced}
        onSync={(i) => setUnsynced((p) => p.filter((_, idx) => idx !== i))}
        onDel={(i) => setUnsynced((p) => p.filter((_, idx) => idx !== i))}
      />
    ),
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font, color: C.text }}>
      {/* Status bar */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ color: C.text, fontWeight: 800, fontSize: 14, letterSpacing: 1, fontFamily: font }}>GPL Cricket</div>
        <div style={{ color: C.textMuted, fontSize: 12, fontFamily: font }}>{screen.replace(/([A-Z])/g, " $1").trim()}</div>
        <div style={{ display: "flex", gap: 8, color: C.textMuted, fontSize: 12, fontFamily: font }}>📶 🔋</div>
      </div>

      {/* Screen content */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px" }}>
        {screens[screen] || screens.Home}
      </div>
    </div>
  );
}