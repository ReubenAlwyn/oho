import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import shawarmaPixel from "../assets/shawarma-pixel.png";
import Footer from "@/components/Footer";

const floatingShawarmas = [
  { x: "8%", y: "15%", size: 140, delay: 0, duration: 7, rotation: 12 },
  { x: "82%", y: "20%", size: 160, delay: 1.2, duration: 9, rotation: -8 },
  { x: "15%", y: "70%", size: 120, delay: 2.5, duration: 8, rotation: 15 },
  { x: "75%", y: "65%", size: 130, delay: 0.8, duration: 7.5, rotation: -10 },
  { x: "50%", y: "10%", size: 110, delay: 3, duration: 6.5, rotation: 5 },
  { x: "90%", y: "80%", size: 115, delay: 1.8, duration: 8.5, rotation: -15 },
  { x: "35%", y: "85%", size: 125, delay: 0.5, duration: 7, rotation: 8 },
];

interface MainMenuProps {
  onPlay: () => void;
  onLeaderboard: () => void;
}

export default function MainMenu({ onPlay, onLeaderboard }: MainMenuProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#06060e] flex flex-col relative overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg" />

      {/* Floating pixel shawarmas in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {floatingShawarmas.map((s, i) => (
          <motion.img
            key={i}
            src={shawarmaPixel}
            alt=""
            className="absolute"
            style={{
              left: s.x,
              top: s.y,
              width: s.size,
              height: "auto",
              imageRendering: "pixelated",
              opacity: 0.1,
              filter: "brightness(0.7) saturate(1.3)",
            }}
            animate={{
              y: [0, -25, -10, -30, 0],
              rotate: [0, s.rotation, -s.rotation / 2, s.rotation * 0.7, 0],
              opacity: [0.06, 0.12, 0.08, 0.11, 0.06],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Animated neon orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(200,80,255,0.12) 0%, transparent 70%)", top: "10%", left: "20%" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle, rgba(0,204,255,0.08) 0%, transparent 70%)", bottom: "20%", right: "15%" }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>

      {/* Back to dashboard — big button */}
      <motion.button
        onClick={() => navigate("/dashboard")}
        className="absolute top-8 left-8 z-20 flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-[#00ccff]/30 bg-[#00ccff]/5 text-[#00ccff] hover:bg-[#00ccff]/15 hover:border-[#00ccff]/60 transition-all"
        style={{ fontSize: "18px" }}
        whileHover={{ x: -4, boxShadow: "0 0 20px rgba(0,204,255,0.2)" }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <span style={{ fontSize: "22px" }}>&larr;</span>
        Dashboard
      </motion.button>

      <div className="flex-1 flex items-center justify-center w-full">
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Title */}
        <motion.div
          className="text-center flex flex-col items-center"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1
            className="neon-purple-glossy leading-none"
            style={{ fontSize: "clamp(64px, 14vw, 140px)" }}
            animate={{
              filter: [
                "drop-shadow(0 0 10px rgba(200,80,255,0.6)) drop-shadow(0 0 25px rgba(200,80,255,0.3))",
                "drop-shadow(0 0 16px rgba(200,80,255,0.8)) drop-shadow(0 0 35px rgba(200,80,255,0.4))",
                "drop-shadow(0 0 10px rgba(200,80,255,0.6)) drop-shadow(0 0 25px rgba(200,80,255,0.3))",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            OHO
          </motion.h1>
          <motion.h2
            className="neon-cyan leading-none mt-2"
            style={{ fontSize: "clamp(20px, 4.5vw, 40px)" }}
            animate={{
              textShadow: [
                "0 0 8px #00ccff, 0 0 24px rgba(0,204,255,0.5), 0 0 48px rgba(0,204,255,0.2)",
                "0 0 14px #00ccff, 0 0 36px rgba(0,204,255,0.7), 0 0 64px rgba(0,204,255,0.35)",
                "0 0 8px #00ccff, 0 0 24px rgba(0,204,255,0.5), 0 0 48px rgba(0,204,255,0.2)",
              ],
            }}
            transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            SHAWARMA PANIC
          </motion.h2>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col items-center gap-4 w-full max-w-xs"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <motion.button
            onClick={onPlay}
            className="pixel-btn w-full bg-[#c850ff] border-[#c850ff] text-[#06060e]"
            whileHover={{ boxShadow: "0 0 30px rgba(200,80,255,0.5), 0 0 60px rgba(200,80,255,0.25)" }}
            whileTap={{ scale: 0.94 }}
          >
            Start Game
          </motion.button>

          <motion.button
            onClick={onLeaderboard}
            className="pixel-btn w-full bg-transparent border-[#2a2a40] text-[#6a6a8a] hover:text-[#ffdd00] hover:border-[#ffdd00]/40"
            whileHover={{ boxShadow: "0 0 20px rgba(255,221,0,0.15)" }}
            whileTap={{ scale: 0.96 }}
          >
            Leaderboard
          </motion.button>
        </motion.div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
