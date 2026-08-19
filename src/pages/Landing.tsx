import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

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
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Neon orbs */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(255,107,43,0.15) 0%, transparent 70%)", top: "-10%", right: "-10%" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(0,204,255,0.1) 0%, transparent 70%)", bottom: "0%", left: "-5%" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle, rgba(200,80,255,0.08) 0%, transparent 70%)", top: "40%", left: "30%" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌮</span>
          <span className="neon-orange text-lg" style={{ fontFamily: '"Press Start 2P", monospace, system-ui', fontSize: "14px" }}>
            OHO
          </span>
        </div>
        <button
          onClick={handlePlay}
          className="pixel-btn bg-transparent border-[#ff6b2b]/40 text-[#ff6b2b] hover:bg-[#ff6b2b]/10 hover:border-[#ff6b2b]/70"
        >
          {isAuthenticated ? "Dashboard" : "Sign Up"}
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {/* Floating food emojis */}
          <motion.div
            className="flex justify-center gap-5 mb-10"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          >
            {["🌮", "🧆", "🌯", "🧃", "🫔"].map((emoji, i) => (
              <motion.span
                key={i}
                className="text-4xl sm:text-5xl"
                animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>

          {/* Title */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight"
            style={{ fontFamily: '"Press Start 2P", monospace, system-ui' }}
          >
            <span className="neon-orange">OHO</span>{" "}
            <span className="neon-yellow">Shawarma</span>
            <br />
            <span className="neon-pink text-4xl sm:text-6xl md:text-7xl">PANIC</span>
          </h1>

          <p
            className="mt-6 text-sm sm:text-base leading-relaxed max-w-lg mx-auto"
            style={{ color: "#8888aa", fontFamily: "monospace" }}
          >
            Dash through neon maces, gobble every shawarma in sight,
            and dodge the ghosts before they catch you. How far can you go?
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={handlePlay}
              className="pixel-btn bg-[#ff6b2b] border-[#ff6b2b] text-[#06060e] font-bold"
              whileHover={{ boxShadow: "0 0 30px rgba(255,107,43,0.5), 0 0 60px rgba(255,107,43,0.25)" }}
              whileTap={{ scale: 0.96 }}
            >
              ▶ Play Now
            </motion.button>
            <button
              onClick={() => navigate("/auth?returnTo=/dashboard")}
              className="text-sm hover:text-[#ff6b2b] transition-colors"
              style={{ color: "#6a6a8a", fontFamily: "monospace" }}
            >
              Already have an account? Log in
            </button>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="mt-20 flex flex-wrap justify-center gap-3 max-w-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { icon: "🏃", text: "Endless rounds", color: "#ff6b2b" },
            { icon: "👻", text: "Ghost chasers", color: "#ff3366" },
            { icon: "🏆", text: "Global leaderboard", color: "#ffdd00" },
            { icon: "🎨", text: "Pick your character", color: "#00ccff" },
          ].map((feat) => (
            <div
              key={feat.text}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: feat.color + "20",
                color: "#8888aa",
                fontFamily: "monospace",
              }}
            >
              <span>{feat.icon}</span>
              <span>{feat.text}</span>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-[10px]" style={{ color: "#3a3a52", fontFamily: "monospace" }}>
        OHO Shawarma Panic — A neon maze chase game
      </footer>
    </div>
  );
}
