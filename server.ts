import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // In-memory state for matches and players
  const matches: Record<string, any> = {
    "archived-1": {
      id: "archived-1",
      sport: "Cricket",
      title: "Season Grand Finale",
      teamA: { name: "Titans", score: 156 },
      teamB: { name: "Eagles", score: 158 },
      status: 'finished',
      date: "2026-04-25",
      time: "02:00 PM",
      venue: "Village Ground",
      lastEvent: { team: "B", points: 2, player: "J. Doe", type: "score" }
    },
    "archived-2": {
      id: "archived-2",
      sport: "Volleyball",
      title: "Mega Final",
      teamA: { name: "Lions", score: 25 },
      teamB: { name: "Panthers", score: 18 },
      status: 'finished',
      date: "2026-04-24",
      time: "11:00 AM",
      venue: "Town Oval",
      lastEvent: { team: "A", points: 1, player: "S. Smith", type: "score" }
    },
    "archived-3": {
      id: "archived-3",
      sport: "Kabaddi",
      title: "Udupi Super Final",
      teamA: { name: "Dragons", score: 38 },
      teamB: { name: "Phoenix", score: 32 },
      status: 'finished',
      date: "2026-04-23",
      time: "03:30 PM",
      venue: "Metro Arena",
      lastEvent: { team: "A", points: 2, player: "P. Rangan", type: "Raid" }
    },
    "live-1": {
      id: "live-1",
      sport: "Cricket",
      teamA: { name: "Village Bulls", score: 45, wickets: 2 },
      teamB: { name: "City Tigers", score: 48, wickets: 1 },
      status: "live",
      lastEvent: { team: 'B', points: 4, player: 'Suresh Hegde', type: 'runs' },
      createdAt: Date.now(),
      playerScores: {
        "Suresh Hegde": { runs: 28, wickets: 0 },
        "Ramesh Kumar": { runs: 45, wickets: 1 }
      },
      poll: { teamA: 12, teamB: 15, total: 27 }
    },
    "sched-1": { 
      id: "sched-1", 
      sport: "Volleyball", 
      teamA: { name: "Coastal Spikers", score: 0, wickets: 0 }, 
      teamB: { name: "Ghat Warriors", score: 0, wickets: 0 }, 
      status: "scheduled", 
      date: "2026-04-28",
      time: "10:00 AM",
      venue: "Mangalore Beach",
      createdAt: Date.now() + 86400000 
    },
    "sched-2": { 
      id: "sched-2", 
      sport: "Kabaddi", 
      teamA: { name: "Kalyan Kings", score: 0, wickets: 0 }, 
      teamB: { name: "Raider Squad", score: 0, wickets: 0 }, 
      status: "scheduled", 
      date: "2026-04-29",
      time: "04:30 PM",
      venue: "Kalyan Stadium",
      createdAt: Date.now() + 172800000 
    },
    "sched-3": { 
      id: "sched-3", 
      sport: "Cricket", 
      teamA: { name: "Shimoga Sharks", score: 0, wickets: 0 }, 
      teamB: { name: "Mangalore Maruders", score: 0, wickets: 0 }, 
      status: "scheduled", 
      date: "2026-05-01",
      time: "09:30 AM",
      venue: "Shimoga City Ground",
      createdAt: Date.now() + 345600000 
    },
    "sched-4": { 
      id: "sched-4", 
      sport: "Cricket", 
      teamA: { name: "Bangalore Blasters", score: 0, wickets: 0 }, 
      teamB: { name: "Mysore Mighties", score: 0, wickets: 0 }, 
      status: "scheduled", 
      date: "2026-05-02",
      time: "02:00 PM",
      venue: "Chinnaswamy Stadium",
      createdAt: Date.now() + 432000000 
    }
  };
  const players: Record<string, any> = {
    "p1": { 
      id: "p1", 
      name: "Ramesh Kumar", 
      stats: { matches: 12, runs: 450, wickets: 5, mom: 3 }, 
      village: "Grama-Kalyana",
      history: [
        { opponent: "Strikers", score: 45, secondary: 0, date: "2026-04-20", result: "W" },
        { opponent: "Lions", score: 12, secondary: 1, date: "2026-04-18", result: "L" },
        { opponent: "Titans", score: 88, secondary: 0, date: "2026-04-15", result: "W" },
        { opponent: "Eagles", score: 32, secondary: 2, date: "2026-04-10", result: "W" },
        { opponent: "Panthers", score: 10, secondary: 0, date: "2026-04-05", result: "L" }
      ]
    },
    "p2": { 
      id: "p2", 
      name: "Suresh Hegde", 
      stats: { matches: 10, runs: 210, wickets: 12, mom: 1 }, 
      village: "Sagar",
      history: [
        { opponent: "Warriors", score: 15, secondary: 3, date: "2026-04-21", result: "W" },
        { opponent: "Dragons", score: 8, secondary: 2, date: "2026-04-19", result: "W" },
        { opponent: "Phoenix", score: 22, secondary: 1, date: "2026-04-14", result: "L" },
        { opponent: "Titans", score: 5, secondary: 4, date: "2026-04-08", result: "W" },
        { opponent: "Lions", score: 12, secondary: 1, date: "2026-04-01", result: "L" }
      ]
    },
    "p3": { 
      id: "p3", 
      name: "Manjunath S.", 
      stats: { matches: 15, runs: 50, wickets: 22, mom: 2 }, 
      village: "Sirsi",
      history: [
        { opponent: "Titans", score: 2, secondary: 4, date: "2026-04-22", result: "W" },
        { opponent: "Warriors", score: 10, secondary: 2, date: "2026-04-17", result: "L" },
        { opponent: "Eagles", score: 0, secondary: 3, date: "2026-04-12", result: "W" },
        { opponent: "Panthers", score: 5, secondary: 2, date: "2026-04-06", result: "W" },
        { opponent: "Dragons", score: 15, secondary: 1, date: "2026-03-30", result: "L" }
      ]
    },
    "p4": { id: "p4", name: "Anil Shetty", stats: { matches: 8, runs: 320, wickets: 2, mom: 1 }, village: "Udupi" },
  };

  const teams: Record<string, any> = {
    "t1": { 
      id: "t1", 
      name: "Warriors", 
      village: "Grama-Kalyana", 
      performance: "W-W-L-W-W", 
      stats: { matches: 20, won: 15, lost: 5 },
      players: ["Ramesh Kumar", "Anil Shetty", "Vikram S."]
    },
    "t2": { 
      id: "t2", 
      name: "Strikers", 
      village: "Sagar", 
      performance: "L-W-W-L-W", 
      stats: { matches: 18, won: 10, lost: 8 },
      players: ["Suresh Hegde", "Manjunath S.", "Kiran K."]
    }
  };

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-match", (matchId) => {
      socket.join(matchId);
      if (matches[matchId]) {
        socket.emit("match-update", matches[matchId]);
      }
    });

    socket.on("start-stream", (matchId) => {
      if (matches[matchId]) {
        matches[matchId].isStreaming = true;
        matches[matchId].streamHostId = socket.id;
        io.to(matchId).emit("match-update", matches[matchId]);
      }
    });

    socket.on("stop-stream", (matchId) => {
      if (matches[matchId]) {
        matches[matchId].isStreaming = false;
        matches[matchId].streamHostId = null;
        io.to(matchId).emit("match-update", matches[matchId]);
      }
    });

    socket.on("signal", ({ to, signal, from }) => {
      io.to(to).emit("signal", { signal, from });
    });

    socket.on("request-stream", (matchId) => {
      if (matches[matchId] && matches[matchId].streamHostId) {
        io.to(matches[matchId].streamHostId).emit("viewer-joined", { viewerId: socket.id });
      }
    });

    socket.on("update-score", ({ matchId, scoreData }) => {
      if (matches[matchId]) {
        const match = matches[matchId];
        if (!match.playerScores) match.playerScores = {};

        // Automatic player stat update
        const lastEvent = scoreData.lastEvent;
        // Verify if this is a NEW event (points > 0) or an UNDO (points < 0)
        // Note: the client logic currently sends the previous event on undo, which we should fix.
        // But if scoreData provides points directly in lastEvent, we can use it.
        
        if (lastEvent && lastEvent.player && lastEvent.points !== undefined) {
          const playerName = lastEvent.player;
          const points = lastEvent.points;
          const type = lastEvent.type;

          // Update match-specific scorecard
          if (!match.playerScores[playerName]) {
            match.playerScores[playerName] = { runs: 0, wickets: 0 };
          }
          
          if (points > 0) {
             match.playerScores[playerName].runs += points;
          } else if (points < 0) {
             match.playerScores[playerName].runs = Math.max(0, match.playerScores[playerName].runs + points);
          }

          if (type === 'wicket' && points >= 0) {
            match.playerScores[playerName].wickets += 1;
          } else if (type === 'wicket' && points < 0) {
            match.playerScores[playerName].wickets = Math.max(0, match.playerScores[playerName].wickets - 1);
          }

          // Global player registry update
          const playerEntry = Object.entries(players).find(([id, p]) => 
            p.name.toLowerCase() === playerName.toLowerCase()
          );

          if (playerEntry) {
            const [playerId, playerObj] = playerEntry;
            if (points > 0) {
              playerObj.stats.runs += points;
            } else if (points < 0) {
              playerObj.stats.runs = Math.max(0, playerObj.stats.runs + points);
            }

            if (type === 'wicket' && points >= 0) {
              playerObj.stats.wickets += 1;
            } else if (type === 'wicket' && points < 0) {
              playerObj.stats.wickets = Math.max(0, playerObj.stats.wickets - 1);
            }

            io.emit("player-list", Object.values(players));
          }
        }
        
        matches[matchId] = { ...match, ...scoreData, updatedAt: Date.now() };
        io.emit("match-update", matches[matchId]); // Broadcast updated match
      }
    });

    socket.on("create-match", (matchData) => {
      const matchId = matchData.id || Math.random().toString(36).substr(2, 9);
      matches[matchId] = { ...matchData, id: matchId, status: "live", createdAt: Date.now(), playerScores: {} };
      socket.emit("match-created", matches[matchId]);
      io.emit("new-match", matches[matchId]); // Broadcast to list
    });

    socket.on("get-matches", () => {
      socket.emit("match-list", Object.values(matches));
    });

    socket.on("get-players", () => {
      socket.emit("player-list", Object.values(players));
    });

    socket.on("get-teams", () => {
      socket.emit("team-list", Object.values(teams));
    });

    socket.on("vote", ({ matchId, team }) => {
      if (matches[matchId]) {
        const match = matches[matchId];
        if (!match.poll) {
          match.poll = { teamA: 0, teamB: 0, total: 0 };
        }
        if (team === 'A') match.poll.teamA += 1;
        else if (team === 'B') match.poll.teamB += 1;
        match.poll.total += 1;
        
        io.emit("match-update", match);
      }
    });

    socket.on("update-match-status", ({ matchId, status }) => {
      if (matches[matchId]) {
        matches[matchId].status = status;
        matches[matchId].updatedAt = Date.now();
        io.emit("match-update", matches[matchId]);
      }
    });

    socket.on("update-team", (updatedTeam) => {
      if (teams[updatedTeam.id]) {
        teams[updatedTeam.id] = { ...teams[updatedTeam.id], ...updatedTeam };
        io.emit("team-list", Object.values(teams));
      }
    });

    socket.on("register-player", (playerData) => {
      const playerId = playerData.id || Math.random().toString(36).substr(2, 9);
      players[playerId] = { ...playerData, id: playerId };
      io.emit("player-list", Object.values(players));
    });

    socket.on("register-team", (teamData) => {
      const teamId = teamData.id || Math.random().toString(36).substr(2, 9);
      teams[teamId] = { 
        ...teamData, 
        id: teamId,
        performance: teamData.performance || "",
        stats: teamData.stats || { matches: 0, won: 0, lost: 0 },
        players: teamData.players || []
      };
      io.emit("team-list", Object.values(teams));
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
