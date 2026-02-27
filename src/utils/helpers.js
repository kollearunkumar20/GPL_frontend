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