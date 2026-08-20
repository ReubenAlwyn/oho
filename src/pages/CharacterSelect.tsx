import { useState } from "react";
import { motion } from "framer-motion";
import type { CharacterType } from "../game/types";
import boyImg from "../assets/boy.png";
import girlImg from "../assets/girl.png";

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

  const characters: { type: CharacterType; label: string; img: string; glow: string; bg: string; border: string; badgeBg: string }[] = [
    { type: "boy", label: "Boy", img: boyImg, glow: "rgba(0,204,255,0.3)", bg: "rgba(0,204,255,0.04)", border: "rgba(0,204,255,0.5)", badgeBg: "#00ccff" },
    { type: "girl", label: "Girl", img: girlImg, glow: "rgba(200,80,255,0.3)", bg: "rgba(200,80,255,0.04)", border: "rgba(200,80,255,0.5)", badgeBg: "#c850ff" },
  ];

  return (
    <div className="min-h-screen bg-[#06060e] flex flex-col items-center justify-center relative overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg" />

      {/* Neon orb */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#c850ff]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-lg">
        {/* Back button */}
        <motion.button
          onClick={onBack}
          className="absolute top-8 left-6 neon-cyan opacity-40 hover:opacity-100 transition-opacity"
          style={{ fontSize: "13px" }}
          whileHover={{ x: -4 }}
        >
          &larr; Back
        </motion.button>

        <motion.div
          className="text-center flex flex-col items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-xl sm:text-2xl neon-purple">
            Pick Your Character
          </h2>
        </motion.div>

        {/* Character cards */}
        <motion.div
          className="flex gap-6 sm:gap-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {characters.map((char) => (
            <motion.button
              key={char.type}
              onClick={() => setSelected(char.type)}
              className={`relative flex flex-col items-center gap-4 p-6 sm:p-8 rounded-xl transition-all duration-300 border-2 ${
                selected === char.type
                  ? "scale-105"
                  : "border-[#2a2a40] hover:scale-[1.03]"
              }`}
              style={{
                background: char.bg,
                borderColor: selected === char.type ? char.border : undefined,
                boxShadow: selected === char.type ? `0 0 25px ${char.glow}` : undefined,
              }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              {selected === char.type && (
                <motion.div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-1 rounded text-[#06060e]"
                  style={{ backgroundColor: char.badgeBg }}
                  layoutId="selected-badge"
                >
                  P1
                </motion.div>
              )}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-[#2a2a40] bg-[#0e0e1a]">
                <img
                  src={char.img}
                  alt={char.label}
                  className="w-full h-full object-cover"
                  style={{
                    filter: selected === char.type
                      ? `drop-shadow(0 0 12px ${char.glow})`
                      : "none",
                  }}
                />
              </div>
              <span
                className={`text-sm ${char.type === "boy" ? "neon-cyan" : "neon-purple"}`}
              >
                {char.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Name input */}
        <motion.div
          className="w-full max-w-xs"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-[10px] mb-2 neon-cyan opacity-50">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            maxLength={16}
            placeholder="Enter your name..."
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200 bg-[#0e0e1a] border-2 border-[#2a2a40] text-[#e0e0f0] placeholder:text-[#3a3a52] focus:border-[#c850ff]/50 focus:shadow-[0_0_15px_rgba(200,80,255,0.15)]"
            style={{ fontSize: "11px" }}
          />
        </motion.div>

        {/* Confirm button */}
        <motion.button
          onClick={handleConfirm}
          disabled={!selected || !name.trim()}
          className={`pixel-btn w-full max-w-xs ${
            selected && name.trim()
              ? "bg-[#c850ff] border-[#c850ff] text-[#06060e]"
              : "bg-[#1a1a2e] border-[#2a2a40] text-[#3a3a52] cursor-not-allowed"
          }`}
          whileHover={selected && name.trim() ? { boxShadow: "0 0 30px rgba(200,80,255,0.5), 0 0 60px rgba(200,80,255,0.25)" } : undefined}
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
