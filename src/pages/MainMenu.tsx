import { motion } from "framer-motion";
import { useNavigate } from "react-router";

interface MainMenuProps {
  onPlay: () => void;
  onLeaderboard: () => void;
}

export default function MainMenu({ onPlay, onLeaderboard }: MainMenuProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#06060e] flex flex-col items-center justify-center relative overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg" />

      {/* Animated neon orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(200,80,255,0.12) 0%, transparent 70%)", top: "10%", left: "20%" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle, rgba(0,204,255,0.08) 0%, transparent 70%)", bottom: "20%", right: "15%" }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>

      {/* Back to dashboard */}
      <motion.button
        onClick={() => navigate("/dashboard")}
        className="absolute top-12 left-8 z-10 neon-cyan opacity-40 hover:opacity-100 transition-opacity"
        style={{ fontSize: "13px" }}
        whileHover={{ x: -4 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.5 }}
      >
        &larr; Dashboard
      </motion.button>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Title */}
        <motion.div
          className="text-center flex flex-col items-center"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1
            className="neon-purple-glossy leading-none"
            style={{ fontSize: "clamp(40px, 8vw, 72px)" }}
            animate={{
              filter: [
                "drop-shadow(0 0 10px rgba(200,80,255,0.6)) drop-shadow(0 0 25px rgba(200,80,255,0.3))",
                "drop-shadow(0 0 16px rgba(200,80,255,0.8)) drop-shadow(0 0 35px rgba(200,80,255,0.4))",
                "drop-shadow(0 0 10px rgba(200,80,255,0.6)) drop-shadow(0 0 25px rgba(200,80,255,0.3))",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            OHO
          </motion.h1>
          <motion.h2
            className="neon-cyan leading-none mt-2"
            style={{ fontSize: "clamp(16px, 3.5vw, 32px)" }}
            animate={{
              textShadow: [
                "0 0 8px #00ccff, 0 0 24px rgba(0,204,255,0.5), 0 0 48px rgba(0,204,255,0.2)",
                "0 0 14px #00ccff, 0 0 36px rgba(0,204,255,0.7), 0 0 64px rgba(0,204,255,0.35)",
                "0 0 8px #00ccff, 0 0 24px rgba(0,204,255,0.5), 0 0 48px rgba(0,204,255,0.2)",
              ],
            }}
            transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            SHAWARMA PANIC
          </motion.h2>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col items-center gap-4 w-full max-w-xs"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <motion.button
            onClick={onPlay}
            className="pixel-btn w-full bg-[#c850ff] border-[#c850ff] text-[#06060e]"
            whileHover={{ boxShadow: "0 0 30px rgba(200,80,255,0.5), 0 0 60px rgba(200,80,255,0.25)" }}
            whileTap={{ scale: 0.94 }}
          >
            Start Game
          </motion.button>

          <motion.button
            onClick={onLeaderboard}
            className="pixel-btn w-full bg-transparent border-[#2a2a40] text-[#6a6a8a] hover:text-[#ffdd00] hover:border-[#ffdd00]/40"
            whileHover={{ boxShadow: "0 0 20px rgba(255,221,0,0.15)" }}
            whileTap={{ scale: 0.96 }}
          >
            Leaderboard
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
