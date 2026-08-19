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
    <div className="min-h-screen bg-[#06060e] flex flex-col items-center justify-center relative overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ff3366]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-7 px-4">
        {/* Back to dashboard */}
        <motion.button
          onClick={() => navigate("/dashboard")}
          className="absolute top-6 left-6 neon-orange opacity-40 hover:opacity-80 transition-opacity"
          style={{ fontFamily: '"Press Start 2P", monospace, system-ui', fontSize: "10px" }}
          whileHover={{ x: -4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
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
            className="text-3xl sm:text-4xl font-black neon-pink"
            style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}
          >
            Game Over
          </h1>
          <p className="mt-3 text-xs text-[#6a6a8a]" style={{ fontFamily: "monospace" }}>
            {character === "boy" ? "👦" : "👧"} The ghosts got you this time!
          </p>
        </motion.div>

        {/* Score card */}
        <motion.div
          className="w-full max-w-sm rounded-xl p-6 space-y-4 bg-[#0e0e1a] border border-[#2a2a40] neon-box-orange"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center">
            <p className="text-[10px] text-[#6a6a8a] mb-1" style={{ fontFamily: "monospace" }}>
              Final Score
            </p>
            <p
              className="text-3xl font-black neon-orange"
              style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}
            >
              {formatScore(score)}
            </p>
          </div>

          <div className="flex justify-between text-xs" style={{ fontFamily: '"Press Start 2P", monospace, system-ui', fontSize: "10px" }}>
            <div className="text-center">
              <p className="text-[#6a6a8a] mb-1">Round</p>
              <p className="neon-purple">{round}</p>
            </div>
            <div className="text-center">
              <p className="text-[#6a6a8a] mb-1">Character</p>
              <p className={character === "boy" ? "neon-cyan" : "neon-pink"}>
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
          <motion.button
            onClick={onPlayAgain}
            className="pixel-btn w-full bg-[#ff6b2b] border-[#ff6b2b] text-[#06060e]"
            whileHover={{ boxShadow: "0 0 30px rgba(255,107,43,0.5), 0 0 60px rgba(255,107,43,0.25)" }}
            whileTap={{ scale: 0.96 }}
          >
            ▶ Play Again
          </motion.button>

          <button
            onClick={onLeaderboard}
            className="pixel-btn w-full bg-transparent border-[#2a2a40] text-[#6a6a8a] hover:text-[#ffdd00] hover:border-[#ffdd00]/30"
          >
            🏆 Leaderboard
          </button>

          <button
            onClick={onMainMenu}
            className="pixel-btn w-full bg-transparent border-[#2a2a40] text-[#3a3a52] hover:text-[#6a6a8a] hover:border-[#3a3a52]"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
