import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getLeaderboard,
  clearLeaderboard,
  formatScore,
  formatDate,
} from "../game/leaderboard";
import type { ScoreEntry } from "../game/types";
import { useNavigate } from "react-router";

interface LeaderboardScreenProps {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const handleClear = () => {
    clearLeaderboard();
    setEntries([]);
    setShowConfirmClear(false);
  };

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <motion.button
            onClick={onBack}
            className="text-xs opacity-50 hover:opacity-90 transition-opacity"
            style={{ color: "#f97316", fontFamily: '"Press Start 2P", monospace, system-ui' }}
            whileHover={{ x: -4 }}
          >
            ← Back
          </motion.button>

          <motion.h1
            className="text-lg sm:text-xl font-bold text-white"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            🏆 Leaderboard
          </motion.h1>

          <div style={{ width: 80 }} />
        </div>

        {/* Leaderboard list */}
        <div className="flex-1 max-w-lg mx-auto w-full overflow-y-auto pb-4">
          {entries.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center h-64 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-4xl">🌮</p>
              <p className="text-sm text-white/40 text-center" style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}>
                No scores yet!
              </p>
              <p className="text-xs text-white/20" style={{ fontFamily: "monospace" }}>
                Play a game to set your first record.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background:
                        index === 0
                          ? "rgba(249,115,22,0.08)"
                          : index === 1
                          ? "rgba(168,85,247,0.06)"
                          : index === 2
                          ? "rgba(16,185,129,0.06)"
                          : "rgba(255,255,255,0.02)",
                      border: index < 3 ? `1px solid ${
                        index === 0 ? "rgba(249,115,22,0.2)" : index === 1 ? "rgba(168,85,247,0.15)" : "rgba(16,185,129,0.15)"
                      }` : "1px solid transparent",
                    }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <div className="w-8 text-center text-lg" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                      {index < 3 ? medals[index] : <span className="text-xs text-white/25">{index + 1}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm truncate"
                          style={{
                            fontFamily: '"Press Start 2P", monospace, system-ui',
                            fontSize: "10px",
                            color: index < 3 ? "#e2e8f0" : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {entry.playerName}
                        </span>
                        <span className="text-xs">{entry.character === "boy" ? "👦" : "👧"}</span>
                      </div>
                      <p className="text-[10px] text-white/20 mt-0.5" style={{ fontFamily: "monospace" }}>
                        Round {entry.highestRound} · {formatDate(entry.date)}
                      </p>
                    </div>

                    <div className="text-right" style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}>
                      <span
                        className="text-sm"
                        style={{
                          color: index < 3 ? "#f97316" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {formatScore(entry.score)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Clear button */}
        {entries.length > 0 && (
          <div className="flex justify-center mt-4">
            {showConfirmClear ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-coral/50" style={{ fontFamily: "monospace" }}>
                  Clear all scores?
                </span>
                <button
                  onClick={handleClear}
                  className="text-xs px-3 py-1 rounded-lg border border-coral/30 text-coral transition-all hover:bg-coral/10"
                  style={{ fontFamily: "monospace" }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="text-xs px-3 py-1 rounded-lg border border-white/10 text-white/30 transition-all hover:bg-white/5"
                  style={{ fontFamily: "monospace" }}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-xs text-white/15 hover:text-white/30 transition-colors"
                style={{ fontFamily: "monospace" }}
              >
                Clear all scores
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
