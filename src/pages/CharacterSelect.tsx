import { useState } from "react";
import { motion } from "framer-motion";
import type { CharacterType } from "../game/types";

interface CharacterSelectProps {
  onSelect: (character: CharacterType, name: string) => void;
  onBack: () => void;
}

export default function CharacterSelect({ onSelect, onBack }: CharacterSelectProps) {
  const [selected, setSelected] = useState<CharacterType | null>(null);
  const [name, setName] = useState("");

  const handleConfirm = () => {
    if (selected && name.trim()) {
      onSelect(selected, name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a15] flex flex-col items-center justify-center relative overflow-hidden">
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
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: 200,
              height: 200,
              background: ["rgba(139,92,246,0.12)", "rgba(236,72,153,0.1)", "rgba(34,211,238,0.08)", "rgba(245,158,11,0.08)"][i],
              left: `${15 + i * 22}%`,
              top: `${20 + (i % 2) * 40}%`,
            }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-lg">
        {/* Back button */}
        <motion.button
          onClick={onBack}
          className="absolute top-6 left-6 text-sm opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: "#c084fc", fontFamily: '"Press Start 2P", monospace, system-ui' }}
          whileHover={{ x: -4 }}
        >
          ← Back
        </motion.button>

        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-center"
          style={{
            fontFamily: '"Press Start 2P", monospace, system-ui',
            color: "#f59e0b",
            textShadow: "0 0 20px rgba(245,158,11,0.3)",
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Choose Your Character
        </motion.h2>

        {/* Character cards */}
        <motion.div
          className="flex gap-6 sm:gap-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Boy */}
          <button
            onClick={() => setSelected("boy")}
            className={`relative flex flex-col items-center gap-4 p-6 sm:p-8 rounded-xl transition-all duration-300 border-2 ${
              selected === "boy"
                ? "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)] scale-105"
                : "border-transparent hover:border-cyan-400/30 hover:scale-102"
            }`}
            style={{ background: "rgba(34,211,238,0.05)" }}
          >
            {selected === "boy" && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-full"
                style={{ background: "#06b6d4", color: "#000", fontFamily: '"Press Start 2P", monospace' }}
                layoutId="selected-badge"
              >
                ✓
              </motion.div>
            )}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(6,182,212,0.15)", border: "2px solid rgba(6,182,212,0.3)" }}
            >
              {/* Boy placeholder */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-cyan-400/80" />
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-4 bg-cyan-300/60 rounded-t-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 bg-cyan-500/60 rounded-b-lg" />
              </div>
            </div>
            <span
              className="text-sm font-bold"
              style={{ fontFamily: '"Press Start 2P", monospace, system-ui', color: "#22d3ee" }}
            >
              Boy
            </span>
          </button>

          {/* Girl */}
          <button
            onClick={() => setSelected("girl")}
            className={`relative flex flex-col items-center gap-4 p-6 sm:p-8 rounded-xl transition-all duration-300 border-2 ${
              selected === "girl"
                ? "border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.3)] scale-105"
                : "border-transparent hover:border-pink-400/30 hover:scale-102"
            }`}
            style={{ background: "rgba(236,72,153,0.05)" }}
          >
            {selected === "girl" && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-full"
                style={{ background: "#ec4899", color: "#000", fontFamily: '"Press Start 2P", monospace' }}
                layoutId="selected-badge"
              >
                ✓
              </motion.div>
            )}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(236,72,153,0.15)", border: "2px solid rgba(236,72,153,0.3)" }}
            >
              {/* Girl placeholder */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-pink-400/80" />
                <div className="absolute -top-2 -left-1 w-14 h-6 bg-pink-300/50 rounded-t-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 bg-pink-500/60 rounded-b-lg" />
              </div>
            </div>
            <span
              className="text-sm font-bold"
              style={{ fontFamily: '"Press Start 2P", monospace, system-ui', color: "#ec4899" }}
            >
              Girl
            </span>
          </button>
        </motion.div>

        {/* Name input */}
        <motion.div
          className="w-full max-w-xs"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label
            className="block text-xs mb-2 opacity-60"
            style={{ fontFamily: '"Press Start 2P", monospace, system-ui', color: "#c084fc" }}
          >
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            maxLength={16}
            placeholder="Enter your name..."
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200
                       focus:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              fontSize: "11px",
              background: "rgba(139,92,246,0.1)",
              border: "2px solid rgba(139,92,246,0.3)",
              color: "#e2e8f0",
            }}
          />
        </motion.div>

        {/* Confirm button */}
        <motion.button
          onClick={handleConfirm}
          disabled={!selected || !name.trim()}
          className={`w-full max-w-xs py-4 px-8 text-sm font-bold rounded-lg transition-all duration-200
                     ${selected && name.trim()
                       ? "hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:scale-95"
                       : "opacity-30 cursor-not-allowed"
                     }`}
          style={{
            fontFamily: '"Press Start 2P", monospace, system-ui',
            background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
            color: "#fff",
            border: "2px solid rgba(192,132,252,0.5)",
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ▶ START GAME
        </motion.button>
      </div>
    </div>
  );
}
