import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getLeaderboard,
  clearLeaderboard,
  formatScore,
  formatDate,
} from "../game/leaderboard";
import type { ScoreEntry } from "../game/types";

interface LeaderboardScreenProps {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a15] flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <motion.button
            onClick={onBack}
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "#c084fc", fontFamily: '"Press Start 2P", monospace, system-ui' }}
            whileHover={{ x: -4 }}
          >
            ← Back
          </motion.button>

          <motion.h1
            className="text-xl sm:text-2xl font-bold"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              color: "#f59e0b",
              textShadow: "0 0 20px rgba(245,158,11,0.3)",
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
              <p
                className="text-sm opacity-50 text-center"
                style={{ fontFamily: '"Press Start 2P", monospace, system-ui', color: "#8888aa" }}
              >
                No scores yet!
              </p>
              <p className="text-xs opacity-30" style={{ color: "#8888aa", fontFamily: "monospace" }}>
                Play a game to set your first record.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index < 3 ? "border" : ""
                    }`}
                    style={{
                      background:
                        index === 0
                          ? "rgba(251,191,36,0.08)"
                          : index === 1
                          ? "rgba(192,132,252,0.06)"
                          : index === 2
                          ? "rgba(249,115,22,0.06)"
                          : "rgba(30,20,50,0.5)",
                      borderColor:
                        index === 0
                          ? "rgba(251,191,36,0.3)"
                          : index === 1
                          ? "rgba(192,132,252,0.2)"
                          : index === 2
                          ? "rgba(249,115,22,0.2)"
                          : "transparent",
                    }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Rank */}
                    <div
                      className="w-8 text-center text-lg"
                      style={{ fontFamily: '"Press Start 2P", monospace' }}
                    >
                      {index < 3 ? medals[index] : <span className="text-xs opacity-40" style={{ color: "#8888aa" }}>{index + 1}</span>}
                    </div>

                    {/* Player info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm truncate"
                          style={{
                            fontFamily: '"Press Start 2P", monospace, system-ui',
                            fontSize: "10px",
                            color: index < 3 ? "#e2e8f0" : "#94a3b8",
                          }}
                        >
                          {entry.playerName}
                        </span>
                        <span className="text-xs">{entry.character === "boy" ? "👦" : "👧"}</span>
                      </div>
                      <p className="text-[10px] opacity-30 mt-0.5" style={{ color: "#8888aa", fontFamily: "monospace" }}>
                        Round {entry.highestRound} • {formatDate(entry.date)}
                      </p>
                    </div>

                    {/* Score */}
                    <div
                      className="text-right"
                      style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}
                    >
                      <span
                        className="text-sm"
                        style={{
                          color: index < 3 ? "#fbbf24" : "#c084fc",
                          textShadow: index < 3 ? "0 0 10px rgba(251,191,36,0.3)" : "none",
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
                <span className="text-xs opacity-50" style={{ color: "#f87171", fontFamily: "monospace" }}>
                  Clear all scores?
                </span>
                <button
                  onClick={handleClear}
                  className="text-xs px-3 py-1 rounded border transition-all hover:scale-105"
                  style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.4)", fontFamily: "monospace" }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="text-xs px-3 py-1 rounded border transition-all hover:scale-105"
                  style={{ color: "#8888aa", borderColor: "rgba(136,136,170,0.2)", fontFamily: "monospace" }}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-xs opacity-30 hover:opacity-60 transition-opacity"
                style={{ color: "#8888aa", fontFamily: "monospace" }}
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
