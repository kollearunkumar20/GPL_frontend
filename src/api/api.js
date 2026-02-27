const API_BASE = "https://gpl-backend-5j75.onrender.com/api";
const api = {

  // ===============================
  // SYNC MATCH PERFORMANCE
  // ===============================
  syncPerformance: async (performances) => {
    const res = await fetch(`${API_BASE}/players/performance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(performances),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Sync error:", text);
      throw new Error("Sync failed");
    }

    return res.text(); // backend returns String
  },

  // ===============================
  // FETCH PLAYER POOL
  // ===============================
  getPlayers: async () => {
    const res = await fetch(`${API_BASE}/players`);
    if (!res.ok) throw new Error("Failed to load players");
    return res.json();
  },

  // ===============================
  // CREATE PLAYER
  // ===============================
  createPlayer: async (name) => {
    const res = await fetch(`${API_BASE}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        role: "ALL_ROUNDER"
      }),
    });

    if (!res.ok) throw new Error("Failed to create player");
    return res.json();
  },

  // ===============================
  // DELETE PLAYER
  // ===============================
  deletePlayer: async (id) => {
    const res = await fetch(`${API_BASE}/players/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete player");
  },

  // ===============================
  // PLAYER PROFILE
  // ===============================
  getPlayerStats: async (id) => {
    const res = await fetch(`${API_BASE}/players/${id}`);
    if (!res.ok) throw new Error("Failed to fetch player stats");
    return res.json();
  },

  // ===============================
  // LEADERBOARD
  // ===============================
  getLeaderboard: async (type = "batting") => {
    const res = await fetch(`${API_BASE}/leaderboard/${type}`);
    if (!res.ok) throw new Error("Failed to load leaderboard");
    return res.json();
  },

  // ===============================
  // BUILD MATCH PAYLOAD
  // ===============================
  buildPerformancePayload: (teams) => {
    return [
      ...teams.team1.players,
      ...teams.team2.players
    ].map(p => ({
      playerId: p.id,
      runs: p.runs || 0,
      ballsFaced: p.balls || 0,
      ballsBowled: p.ballsBowled || 0,
      runsConceded: p.runsConceded || 0,
      wickets: p.wickets || 0,
      out: p.out || false
    }));
  }
};

export default api;