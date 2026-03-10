export const uid = () => Math.random().toString(36).slice(2, 8);
export const ovDisp = (o, b) => `${o}.${b}`;

export const resetPlayer = (p) => ({
  ...p,
  runs: 0,
  balls: 0,
  out: false,
  wickets: 0,
  runsConceded: 0,
  ballsBowled: 0,
  oversBowled: 0,
});

/** Empty teams — no dummy data */
export const emptyTeams = () => ({
  team1: { name: "", players: [] },
  team2: { name: "", players: [] },
  overs: 5,
});

export const initMatch = () => ({
  innings: 1,
  battingTeam: "team1",
  bowlingTeam: "team2",
  batsman: null,
  bowler: null,
  score: 0,
  wickets: 0,
  over: 0,
  ball: 0,
  balls: [],
  target: null,
});

/**
 * Builds the sync payload for Supabase.
 *
 * Regular players  → stats passed through as-is.
 * Joker player     → appears in BOTH team arrays, so we:
 *                    1. Sum the two innings values
 *                    2. Divide by 2 (average)
 *                    3. Math.round so 0.5 → 1 (never loses a run/wicket to flooring)
 *
 * Example:
 *   Innings 1: 3 runs, 1 wicket
 *   Innings 2: 5 runs, 0 wickets
 *   Synced:    Math.round((3+5)/2) = 4 runs, Math.round((1+0)/2) = 1 wicket
 */
export const buildPerformancePayload = (teams) => {
  const all = [...teams.team1.players, ...teams.team2.players];

  // Round-half-up helper
  const avg = (a, b) => Math.round((a + b) / 2);

  const merged = {};

  for (const p of all) {
    if (!merged[p.id]) {
      // First occurrence — store as-is
      merged[p.id] = { ...p };
    } else {
      // Second occurrence = joker appeared in both teams → average every stat
      const m = merged[p.id];
      merged[p.id] = {
        ...m,
        runs:         avg(m.runs         || 0, p.runs         || 0),
        balls:        avg(m.balls        || 0, p.balls        || 0),
        wickets:      avg(m.wickets      || 0, p.wickets      || 0),
        ballsBowled:  avg(m.ballsBowled  || 0, p.ballsBowled  || 0),
        runsConceded: avg(m.runsConceded || 0, p.runsConceded || 0),
        out:          m.out || p.out,
      };
    }
  }

  return Object.values(merged).map(p => ({
    playerId:     p.id,
    runs:         p.runs         || 0,
    ballsFaced:   p.balls        || 0,
    ballsBowled:  p.ballsBowled  || 0,
    runsConceded: p.runsConceded || 0,
    wickets:      p.wickets      || 0,
    out:          p.out          || false,
  }));
};

/**
 * Deduplicates a merged array of players from both teams by id.
 * Use anywhere you spread team1.players + team2.players into a
 * single React list to avoid the duplicate-key warning.
 *
 * Usage:
 *   const allPlayers = dedupePlayers([...teams.team1.players, ...teams.team2.players]);
 */
export const dedupePlayers = (players) => {
  const seen = new Set();
  return players.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
};