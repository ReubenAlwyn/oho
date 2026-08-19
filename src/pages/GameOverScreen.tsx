import { motion } from "framer-motion";
import { formatScore } from "../game/leaderboard";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-coral/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-7 px-4">
        {/* Back to dashboard */}
        <motion.button
          onClick={() => navigate("/dashboard")}
          className="absolute top-6 left-6 text-xs opacity-50 hover:opacity-90 transition-opacity"
          style={{ color: "#f97316", fontFamily: '"Press Start 2P", monospace, system-ui' }}
          whileHover={{ x: -4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          ← Dashboard
        </motion.button>

        {/* Game Over title */}
        <motion.div
          className="text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <p className="text-4xl mb-3">😵</p>
          <h1
            className="text-3xl sm:text-4xl font-black text-coral"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              textShadow: "0 0 30px rgba(244,63,94,0.4)",
            }}
          >
            Game Over
          </h1>
          <p className="mt-3 text-sm text-white/40" style={{ fontFamily: "monospace" }}>
            {character === "boy" ? "👦" : "👧"} The ghosts got you this time!
          </p>
        </motion.div>

        {/* Score card */}
        <motion.div
          className="w-full max-w-sm rounded-2xl p-6 space-y-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center">
            <p className="text-xs text-white/30 mb-1" style={{ fontFamily: "monospace" }}>
              Final Score
            </p>
            <p
              className="text-3xl font-black text-shawarma"
              style={{
                fontFamily: '"Press Start 2P", monospace, system-ui',
                textShadow: "0 0 20px rgba(249,115,22,0.3)",
              }}
            >
              {formatScore(score)}
            </p>
          </div>

          <div className="flex justify-between text-xs" style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}>
            <div className="text-center">
              <p className="text-white/30 mb-1">Round</p>
              <p className="text-berry">{round}</p>
            </div>
            <div className="text-center">
              <p className="text-white/30 mb-1">Character</p>
              <p className={character === "boy" ? "text-sky" : "text-coral"}>
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
            className="w-full py-4 px-8 text-sm font-bold rounded-2xl transition-all duration-200
                       hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-95"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(249,115,22,0.25)",
            }}
          >
            ▶ Play Again
          </button>

          <button
            onClick={onLeaderboard}
            className="w-full py-3 px-8 text-xs font-bold rounded-2xl transition-all duration-200
                       hover:scale-105 hover:bg-white/5 active:scale-95"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "transparent",
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            🏆 Leaderboard
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 px-8 text-xs font-bold rounded-2xl transition-all duration-200
                       hover:scale-105 hover:bg-white/5 active:scale-95"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "transparent",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
