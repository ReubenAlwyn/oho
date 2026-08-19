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
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-lg">
        {/* Back button */}
        <motion.button
          onClick={onBack}
          className="absolute top-6 left-6 text-xs opacity-50 hover:opacity-90 transition-opacity"
          style={{ color: "#f97316", fontFamily: '"Press Start 2P", monospace, system-ui' }}
          whileHover={{ x: -4 }}
        >
          ← Back
        </motion.button>

        <motion.h2
          className="text-xl sm:text-2xl font-bold text-center text-white"
          style={{
            fontFamily: '"Press Start 2P", monospace, system-ui',
          }}
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
          <button
            onClick={() => setSelected("boy")}
            className={`relative flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl transition-all duration-300 border-2 ${
              selected === "boy"
                ? "border-sky shadow-[0_0_30px_rgba(14,165,233,0.25)] scale-105"
                : "border-white/10 hover:border-sky/40 hover:scale-[1.02]"
            }`}
            style={{ background: "rgba(14,165,233,0.06)" }}
          >
            {selected === "boy" && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-1 rounded-full bg-sky text-white font-bold"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
                layoutId="selected-badge"
              >
                ✓
              </motion.div>
            )}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center bg-sky/10 border border-sky/20">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-sky/80" />
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-4 bg-sky-light/60 rounded-t-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 bg-sky/60 rounded-b-lg" />
              </div>
            </div>
            <span className="text-sm font-bold text-sky" style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}>
              Boy
            </span>
          </button>

          {/* Girl */}
          <button
            onClick={() => setSelected("girl")}
            className={`relative flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl transition-all duration-300 border-2 ${
              selected === "girl"
                ? "border-coral shadow-[0_0_30px_rgba(244,63,94,0.25)] scale-105"
                : "border-white/10 hover:border-coral/40 hover:scale-[1.02]"
            }`}
            style={{ background: "rgba(244,63,94,0.06)" }}
          >
            {selected === "girl" && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-1 rounded-full bg-coral text-white font-bold"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
                layoutId="selected-badge"
              >
                ✓
              </motion.div>
            )}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center bg-coral/10 border border-coral/20">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-coral/80" />
                <div className="absolute -top-2 -left-1 w-14 h-6 bg-coral-light/50 rounded-t-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 bg-coral/60 rounded-b-lg" />
              </div>
            </div>
            <span className="text-sm font-bold text-coral" style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}>
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
            className="block text-xs mb-2 text-white/50"
            style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}
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
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200
                       focus:shadow-[0_0_20px_rgba(249,115,22,0.2)]"
            style={{
              fontFamily: '"Press Start 2P", monospace, system-ui',
              fontSize: "11px",
              background: "rgba(255,255,255,0.06)",
              border: "2px solid rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          />
        </motion.div>

        {/* Confirm button */}
        <motion.button
          onClick={handleConfirm}
          disabled={!selected || !name.trim()}
          className={`w-full max-w-xs py-4 px-8 text-sm font-bold rounded-2xl transition-all duration-200
                     ${selected && name.trim()
                       ? "hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-95"
                       : "opacity-25 cursor-not-allowed"
                     }`}
          style={{
            fontFamily: '"Press Start 2P", monospace, system-ui',
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "#fff",
            boxShadow: selected && name.trim() ? "0 4px 20px rgba(249,115,22,0.25)" : "none",
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ▶ Let&apos;s Go!
        </motion.button>
      </div>
    </div>
  );
}
