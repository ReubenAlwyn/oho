import { motion } from "framer-motion";
import { formatScore } from "../game/leaderboard";

interface GameOverScreenProps {
  score: number;
  round: number;
  character: string;
  playerName: string;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onLeaderboard: () => void;
}

export default function GameOverScreen({
  score,
  round,
  character,
  onPlayAgain,
  onMainMenu,
  onLeaderboard,
}: GameOverScreenProps) {
  return (
    <div className="min-h-screen bg-[#0a0a15] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Red overlay */}
      <motion.div
        className="absolute inset-0 bg-red-900/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Game Over title */}
        <motion.div
          className="text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h1
            className="text-4xl sm:text-5xl font-black"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              color: "#ef4444",
              textShadow: "0 0 30px rgba(239,68,68,0.5), 0 0 60px rgba(239,68,68,0.2)",
            }}
          >
            GAME OVER
          </h1>
          <motion.p
            className="mt-2 text-sm opacity-60"
            style={{ color: "#f87171", fontFamily: "monospace" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
          >
            {character === "boy" ? "👦" : "👧"} {character === "boy" ? "Boy" : "Girl"} fell to the enemies...
          </motion.p>
        </motion.div>

        {/* Score card */}
        <motion.div
          className="w-full max-w-sm rounded-xl p-6 space-y-4"
          style={{
            background: "rgba(30,20,50,0.9)",
            border: "2px solid rgba(139,92,246,0.3)",
            boxShadow: "0 0 40px rgba(139,92,246,0.1)",
          }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center">
            <p className="text-xs opacity-50 mb-1" style={{ fontFamily: "monospace", color: "#8888aa" }}>
              FINAL SCORE
            </p>
            <p
              className="text-3xl font-black"
              style={{
                fontFamily: '"Press Start 2P", monospace, system-ui',
                color: "#fbbf24",
                textShadow: "0 0 20px rgba(251,191,36,0.4)",
              }}
            >
              {formatScore(score)}
            </p>
          </div>

          <div className="flex justify-between text-xs" style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}>
            <div className="text-center">
              <p className="opacity-40 mb-1" style={{ color: "#8888aa" }}>ROUND</p>
              <p style={{ color: "#c084fc" }}>{round}</p>
            </div>
            <div className="text-center">
              <p className="opacity-40 mb-1" style={{ color: "#8888aa" }}>CHARACTER</p>
              <p style={{ color: character === "boy" ? "#22d3ee" : "#ec4899" }}>
                {character === "boy" ? "Boy" : "Girl"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col items-center gap-3 w-full max-w-xs"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onPlayAgain}
            className="w-full py-4 px-8 text-sm font-bold rounded-lg transition-all duration-200
                       hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:scale-95"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
              color: "#fff",
              border: "2px solid rgba(192,132,252,0.5)",
            }}
          >
            ▶ PLAY AGAIN
          </button>

          <button
            onClick={onLeaderboard}
            className="w-full py-3 px-8 text-xs font-bold rounded-lg transition-all duration-200
                       hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "transparent",
              color: "#ec4899",
              border: "2px solid rgba(236,72,153,0.4)",
            }}
          >
            🏆 LEADERBOARD
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 px-8 text-xs font-bold rounded-lg transition-all duration-200
                       hover:scale-105 active:scale-95"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "transparent",
              color: "#8888aa",
              border: "1px solid rgba(136,136,170,0.2)",
            }}
          >
            MAIN MENU
          </button>
        </motion.div>
      </div>
    </div>
  );
}
