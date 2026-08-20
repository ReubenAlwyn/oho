import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import shawarmaPixel from "../assets/shawarma-pixel.png";

const floatingShawarmas = [
  { x: "8%", y: "15%", size: 140, delay: 0, duration: 7, rotation: 12 },
  { x: "82%", y: "20%", size: 160, delay: 1.2, duration: 9, rotation: -8 },
  { x: "15%", y: "70%", size: 120, delay: 2.5, duration: 8, rotation: 15 },
  { x: "75%", y: "65%", size: 130, delay: 0.8, duration: 7.5, rotation: -10 },
  { x: "50%", y: "10%", size: 110, delay: 3, duration: 6.5, rotation: 5 },
  { x: "90%", y: "80%", size: 115, delay: 1.8, duration: 8.5, rotation: -15 },
  { x: "35%", y: "85%", size: 125, delay: 0.5, duration: 7, rotation: 8 },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePlay = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth?returnTo=/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#06060e] flex flex-col overflow-hidden relative scanlines">
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

      {/* Neon orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(200,80,255,0.12) 0%, transparent 70%)", top: "-10%", right: "-10%" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(0,204,255,0.08) 0%, transparent 70%)", bottom: "0%", left: "-5%" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle, rgba(255,221,0,0.05) 0%, transparent 70%)", top: "40%", left: "30%" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
        >
          <img src={shawarmaPixel} alt="" className="w-12" style={{ imageRendering: "pixelated", height: "auto" }} />
          <span className="neon-cyan" style={{ fontSize: "20px" }}>
            OHO
          </span>
        </motion.div>
        <motion.button
          onClick={handlePlay}
          className="pixel-btn bg-transparent border-[#00ccff]/40 text-[#00ccff] hover:bg-[#00ccff]/15 hover:border-[#00ccff]/80"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAuthenticated ? "Dashboard" : "Sign Up"}
        </motion.button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {/* Title: OHO on top, SHAWARMA PANIC underneath */}
          <div className="flex flex-col items-center">
            <motion.h1
              className="neon-purple-glossy leading-none"
              style={{ fontSize: "clamp(64px, 14vw, 140px)" }}
              animate={{
                filter: [
                  "drop-shadow(0 0 12px rgba(200,80,255,0.6)) drop-shadow(0 0 30px rgba(200,80,255,0.3))",
                  "drop-shadow(0 0 18px rgba(200,80,255,0.8)) drop-shadow(0 0 40px rgba(200,80,255,0.4))",
                  "drop-shadow(0 0 12px rgba(200,80,255,0.6)) drop-shadow(0 0 30px rgba(200,80,255,0.3))",
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
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              SHAWARMA PANIC
            </motion.h2>
          </div>

          <p
            className="mt-8 text-sm sm:text-base leading-relaxed max-w-lg mx-auto"
            style={{ color: "#7a7a9a" }}
          >
            Run. Eat. Don&apos;t die.
            <br />
            A neon maze game where shawarmas won&apos;t collect themselves
            and the ghosts are always one step behind you.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={handlePlay}
              className="pixel-btn bg-[#c850ff] border-[#c850ff] text-[#06060e]"
              whileHover={{ boxShadow: "0 0 30px rgba(200,80,255,0.5), 0 0 60px rgba(200,80,255,0.25)" }}
              whileTap={{ scale: 0.94 }}
            >
              Play Now
            </motion.button>
            <motion.button
              onClick={() => navigate("/auth?returnTo=/dashboard")}
              className="text-sm transition-all duration-300"
              style={{ color: "#6a6a8a" }}
              whileHover={{ scale: 1.05, color: "#00ccff" }}
            >
              Already have an account? Log in
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-[10px]" style={{ color: "#3a3a52" }}>
        OHO Shawarma Panic — Built for high scores and good times
      </footer>
    </div>
  );
}
