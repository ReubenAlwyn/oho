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
    <div className="min-h-screen bg-[#06060e] flex flex-col items-center justify-center relative overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-lg">
        {/* Back button */}
        <motion.button
          onClick={onBack}
          className="absolute top-6 left-6 neon-orange opacity-40 hover:opacity-100 transition-opacity"
          style={{ fontFamily: '"Silkscreen", monospace', fontSize: "10px" }}
          whileHover={{ x: -4 }}
        >
          &larr; Back
        </motion.button>

        <motion.h2
          className="text-xl sm:text-2xl font-bold text-center neon-orange"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Pick Your Character
        </motion.h2>

        {/* Character cards */}
        <motion.div
          className="flex gap-6 sm:gap-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Boy */}
          <motion.button
            onClick={() => setSelected("boy")}
            className={`relative flex flex-col items-center gap-4 p-6 sm:p-8 rounded-xl transition-all duration-300 border-2 ${
              selected === "boy"
                ? "shadow-[0_0_25px_rgba(0,204,255,0.3)] scale-105"
                : "border-[#2a2a40] hover:border-[#00ccff]/30 hover:scale-[1.03]"
            }`}
            style={{
              background: "rgba(0,204,255,0.04)",
              borderColor: selected === "boy" ? "rgba(0,204,255,0.5)" : undefined,
            }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            {selected === "boy" && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-1 rounded bg-[#00ccff] text-[#06060e] font-bold"
                layoutId="selected-badge"
              >
                P1
              </motion.div>
            )}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center bg-[#00ccff]/8 border border-[#00ccff]/15">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#00ccff]/80 shadow-[0_0_15px_rgba(0,204,255,0.3)]" />
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#00ccff]/50 rounded-t-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 bg-[#00ccff]/60 rounded-b-lg" />
              </div>
            </div>
            <span className="text-sm font-bold neon-cyan">
              Boy
            </span>
          </motion.button>

          {/* Girl */}
          <motion.button
            onClick={() => setSelected("girl")}
            className={`relative flex flex-col items-center gap-4 p-6 sm:p-8 rounded-xl transition-all duration-300 border-2 ${
              selected === "girl"
                ? "shadow-[0_0_25px_rgba(255,51,102,0.3)] scale-105"
                : "border-[#2a2a40] hover:border-[#ff3366]/30 hover:scale-[1.03]"
            }`}
            style={{
              background: "rgba(255,51,102,0.04)",
              borderColor: selected === "girl" ? "rgba(255,51,102,0.5)" : undefined,
            }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
          >
            {selected === "girl" && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-1 rounded bg-[#ff3366] text-[#06060e] font-bold"
                layoutId="selected-badge"
              >
                P1
              </motion.div>
            )}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center bg-[#ff3366]/8 border border-[#ff3366]/15">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#ff3366]/80 shadow-[0_0_15px_rgba(255,51,102,0.3)]" />
                <div className="absolute -top-2 -left-1 w-14 h-6 bg-[#ff3366]/50 rounded-t-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 bg-[#ff3366]/60 rounded-b-lg" />
              </div>
            </div>
            <span className="text-sm font-bold neon-pink">
              Girl
            </span>
          </motion.button>
        </motion.div>

        {/* Name input */}
        <motion.div
          className="w-full max-w-xs"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label
            className="block text-xs mb-2 neon-orange opacity-50"
            style={{ fontFamily: '"Silkscreen", monospace', fontSize: "10px" }}
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
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200 bg-[#0e0e1a] border-2 border-[#2a2a40] text-[#e0e0f0] placeholder:text-[#3a3a52] focus:border-[#ff6b2b]/50 focus:shadow-[0_0_15px_rgba(255,107,43,0.15)]"
            style={{ fontSize: "11px" }}
          />
        </motion.div>

        {/* Confirm button */}
        <motion.button
          onClick={handleConfirm}
          disabled={!selected || !name.trim()}
          className={`pixel-btn w-full max-w-xs ${
            selected && name.trim()
              ? "bg-[#ff6b2b] border-[#ff6b2b] text-[#06060e]"
              : "bg-[#1a1a2e] border-[#2a2a40] text-[#3a3a52] cursor-not-allowed"
          }`}
          whileHover={selected && name.trim() ? { boxShadow: "0 0 30px rgba(255,107,43,0.5), 0 0 60px rgba(255,107,43,0.25)" } : undefined}
          whileTap={selected && name.trim() ? { scale: 0.94 } : undefined}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Let&apos;s Go!
        </motion.button>
      </div>
    </div>
  );
}
