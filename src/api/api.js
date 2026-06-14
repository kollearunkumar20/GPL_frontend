import { supabase } from "../lib/supabaseClient";

const api = {

  // ===============================
  // FETCH PLAYERS
  // ===============================
  getPlayers: async () => {
    const { data, error } = await supabase
      .from("player")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      throw new Error("Failed to load players");
    }

    return data;
  },

  // ===============================
  // CREATE PLAYER
  // ===============================
  createPlayer: async (name) => {
    const { data, error } = await supabase
      .from("player")
      .insert([
        {
          name,
          role: "ALL_ROUNDER",
          total_runs: 0,
          total_wickets: 0,
          total_balls_faced: 0,
          total_balls_bowled: 0,
          total_runs_conceded: 0,
          total_innings: 0,
          total_not_outs: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      throw new Error("Failed to create player");
    }

    return data;
  },

  // ===============================
  // DELETE PLAYER
  // ===============================
  deletePlayer: async (id) => {
    const { error } = await supabase
      .from("player")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      throw new Error("Failed to delete player");
    }
  },

  // ===============================
  // UPDATE PERFORMANCE
  // ===============================
  syncPerformance: async (performances) => {
    for (const p of performances) {

      console.log("Processing player:", p.playerId);

      const { data: existing, error: fetchError } = await supabase
        .from("player")
        .select("*")
        .eq("id", p.playerId)
        .single();

      if (fetchError) {
        console.error("FETCH ERROR:", fetchError);
        throw fetchError;
      }

      if (!existing) {
        console.error("No player found with ID:", p.playerId);
        continue;
      }

      const updated = {
        total_runs: (existing.total_runs || 0) + (p.runs || 0),
        total_balls_faced: (existing.total_balls_faced || 0) + (p.ballsFaced || 0),
        total_balls_bowled: (existing.total_balls_bowled || 0) + (p.ballsBowled || 0),
        total_runs_conceded: (existing.total_runs_conceded || 0) + (p.runsConceded || 0),
        total_wickets: (existing.total_wickets || 0) + (p.wickets || 0),
        total_innings: (existing.total_innings || 0) + (p.ballsFaced > 0 ? 1 : 0),
        total_not_outs: (existing.total_not_outs || 0) + (!p.out && p.ballsFaced > 0 ? 1 : 0)
      };

      console.log("Updating with:", updated);

      const { data: updateData, error: updateError } = await supabase
        .from("player")
        .update(updated)
        .eq("id", p.playerId)
        .select();

      if (updateError) {
        console.error("UPDATE ERROR:", updateError);
        throw updateError;
      }

      console.log("Updated row:", updateData);
    }

    return "Synced successfully";
  },

  // ===============================
  // MATCH OPERATIONS
  // ===============================
  saveMatch: async (matchPayload) => {
    const { data, error } = await supabase
      .from("matches")
      .insert([matchPayload])
      .select()
      .single();

    if (error) {
      console.error(error);
      throw new Error("Failed to save match");
    }
    return data;
  },

  getMatchHistory: async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("id, created_at, team1_name, team2_name, overs, toss_winner, toss_decision, winner, team1_score, team1_wickets, team2_score, team2_wickets, team1_overs, team2_overs, status")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      throw new Error("Failed to fetch match history");
    }
    return data;
  },

  getMatchDetails: async (id) => {
    const { data, error } = await supabase
      .from("matches")
      .select("match_data")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      throw new Error("Failed to fetch match details");
    }
    return data?.match_data;
  },

  getAllMatchData: async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("match_data")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      throw new Error("Failed to fetch all match data");
    }
    return data;
  },

  // ===============================
  // PLAYER PROFILE
  // ===============================
  getPlayerStats: async (id) => {
    const { data, error } = await supabase
      .from("player")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      totalRuns: data.total_runs || 0,
      totalBallsFaced: data.total_balls_faced || 0,
      totalBallsBowled: data.total_balls_bowled || 0,
      totalRunsConceded: data.total_runs_conceded || 0,
      totalWickets: data.total_wickets || 0,
      totalMatches: data.total_innings || 0,

      strikeRate: data.total_balls_faced > 0
        ? (data.total_runs / data.total_balls_faced) * 100
        : 0,

      battingAverage: (data.total_innings - data.total_not_outs) > 0
        ? data.total_runs / (data.total_innings - data.total_not_outs)
        : data.total_runs,

      economy: data.total_balls_bowled > 0
        ? (data.total_runs_conceded / (data.total_balls_bowled / 6))
        : 0,

      bowlingAverage: data.total_wickets > 0
        ? data.total_runs_conceded / data.total_wickets
        : 0
    };
  },

  // ===============================
  // LEADERBOARD
  // ===============================
  getLeaderboard: async (type = "batting") => {
    const { data, error } = await supabase
      .from("player")
      .select("*");

    if (error) throw error;

    const normalized = data.map(p => ({
      id: p.id,
      name: p.name,
      totalRuns: p.total_runs || 0,
      totalBallsFaced: p.total_balls_faced || 0,
      totalBallsBowled: p.total_balls_bowled || 0,
      totalRunsConceded: p.total_runs_conceded || 0,
      totalWickets: p.total_wickets || 0,
      totalMatches: p.total_innings || 0,

      strikeRate: p.total_balls_faced > 0
        ? (p.total_runs / p.total_balls_faced) * 100
        : 0,

      battingAverage: (p.total_innings - p.total_not_outs) > 0
        ? p.total_runs / (p.total_innings - p.total_not_outs)
        : p.total_runs,

      economy: p.total_balls_bowled > 0
        ? (p.total_runs_conceded / (p.total_balls_bowled / 6))
        : 0,

      bowlingAverage: p.total_wickets > 0
        ? p.total_runs_conceded / p.total_wickets
        : 0
    }));

    if (type === "batting") {
      return normalized.sort((a, b) => b.totalRuns - a.totalRuns);
    } else {
      return normalized.sort((a, b) => b.totalWickets - a.totalWickets);
    }
  },

  // ===============================
  // LEADERBOARD BY DATE
  // ===============================
  getLeaderboardByDate: async (type = "batting", fromDate = null, toDate = null) => {
    let query = supabase
      .from("matches")
      .select("match_data, created_at")
      .eq("status", "completed");

    if (fromDate) query = query.gte("created_at", fromDate);
    if (toDate) {
      const end = new Date(toDate);
      end.setDate(end.getDate() + 1);
      query = query.lt("created_at", end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const playerMap = {};

    for (const match of data) {
      const md = match.match_data;
      if (!md) continue;

      const allPlayers = [
        ...(md.teams?.team1?.players || []),
        ...(md.teams?.team2?.players || []),
      ];

      for (const p of allPlayers) {
        if (!p?.id || !p?.name) continue;
        if (!playerMap[p.id]) {
          playerMap[p.id] = {
            id: p.id, name: p.name,
            total_runs: 0, total_balls_faced: 0,
            total_balls_bowled: 0, total_runs_conceded: 0,
            total_wickets: 0, total_innings: 0, total_not_outs: 0,
          };
        }
        const pm = playerMap[p.id];
        pm.total_runs += p.runs || 0;
        pm.total_balls_faced += p.balls || 0;
        pm.total_balls_bowled += p.ballsBowled || 0;
        pm.total_runs_conceded += p.runsConceded || 0;
        pm.total_wickets += p.wickets || 0;
        if ((p.balls || 0) > 0) {
          pm.total_innings += 1;
          if (!p.out) pm.total_not_outs += 1;
        }
      }
    }

    const normalized = Object.values(playerMap).map(p => ({
      id: p.id, name: p.name,
      totalRuns: p.total_runs,
      totalWickets: p.total_wickets,
      totalMatches: p.total_innings,
      totalBallsFaced: p.total_balls_faced,
      totalBallsBowled: p.total_balls_bowled,
      totalRunsConceded: p.total_runs_conceded,
      strikeRate: p.total_balls_faced > 0
        ? (p.total_runs / p.total_balls_faced) * 100 : 0,
      battingAverage: (p.total_innings - p.total_not_outs) > 0
        ? p.total_runs / (p.total_innings - p.total_not_outs)
        : p.total_runs,
      economy: p.total_balls_bowled > 0
        ? (p.total_runs_conceded / (p.total_balls_bowled / 6)) : 0,
      bowlingAverage: p.total_wickets > 0
        ? p.total_runs_conceded / p.total_wickets : 0,
    }));

    return type === "batting"
      ? normalized.sort((a, b) => b.totalRuns - a.totalRuns)
      : normalized.sort((a, b) => b.totalWickets - a.totalWickets);
  },

};

export default api;
