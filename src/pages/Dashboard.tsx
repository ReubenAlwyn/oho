import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Trophy, Target, Flame, Play } from "lucide-react";
import { getLeaderboard, formatScore, formatDate } from "@/game/leaderboard";
import type { ScoreEntry } from "@/game/types";
import shawarmaPixel from "../assets/shawarma-pixel.png";

export default function Dashboard() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [bestScore, setBestScore] = useState(0);
  const [bestRound, setBestRound] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [recentGames, setRecentGames] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load leaderboard stats for authenticated users
      const entries = getLeaderboard();
      setGamesPlayed(entries.length);
      if (entries.length > 0) {
        setBestScore(entries[0].score);
        setBestRound(Math.max(...entries.map((e) => e.highestRound)));
        setRecentGames(entries.slice(0, 5));
      }
    } else {
      // Clear stats for guests — they have no saved data
      setBestScore(0);
      setBestRound(0);
      setGamesPlayed(0);
      setRecentGames([]);
    }
  }, [isAuthenticated, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.name || "Player";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#06060e] relative scanlines">
      <div className="absolute inset-0 grid-bg" />

      {/* Header */}
      <header className="relative z-10 border-b border-[#2a2a40]/50 bg-[#0a0a14]/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            whileHover={{ scale: 1.05 }}
          >
            <img src={shawarmaPixel} alt="" className="w-12" style={{ imageRendering: "pixelated", height: "auto" }} />
            <span className="neon-cyan" style={{ fontSize: "20px" }}>
              OHO
            </span>
          </motion.button>
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-[#c850ff]/15 border border-[#c850ff]/20 flex items-center justify-center text-[#c850ff] text-sm">
                  {initials}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-xs text-[#6a6a8a] hover:text-[#e0e0f0] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-[#2a2a40]/50 border border-[#3a3a52] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a6a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <button
                  onClick={() => navigate("/auth?returnTo=/dashboard")}
                  className="text-xs text-[#6a6a8a] hover:text-[#c850ff] transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Welcome */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs text-[#6a6a8a] mb-2">
            {user?.name ? `${user.name}, ` : ""}the maze is calling
          </p>
          <h1 className="text-2xl sm:text-3xl tracking-tight neon-purple">
            Ready to run?
          </h1>
        </motion.div>

        {/* Guest banner */}
        {!isAuthenticated && (
          <motion.div
            className="mt-4 rounded-lg px-4 py-3 flex items-center justify-between border border-[#ffdd00]/20 bg-[#ffdd00]/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs" style={{ color: "#ffdd00" }}>
              Playing as guest — scores won&apos;t be saved
            </p>
            <button
              onClick={() => navigate("/auth?returnTo=/dashboard")}
              className="text-[10px] px-3 py-1.5 rounded bg-[#c850ff]/15 border border-[#c850ff]/30 text-[#c850ff] hover:bg-[#c850ff]/25 transition-colors"
            >
              Sign in
            </button>
          </motion.div>
        )}

        {/* Play button */}
        <motion.div
          className="mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <motion.button
            onClick={() => navigate("/game")}
            className="pixel-btn bg-[#c850ff] border-[#c850ff] text-[#06060e] flex items-center gap-3"
            whileHover={{ boxShadow: "0 0 30px rgba(200,80,255,0.5), 0 0 60px rgba(200,80,255,0.25)" }}
            whileTap={{ scale: 0.94 }}
          >
            <Play className="w-5 h-5 fill-current" />
            Play
          </motion.button>
        </motion.div>

        {/* Stats — only for authenticated users */}
        {isAuthenticated && user ? (
        <>
        <motion.div
          className="mt-10 grid grid-cols-3 gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.div
            className="bg-[#0e0e1a] rounded-xl border border-[#2a2a40] p-5 flex flex-col items-center text-center neon-box-purple interactive-card"
            whileHover={{ y: -3 }}
          >
            <div className="w-10 h-10 rounded-lg bg-[#ffdd00]/10 border border-[#ffdd00]/20 flex items-center justify-center mb-3 shadow-[0_0_10px_rgba(255,221,0,0.1)]">
              <Trophy className="w-5 h-5 text-[#ffdd00]" />
            </div>
            <p className="text-2xl neon-yellow">
              {formatScore(bestScore)}
            </p>
            <p className="text-[10px] text-[#6a6a8a] mt-2">Best Score</p>
          </motion.div>
          <motion.div
            className="bg-[#0e0e1a] rounded-xl border border-[#2a2a40] p-5 flex flex-col items-center text-center interactive-card"
            whileHover={{ y: -3 }}
          >
            <div className="w-10 h-10 rounded-lg bg-[#00ccff]/10 border border-[#00ccff]/20 flex items-center justify-center mb-3 shadow-[0_0_10px_rgba(0,204,255,0.1)]">
              <Target className="w-5 h-5 text-[#00ccff]" />
            </div>
            <p className="text-2xl neon-cyan">
              {bestRound || "\u2014"}
            </p>
            <p className="text-[10px] text-[#6a6a8a] mt-2">Best Round</p>
          </motion.div>
          <motion.div
            className="bg-[#0e0e1a] rounded-xl border border-[#2a2a40] p-5 flex flex-col items-center text-center interactive-card"
            whileHover={{ y: -3 }}
          >
            <div className="w-10 h-10 rounded-lg bg-[#c850ff]/10 border border-[#c850ff]/20 flex items-center justify-center mb-3 shadow-[0_0_10px_rgba(200,80,255,0.1)]">
              <Flame className="w-5 h-5 text-[#c850ff]" />
            </div>
            <p className="text-2xl neon-purple">
              {gamesPlayed}
            </p>
            <p className="text-[10px] text-[#6a6a8a] mt-2">Games Played</p>
          </motion.div>          </motion.div>

        {/* Recent games */}
        <motion.div
          className="mt-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="text-[10px] mb-4 neon-cyan">
            Recent Games
          </h2>
          {recentGames.length === 0 ? (
            <div className="bg-[#0e0e1a] rounded-xl border border-[#2a2a40] p-8 text-center">
              <p className="text-sm text-[#6a6a8a]">
                No games yet. Time to break in those shawarma legs.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentGames.map((game) => (
                <motion.div
                  key={game.id}
                  className="interactive-card bg-[#0e0e1a] rounded-xl border border-[#2a2a40] px-5 py-3.5 flex items-center justify-between hover:border-[#c850ff]/30 transition-all cursor-default"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded"
                      style={{
                        background: game.character === "boy" ? "rgba(0,204,255,0.15)" : "rgba(200,80,255,0.15)",
                        color: game.character === "boy" ? "#00ccff" : "#c850ff",
                      }}
                    >
                      {game.character === "boy" ? "Boy" : "Girl"}
                    </span>
                    <div>
                      <p className="text-[10px] text-[#e0e0f0]">
                        Round {game.highestRound}
                      </p>
                      <p className="text-[10px] text-[#6a6a8a] mt-0.5">{formatDate(game.date)}</p>
                    </div>
                  </div>
                  <span className="neon-yellow" style={{ fontSize: "11px" }}>
                    {formatScore(game.score)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        </>
        ) : (
        /* Guest — prompt to sign in */
        <motion.div
          className="mt-10 bg-[#0e0e1a] rounded-xl border border-[#2a2a40] p-8 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-[#6a6a8a] mb-3">
            Sign in to track your scores and see your stats
          </p>
          <button
            onClick={() => navigate("/auth?returnTo=/dashboard")}
            className="pixel-btn bg-[#c850ff]/15 border-[#c850ff]/30 text-[#c850ff] text-xs"
          >
            Sign in
          </button>
        </motion.div>
        )}
      </main>
    </div>
  );
}
