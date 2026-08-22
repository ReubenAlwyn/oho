import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import type { CharacterType } from "../game/types";
import Footer from "@/components/Footer";

interface CharacterSelectProps {
  onSelect: (character: CharacterType, name: string) => void;
  onBack: () => void;
}

// Try importing images — fall back to empty strings if they don't exist
let boyImgSrc = "";
let girlImgSrc = "";
try {
  boyImgSrc = new URL("../assets/boy.jpg", import.meta.url).href;
} catch { /* no image yet */ }
try {
  girlImgSrc = new URL("../assets/girl.jpg", import.meta.url).href;
} catch { /* no image yet */ }

// Preload images
const boyImg = new Image();
const girlImg = new Image();
if (boyImgSrc) boyImg.src = boyImgSrc;
if (girlImgSrc) girlImg.src = girlImgSrc;

export default function CharacterSelect({ onSelect, onBack }: CharacterSelectProps) {
  const [selected, setSelected] = useState<CharacterType | null>(null);
  const [name, setName] = useState("");
  const [boyReady, setBoyReady] = useState(boyImg.complete && boyImg.naturalWidth > 0);
  const [girlReady, setGirlReady] = useState(girlImg.complete && girlImg.naturalWidth > 0);

  const { isAuthenticated, user } = useAuth();
  const savedName = useQuery(api.profiles.getPlayerName);
  const savePlayerName = useMutation(api.profiles.savePlayerName);

  // Use profile query result, with user.name as immediate fallback
  // This prevents the name input from flashing while the query loads
  const effectiveName = savedName ?? user?.name ?? null;
  const profileLoaded = savedName !== undefined;

  // Signed-in user: use their profile name directly (no input needed)
  const isSignedIn = isAuthenticated && effectiveName !== null;
  const displayName = isSignedIn ? (effectiveName ?? "") : name;

  // First-time signed-in users: still need to set a name
  const needsNameSetup = isAuthenticated && profileLoaded && savedName === null;
  const showNameInput = !isAuthenticated || needsNameSetup;

  useEffect(() => {
    if (boyImgSrc && !boyImg.complete) {
      boyImg.onload = () => setBoyReady(true);
    }
    if (girlImgSrc && !girlImg.complete) {
      girlImg.onload = () => setGirlReady(true);
    }
  }, []);

  const handleConfirm = async () => {
    if (selected && displayName.trim()) {
      // If signed in and first time, save name to profile
      if (needsNameSetup) {
        try {
          await savePlayerName({ name: displayName.trim() });
        } catch {
          // Profile save failed — still allow play
        }
      }
      onSelect(selected, displayName.trim());
    }
  };

  interface CharDef {
    type: CharacterType;
    label: string;
    imgSrc: string;
    imgReady: boolean;
    glow: string;
    bg: string;
    border: string;
    badgeBg: string;
    fallbackColor: string;
  }

  const characters: CharDef[] = [
    { type: "boy", label: "Shawarzilla", imgSrc: boyImgSrc, imgReady: boyReady, glow: "rgba(0,204,255,0.3)", bg: "rgba(0,204,255,0.04)", border: "rgba(0,204,255,0.5)", badgeBg: "#00ccff", fallbackColor: "#00ccff" },
    { type: "girl", label: "Shawarpunzel", imgSrc: girlImgSrc, imgReady: girlReady, glow: "rgba(200,80,255,0.3)", bg: "rgba(200,80,255,0.04)", border: "rgba(200,80,255,0.5)", badgeBg: "#c850ff", fallbackColor: "#c850ff" },
  ];

  return (
    <div className="min-h-screen bg-[#06060e] flex flex-col items-center justify-center relative overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg" />

      {/* Neon orb */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#c850ff]/5 rounded-full blur-[100px]" />
      </div>

      {/* Back button — top left, big and clear */}
      <motion.button
        onClick={onBack}
        className="absolute top-8 left-8 z-20 flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-[#00ccff]/30 bg-[#00ccff]/5 text-[#00ccff] hover:bg-[#00ccff]/15 hover:border-[#00ccff]/60 transition-all"
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

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-lg">
        <motion.div
          className="text-center flex flex-col items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-xl sm:text-2xl neon-purple">
            Pick Your Character
          </h2>
          {/* Show profile name for signed-in users with a saved name */}
          {isSignedIn && savedName && (
            <p className="text-xs text-[#6a6a8a] mt-2">
              Playing as <span className="neon-cyan">{savedName}</span>
            </p>
          )}
          {/* First-time signed-in users: prompt to set name */}
          {needsNameSetup && (
            <p className="text-xs text-[#6a6a8a] mt-2">
              First time here — set your username below
            </p>
          )}
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
                {char.imgReady && char.imgSrc ? (
                  <img
                    src={char.imgSrc}
                    alt={char.label}
                    className="w-full h-full object-cover"
                    style={{
                      filter: selected === char.type
                        ? `drop-shadow(0 0 12px ${char.glow})`
                        : "none",
                    }}
                  />
                ) : (
                  // Fallback placeholder
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-full"
                      style={{
                        backgroundColor: char.fallbackColor,
                        opacity: 0.7,
                        boxShadow: selected === char.type ? `0 0 20px ${char.glow}` : "none",
                      }}
                    />
                  </div>
                )}
              </div>
              <span
                className={`text-sm ${char.type === "boy" ? "neon-cyan" : "neon-purple"}`}
              >
                {char.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Name input — only for guests and first-time signed-in users */}
        {showNameInput && (
          <motion.div
            className="w-full max-w-xs"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-[10px] mb-2 neon-cyan opacity-50">
              {needsNameSetup ? "Choose Your Username" : "Your Name"}
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
        )}

        {/* Confirm button */}
        <motion.button
          onClick={handleConfirm}
          disabled={!selected || !displayName.trim()}
          className={`pixel-btn w-full max-w-xs ${
            selected && displayName.trim()
              ? "bg-[#c850ff] border-[#c850ff] text-[#06060e]"
              : "bg-[#1a1a2e] border-[#2a2a40] text-[#3a3a52] cursor-not-allowed"
          }`}
          whileHover={selected && displayName.trim() ? { boxShadow: "0 0 30px rgba(200,80,255,0.5), 0 0 60px rgba(200,80,255,0.25)" } : undefined}
          whileTap={selected && displayName.trim() ? { scale: 0.94 } : undefined}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Let&apos;s Go!
        </motion.button>
      </div>
      <Footer />
    </div>
  );
}
