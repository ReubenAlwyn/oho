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

  const rankColors = ["#ffdd00", "#c0c0d8", "#cd7f32"];

  return (
    <div className="min-h-screen bg-[#06060e] flex flex-col relative overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg" />

      {/* Back button — top left, big and clear */}
      <motion.button
        onClick={onBack}
        className="absolute top-8 left-8 z-10 flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-[#00ccff]/30 bg-[#00ccff]/5 text-[#00ccff] hover:bg-[#00ccff]/15 hover:border-[#00ccff]/60 transition-all"
        style={{ fontSize: "18px" }}
        whileHover={{ x: -4, boxShadow: "0 0 20px rgba(0,204,255,0.2)" }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <span style={{ fontSize: "22px" }}>&larr;</span>
        Back
      </motion.button>

      <div className="relative z-10 flex flex-col h-full p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <motion.h1
            className="text-lg sm:text-xl neon-yellow"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Leaderboard
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
              <p className="text-[10px] neon-purple opacity-50 text-center">
                No scores yet
              </p>
              <p className="text-xs text-[#3a3a52]">
                Get out there and earn your spot.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className="interactive-card flex items-center gap-3 p-3 rounded-lg bg-[#0e0e1a] border border-[#2a2a40] hover:border-[#c850ff]/30 transition-all cursor-default"
                    style={{
                      boxShadow: index === 0 ? "0 0 15px rgba(255,221,0,0.1)" : undefined,
                    }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <div className="w-8 text-center" style={{ fontSize: "11px" }}>
                      {index < 3 ? (
                        <span style={{ color: rankColors[index] }}>
                          {index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#3a3a52]">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="truncate"
                          style={{
                            fontSize: "10px",
                            color: index < 3 ? "#e0e0f0" : "#6a6a8a",
                          }}
                        >
                          {entry.playerName}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{
                            background: entry.character === "boy" ? "rgba(0,204,255,0.15)" : "rgba(200,80,255,0.15)",
                            color: entry.character === "boy" ? "#00ccff" : "#c850ff",
                          }}
                        >
                          {entry.character === "boy" ? "Boy" : "Girl"}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#3a3a52] mt-0.5">
                        Round {entry.highestRound} &middot; {formatDate(entry.date)}
                      </p>
                    </div>

                    <div>
                      <span
                        className={index < 3 ? "neon-yellow" : ""}
                        style={{
                          fontSize: "11px",
                          color: index >= 3 ? "#6a6a8a" : undefined,
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
                <span className="text-[10px] text-[#ff3366]/50">
                  Clear all scores?
                </span>
                <motion.button
                  onClick={handleClear}
                  className="text-[10px] px-3 py-1 rounded border border-[#ff3366]/30 text-[#ff3366] hover:bg-[#ff3366]/10 transition-all"
                  whileTap={{ scale: 0.95 }}
                >
                  Yes
                </motion.button>
                <motion.button
                  onClick={() => setShowConfirmClear(false)}
                  className="text-[10px] px-3 py-1 rounded border border-[#2a2a40] text-[#6a6a8a] hover:bg-[#1a1a2e] transition-all"
                  whileTap={{ scale: 0.95 }}
                >
                  No
                </motion.button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-[10px] text-[#3a3a52] hover:text-[#6a6a8a] transition-colors"
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
