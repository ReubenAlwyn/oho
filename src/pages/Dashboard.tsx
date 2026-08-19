import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Trophy, Target, Flame, Play } from "lucide-react";
import { getLeaderboard, formatScore, formatDate } from "@/game/leaderboard";
import type { ScoreEntry } from "@/game/types";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bestScore, setBestScore] = useState(0);
  const [bestRound, setBestRound] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [recentGames, setRecentGames] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    const entries = getLeaderboard();
    setGamesPlayed(entries.length);
    if (entries.length > 0) {
      setBestScore(entries[0].score);
      setBestRound(Math.max(...entries.map((e) => e.highestRound)));
      setRecentGames(entries.slice(0, 5));
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.name || "Player";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-border bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <span className="text-xl">🌮</span>
            <span className="font-black tracking-tight text-foreground" style={{ fontFamily: '"Press Start 2P", monospace, system-ui', fontSize: "12px" }}>
              OHO
            </span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-shawarma/15 flex items-center justify-center text-shawarma font-bold text-sm">
              {initials}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Welcome */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm text-muted-foreground mb-1">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Ready to play?
          </h1>
        </motion.div>

        {/* Play button */}
        <motion.div
          className="mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <button
            onClick={() => navigate("/game")}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5
                       bg-shawarma text-white font-bold rounded-2xl text-lg
                       hover:bg-shawarma/90 hover:shadow-xl hover:shadow-shawarma/25
                       active:scale-[0.98] transition-all duration-200"
            style={{ fontFamily: '"Press Start 2P", monospace, system-ui', fontSize: "14px" }}
          >
            <Play className="w-5 h-5 fill-current" />
            Play
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-10 grid grid-cols-3 gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="bg-white rounded-2xl border border-border p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-sun/10 flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-sun" />
            </div>
            <p className="text-2xl font-black text-foreground">{formatScore(bestScore)}</p>
            <p className="text-xs text-muted-foreground mt-1">Best Score</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-berry/10 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-berry" />
            </div>
            <p className="text-2xl font-black text-foreground">{bestRound || "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">Best Round</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center mb-3">
              <Flame className="w-5 h-5 text-mint" />
            </div>
            <p className="text-2xl font-black text-foreground">{gamesPlayed}</p>
            <p className="text-xs text-muted-foreground mt-1">Games Played</p>
          </div>
        </motion.div>

        {/* Recent games */}
        <motion.div
          className="mt-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="text-sm font-bold text-foreground mb-4" style={{ fontFamily: '"Press Start 2P", monospace, system-ui', fontSize: "11px" }}>
            Recent Games
          </h2>
          {recentGames.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <p className="text-3xl mb-3">🌮</p>
              <p className="text-sm text-muted-foreground">
                No games played yet. Hit that play button!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-white rounded-xl border border-border px-5 py-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{game.character === "boy" ? "👦" : "👧"}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Round {game.highestRound}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(game.date)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-shawarma text-sm">{formatScore(game.score)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
