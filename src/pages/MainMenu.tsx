import { motion } from "framer-motion";

interface MainMenuProps {
  onPlay: () => void;
  onLeaderboard: () => void;
}

export default function MainMenu({ onPlay, onLeaderboard }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-[#0a0a15] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: 120 + i * 40,
              height: 120 + i * 40,
              background: [
                "rgba(139,92,246,0.15)",
                "rgba(236,72,153,0.12)",
                "rgba(34,211,238,0.1)",
                "rgba(16,185,129,0.1)",
                "rgba(245,158,11,0.12)",
                "rgba(168,85,247,0.1)",
              ][i],
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10 * (i % 2 === 0 ? 1 : -1), 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-4">
        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1
            className="text-5xl sm:text-7xl font-black tracking-tight"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 0 20px rgba(245,158,11,0.4))",
            }}
          >
            SHAWARMA
          </h1>
          <h2
            className="text-3xl sm:text-5xl font-black mt-2"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              color: "#c084fc",
              textShadow: "0 0 30px rgba(192,132,252,0.5)",
            }}
          >
            CHASE
          </h2>
          <motion.p
            className="mt-4 text-sm tracking-widest uppercase"
            style={{ color: "rgba(200,200,255,0.5)", fontFamily: "monospace" }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌮 collect them all 🌮
          </motion.p>
        </motion.div>

        {/* Shawarma animation */}
        <motion.div
          className="flex gap-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="text-3xl"
              animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 1.2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🌮
            </motion.span>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col items-center gap-4 w-full max-w-xs"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <button
            onClick={onPlay}
            className="w-full py-4 px-8 text-lg font-bold rounded-lg transition-all duration-200
                       hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]
                       active:scale-95"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
              color: "#fff",
              border: "2px solid rgba(192,132,252,0.5)",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            ▶ PLAY
          </button>

          <button
            onClick={onLeaderboard}
            className="w-full py-3 px-8 text-sm font-bold rounded-lg transition-all duration-200
                       hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]
                       active:scale-95"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              background: "transparent",
              color: "#ec4899",
              border: "2px solid rgba(236,72,153,0.4)",
            }}
          >
            🏆 LEADERBOARD
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-xs opacity-30 mt-8"
          style={{ color: "#8888aa", fontFamily: "monospace" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1 }}
        >
          v1.0 — WASD or Arrow Keys to move
        </motion.p>
      </div>
    </div>
  );
}
