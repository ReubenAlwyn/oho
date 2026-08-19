import { motion } from "framer-motion";
import { useNavigate } from "react-router";

interface MainMenuProps {
  onPlay: () => void;
  onLeaderboard: () => void;
}

export default function MainMenu({ onPlay, onLeaderboard }: MainMenuProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: 140 + i * 30,
              height: 140 + i * 30,
              background: [
                "rgba(249,115,22,0.12)",
                "rgba(16,185,129,0.08)",
                "rgba(168,85,247,0.08)",
                "rgba(244,63,94,0.06)",
                "rgba(14,165,233,0.06)",
              ][i],
              left: `${10 + i * 18}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{ y: [0, -15, 0], x: [0, 8 * (i % 2 === 0 ? 1 : -1), 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
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

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-sm mb-2 tracking-widest uppercase text-shawarma/60" style={{ fontFamily: "monospace" }}>
            OHO
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black tracking-tight text-white"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              textShadow: "0 0 40px rgba(249,115,22,0.3)",
            }}
          >
            Shawarma
          </h1>
          <h2
            className="text-3xl sm:text-5xl font-black mt-2"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              color: "#f97316",
              textShadow: "0 0 30px rgba(249,115,22,0.4)",
            }}
          >
            Panic
          </h2>
        </motion.div>

        {/* Floating tacos */}
        <motion.div
          className="flex gap-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {["🌮", "🧆", "🌯"].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-3xl"
              animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col items-center gap-3 w-full max-w-xs"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <button
            onClick={onPlay}
            className="w-full py-4 px-8 text-sm font-bold rounded-2xl transition-all duration-200
                       hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-95"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(249,115,22,0.25)",
            }}
          >
            ▶ Start Game
          </button>

          <button
            onClick={onLeaderboard}
            className="w-full py-3 px-8 text-xs font-bold rounded-2xl transition-all duration-200
                       hover:scale-105 hover:bg-white/5 active:scale-95"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            🏆 Leaderboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
