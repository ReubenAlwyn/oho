import { motion } from "framer-motion";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#06060e] flex flex-col items-center justify-center relative overflow-hidden scanlines">
      <div className="absolute inset-0 grid-bg" />

      {/* Neon orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ff6b2b]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        <motion.h1
          className="text-5xl sm:text-7xl font-black neon-orange"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          404
        </motion.h1>

        <motion.p
          className="text-sm text-[#6a6a8a] text-center"
          style={{ fontFamily: '"Silkscreen", monospace' }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          This maze doesn&apos;t exist. You got lost.
        </motion.p>

        <motion.button
          onClick={() => navigate("/")}
          className="pixel-btn bg-[#ff6b2b] border-[#ff6b2b] text-[#06060e]"
          whileHover={{ boxShadow: "0 0 30px rgba(255,107,43,0.5), 0 0 60px rgba(255,107,43,0.25)" }}
          whileTap={{ scale: 0.94 }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Back Home
        </motion.button>
      </div>
    </div>
  );
}
