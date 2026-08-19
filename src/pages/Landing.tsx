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
    <div className="min-h-screen bg-cream flex flex-col overflow-hidden relative">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-shawarma/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-16 w-64 h-64 bg-mint/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-berry/8 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌮</span>
          <span className="font-black text-lg tracking-tight text-foreground" style={{ fontFamily: '"Press Start 2P", monospace, system-ui', fontSize: "14px" }}>
            OHO
          </span>
        </div>
        <button
          onClick={handlePlay}
          className="px-5 py-2.5 bg-shawarma text-white font-bold text-sm rounded-full
                     hover:bg-shawarma/90 hover:shadow-lg hover:shadow-shawarma/20
                     active:scale-95 transition-all duration-200"
          style={{ fontFamily: '"Press Start 2P", monospace, system-ui', fontSize: "11px" }}
        >
          {isAuthenticated ? "Dashboard" : "Sign Up Free"}
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          {/* Floating tacos */}
          <motion.div
            className="flex justify-center gap-3 mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {["🌮", "🧆", "🌯"].map((emoji, i) => (
              <motion.span
                key={i}
                className="text-4xl sm:text-5xl"
                animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>

          <h1 className="text-4xl sm:text-6xl font-black text-foreground leading-tight tracking-tight">
            OHO Shawarma
            <br />
            <span className="text-shawarma" style={{ textShadow: "0 2px 20px rgba(249,115,22,0.25)" }}>
              Panic
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Chase through neon mazes, gobble up every shawarma in sight,
            and dodge the ghosts before they catch you. How far can you go?
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handlePlay}
              className="px-8 py-4 bg-shawarma text-white font-bold rounded-full text-base
                         hover:bg-shawarma/90 hover:shadow-xl hover:shadow-shawarma/25
                         active:scale-95 transition-all duration-200 w-full sm:w-auto"
              style={{ fontFamily: '"Press Start 2P", monospace, system-ui', fontSize: "13px" }}
            >
              ▶ Play Now
            </button>
            <button
              onClick={() => navigate("/auth?returnTo=/dashboard")}
              className="px-6 py-4 text-foreground/60 font-medium text-sm rounded-full
                         hover:text-foreground hover:bg-foreground/5 transition-all duration-200 w-full sm:w-auto"
            >
              Already have an account? Log in
            </button>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-3 max-w-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { icon: "🏃", text: "Endless rounds" },
            { icon: "👻", text: "Ghost chasers" },
            { icon: "🏆", text: "Global leaderboard" },
            { icon: "🎨", text: "Pick your character" },
          ].map((feat) => (
            <div
              key={feat.text}
              className="flex items-center gap-2 px-4 py-2 bg-white/70 rounded-full border border-border text-sm text-foreground/70"
            >
              <span>{feat.icon}</span>
              <span>{feat.text}</span>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-muted-foreground/50">
        OHO Shawarma Panic &mdash; A maze chase game
      </footer>
    </div>
  );
}
