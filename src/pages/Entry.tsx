import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import shawarmaPixel from "../assets/shawarma-pixel.png";

export default function Entry() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // If already signed in with a valid user, go straight to game
  if (isAuthenticated && user) {
    navigate("/game", { replace: true });
    return null;
  }

  const handleSignIn = () => {
    navigate("/auth?returnTo=/game");
  };

  const handleGuest = () => {
    localStorage.setItem("force-guest-ts", Date.now().toString());
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-[#06060e] flex flex-col items-center justify-center relative overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg" />

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

      {/* Back to home — big button */}
      <motion.button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-20 flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-[#00ccff]/30 bg-[#00ccff]/5 text-[#00ccff] hover:bg-[#00ccff]/15 hover:border-[#00ccff]/60 transition-all"
        style={{ fontSize: "18px" }}
        whileHover={{ x: -4, boxShadow: "0 0 20px rgba(0,204,255,0.2)" }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <span style={{ fontSize: "22px" }}>&larr;</span>
        Home
      </motion.button>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Title */}
        <motion.div
          className="text-center flex flex-col items-center"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img
            src={shawarmaPixel}
            alt=""
            className="w-20 mb-4"
            style={{ imageRendering: "pixelated", height: "auto" }}
          />
          <h1 className="neon-purple-glossy leading-none" style={{ fontSize: "clamp(40px, 8vw, 72px)" }}>
            Ready to Play?
          </h1>
          <p className="mt-4 text-xs text-[#6a6a8a] max-w-xs">
            Sign in to track your scores on the leaderboard, or jump right in as a guest.
          </p>
        </motion.div>

        {/* Choice buttons */}
        <motion.div
          className="flex flex-col items-center gap-4 w-full max-w-xs"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {/* Sign In */}
          <motion.button
            onClick={handleSignIn}
            className="pixel-btn w-full bg-[#c850ff] border-[#c850ff] text-[#06060e]"
            whileHover={{ boxShadow: "0 0 30px rgba(200,80,255,0.5), 0 0 60px rgba(200,80,255,0.25)" }}
            whileTap={{ scale: 0.94 }}
          >
            Sign In / Sign Up
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-[#2a2a40]" />
            <span className="text-[10px] text-[#3a3a52]">or</span>
            <div className="flex-1 h-px bg-[#2a2a40]" />
          </div>

          {/* Play as Guest */}
          <motion.button
            onClick={handleGuest}
            className="pixel-btn w-full bg-transparent border-[#00ccff]/40 text-[#00ccff] hover:bg-[#00ccff]/10 hover:border-[#00ccff]/70"
            whileHover={{ boxShadow: "0 0 20px rgba(0,204,255,0.2)" }}
            whileTap={{ scale: 0.96 }}
          >
            Play as Guest
          </motion.button>

          <p className="text-[10px] text-[#3a3a52] text-center mt-1">
            Guest progress won&apos;t be saved
          </p>
        </motion.div>
      </div>
    </div>
  );
}
