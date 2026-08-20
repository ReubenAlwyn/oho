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
          style={{ background: "radial-gradient(circle, rgba(255,107,43,0.12) 0%, transparent 70%)", top: "10%", left: "20%" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle, rgba(255,51,102,0.08) 0%, transparent 70%)", bottom: "20%", right: "15%" }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Back to dashboard */}
        <motion.button
          onClick={() => navigate("/dashboard")}
          className="absolute top-6 left-6 neon-orange opacity-40 hover:opacity-100 transition-opacity"
          style={{ fontFamily: '"Silkscreen", monospace', fontSize: "10px" }}
          whileHover={{ x: -4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.5 }}
        >
          &larr; Dashboard
        </motion.button>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-xs mb-3 tracking-[0.3em] uppercase neon-orange opacity-60" style={{ fontFamily: '"Silkscreen", monospace', fontSize: "10px" }}>
            OHO
          </p>
          <motion.h1
            className="text-4xl sm:text-6xl font-black tracking-tight neon-yellow"
            animate={{ textShadow: ["0 0 7px #ffdd00, 0 0 20px rgba(255,221,0,0.5), 0 0 42px rgba(255,221,0,0.25)", "0 0 12px #ffdd00, 0 0 35px rgba(255,221,0,0.7), 0 0 60px rgba(255,221,0,0.35)", "0 0 7px #ffdd00, 0 0 20px rgba(255,221,0,0.5), 0 0 42px rgba(255,221,0,0.25)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Shawarma
          </motion.h1>
          <motion.h2
            className="text-3xl sm:text-5xl font-black mt-2 neon-pink"
            animate={{ textShadow: ["0 0 7px #ff3366, 0 0 20px rgba(255,51,102,0.5), 0 0 42px rgba(255,51,102,0.25)", "0 0 14px #ff3366, 0 0 40px rgba(255,51,102,0.8), 0 0 70px rgba(255,51,102,0.4)", "0 0 7px #ff3366, 0 0 20px rgba(255,51,102,0.5), 0 0 42px rgba(255,51,102,0.25)"] }}
            transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Panic
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
            className="pixel-btn w-full bg-[#ff6b2b] border-[#ff6b2b] text-[#06060e]"
            whileHover={{ boxShadow: "0 0 30px rgba(255,107,43,0.5), 0 0 60px rgba(255,107,43,0.25)" }}
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
