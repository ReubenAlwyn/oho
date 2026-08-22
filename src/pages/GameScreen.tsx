import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../game/constants";
import { useGameEngine } from "../game/useGameEngine";
import type { CharacterType } from "../game/types";
import LeaderboardScreen from "./LeaderboardScreen";
import { stopMusic, initAudio, toggleMute, isMuted } from "../game/audio";

interface GameScreenProps {
  character: CharacterType;
  onGameOver: (score: number, round: number) => void;
  onMainMenu?: () => void;
  onLeaderboard?: () => void;
}

export default function GameScreen({ character, onGameOver, onMainMenu, onLeaderboard }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startGame, togglePause, isPaused } = useGameEngine(canvasRef, { character, onGameOver });
  const [muted, setMuted] = useState(false);

  const handleMuteToggle = () => {
    initAudio();
    const nowMuted = toggleMute();
    setMuted(nowMuted);
  };
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { initAudio(); startGame(); }, 100);
    return () => clearTimeout(timer);
  }, [startGame]);

  // Scale canvas to fill viewport while preserving aspect ratio
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
    const screenAspect = vw / vh;
    if (screenAspect > canvasAspect) {
      canvas.style.height = `${vh}px`;
      canvas.style.width = `${Math.floor(vh * canvasAspect)}px`;
    } else {
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${Math.floor(vw / canvasAspect)}px`;
    }
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]);

  return (
    <div className="fixed inset-0 bg-[#06060e] overflow-hidden z-50 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Mute toggle */}
      <motion.button
        onClick={handleMuteToggle}
        className="absolute top-4 right-4 z-30 w-10 h-10 flex items-center justify-center rounded-lg border border-[#2a2a40] bg-[#0e0e1a]/80 text-[#6a6a8a] hover:text-[#c850ff] hover:border-[#c850ff]/40 transition-all text-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔇" : "🔊"}
      </motion.button>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Dark backdrop */}
            <div className="absolute inset-0 bg-[#06060e]/80 backdrop-blur-sm" />

            {/* Pause card */}
            <motion.div
              className="relative z-10 flex flex-col items-center gap-6 px-10 py-8 rounded-2xl border-2 border-[#2a2a40] bg-[#0e0e1a]/95 shadow-[0_0_60px_rgba(200,80,255,0.15)]"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Pause icon */}
              <div className="flex gap-2 mb-1">
                <div className="w-3 h-8 rounded-sm bg-[#c850ff]" />
                <div className="w-3 h-8 rounded-sm bg-[#c850ff]" />
              </div>

              <h2 className="text-2xl neon-purple" style={{ fontFamily: "\"Silkscreen\", monospace" }}>
                PAUSED
              </h2>

              <p className="text-[10px] text-[#6a6a8a] -mt-3">
                Press ESC or P to resume
              </p>

              <div className="flex flex-col items-center gap-3 w-full max-w-[200px]">
                {/* Resume */}
                <motion.button
                  onClick={togglePause}
                  className="pixel-btn w-full bg-[#c850ff] border-[#c850ff] text-[#06060e]"
                  whileHover={{ boxShadow: "0 0 30px rgba(200,80,255,0.5), 0 0 60px rgba(200,80,255,0.25)" }}
                  whileTap={{ scale: 0.94 }}
                >
                  Resume
                </motion.button>

                {/* Leaderboard */}
                {onLeaderboard && (
                  <motion.button
                    onClick={() => setShowLeaderboard(true)}
                    className="pixel-btn w-full bg-transparent border-[#2a2a40] text-[#6a6a8a] hover:text-[#ffdd00] hover:border-[#ffdd00]/40"
                    whileHover={{ boxShadow: "0 0 20px rgba(255,221,0,0.15)" }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Leaderboard
                  </motion.button>
                )}

                {/* Main Menu / Dashboard */}
                {onMainMenu && (
                  <motion.button
                    onClick={() => {
                      togglePause();
                      stopMusic();
                      onMainMenu();
                    }}
                    className="pixel-btn w-full bg-transparent border-[#2a2a40] text-[#3a3a52] hover:text-[#6a6a8a] hover:border-[#3a3a52]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Dashboard
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Leaderboard overlay (stays in pause, no score reset) */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LeaderboardScreen onBack={() => setShowLeaderboard(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
