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
 * The Joker player exists in BOTH team1.players and team2.players,
 * so we deduplicate by id and SUM their stats across both sides.
 * This prevents double-counting their runs/wickets in the backend
 * and also silences the React duplicate-key warning in any list
 * that spreads both team arrays.
 */
export const buildPerformancePayload = (teams) => {
  const all = [...teams.team1.players, ...teams.team2.players];

  // Merge by id — if a player appears twice (joker), sum their stats
  const merged = {};
  for (const p of all) {
    if (!merged[p.id]) {
      merged[p.id] = { ...p };
    } else {
      merged[p.id].runs         = (merged[p.id].runs         || 0) + (p.runs         || 0);
      merged[p.id].balls        = (merged[p.id].balls        || 0) + (p.balls        || 0);
      merged[p.id].wickets      = (merged[p.id].wickets      || 0) + (p.wickets      || 0);
      merged[p.id].ballsBowled  = (merged[p.id].ballsBowled  || 0) + (p.ballsBowled  || 0);
      merged[p.id].runsConceded = (merged[p.id].runsConceded || 0) + (p.runsConceded || 0);
      merged[p.id].out          = merged[p.id].out || p.out;
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
 * Use this anywhere you spread team1.players + team2.players into
 * a single React list to avoid the duplicate-key warning.
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