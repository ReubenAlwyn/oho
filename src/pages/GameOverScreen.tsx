import { motion } from "framer-motion";
import { formatScore } from "../game/leaderboard";
import { useNavigate } from "react-router";
import Footer from "@/components/Footer";
import { playClick } from "../game/audio";
import { CHARACTER_INFO } from "../game/characters";
import type { CharacterType } from "../game/types";

interface GameOverScreenProps {
  score: number;
  round: number;
  character: CharacterType;
  playerName: string;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onLeaderboard: () => void;
  isAuthenticated?: boolean;
}

export default function GameOverScreen({
  score,
  round,
  character,
  onPlayAgain,
  onMainMenu,
  onLeaderboard,
  isAuthenticated = false,
}: GameOverScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#06060e] flex flex-col relative overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#c850ff]/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
      <div className="relative z-10 flex flex-col items-center gap-7 px-4">
        {/* Game Over title */}
        <motion.div
          className="text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h1 className="text-3xl sm:text-4xl neon-purple">
            Game Over
          </h1>
          <p className="mt-3 text-xs text-[#6a6a8a]">
            CHUBs: 1 &mdash; You: 0. Try again?
          </p>
        </motion.div>

        {/* Score card */}
        <motion.div
          className="w-full max-w-sm rounded-xl p-6 space-y-4 bg-[#0e0e1a] border border-[#2a2a40] neon-box-purple interactive-card"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center">
            <p className="text-[#6a6a8a] mb-2" style={{ fontSize: "14px" }}>
              Score
            </p>
            <motion.p
              className="text-4xl neon-yellow"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 }}
            >
              {formatScore(score)}
            </motion.p>
          </div>

          <div className="flex justify-between text-sm">
            <div className="text-center">
              <p className="text-[#6a6a8a] mb-2" style={{ fontSize: "14px" }}>Round</p>
              <p className="neon-yellow" style={{ fontSize: "28px" }}>{round}</p>
            </div>
            <div className="text-center">
              <p className="text-[#6a6a8a] mb-2" style={{ fontSize: "14px" }}>Character</p>
              <p style={{ fontSize: "28px", color: CHARACTER_INFO[character].color, textShadow: `0 0 7px ${CHARACTER_INFO[character].color}, 0 0 20px ${CHARACTER_INFO[character].color}80` }}>
                {CHARACTER_INFO[character].label}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Guest leaderboard message */}
        {!isAuthenticated && (
          <motion.div
            className="w-full max-w-sm rounded-lg px-4 py-3 text-center border border-[#ffdd00]/20 bg-[#ffdd00]/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs" style={{ color: "#ffdd00" }}>
              Sign in to save your score to the leaderboard
            </p>
            <button
              onClick={() => navigate("/auth?returnTo=/game")}
              className="mt-2 text-[10px] underline transition-colors hover:text-[#00ccff]"
              style={{ color: "#6a6a8a" }}
            >
              Sign in / Sign up
            </button>
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          className="flex flex-col items-center gap-3 w-full max-w-xs"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={() => { playClick(); onPlayAgain(); }}
            className="pixel-btn w-full bg-[#c850ff] border-[#c850ff] text-[#06060e]"
            whileHover={{ boxShadow: "0 0 30px rgba(200,80,255,0.5), 0 0 60px rgba(200,80,255,0.25)" }}
            whileTap={{ scale: 0.94 }}
          >
            Play Again
          </motion.button>

          <motion.button
            onClick={() => { playClick(); onLeaderboard(); }}
            className="pixel-btn w-full bg-transparent border-[#2a2a40] text-[#6a6a8a] hover:text-[#ffdd00] hover:border-[#ffdd00]/40"
            whileHover={{ boxShadow: "0 0 20px rgba(255,221,0,0.15)" }}
            whileTap={{ scale: 0.96 }}
          >
            Leaderboard
          </motion.button>

          <motion.button
            onClick={() => { playClick(); onMainMenu(); }}
            className="pixel-btn w-full bg-transparent border-[#2a2a40] text-[#3a3a52] hover:text-[#6a6a8a] hover:border-[#3a3a52]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
