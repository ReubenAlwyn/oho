import { useRef, useEffect } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../game/constants";
import { useGameEngine } from "../game/useGameEngine";
import type { CharacterType } from "../game/types";

interface GameScreenProps {
  character: CharacterType;
  onGameOver: (score: number, round: number) => void;
}

export default function GameScreen({ character, onGameOver }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startGame } = useGameEngine(canvasRef, { character, onGameOver });

  useEffect(() => {
    const timer = setTimeout(() => startGame(), 100);
    return () => clearTimeout(timer);
  }, [startGame]);

  // Auto-scale canvas to fill viewport
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scaleX = vw / CANVAS_WIDTH;
      const scaleY = vh / CANVAS_HEIGHT;
      const scale = Math.min(scaleX, scaleY);

      canvas.style.width = `${CANVAS_WIDTH * scale}px`;
      canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#06060e] flex items-center justify-center overflow-hidden z-50">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#c850ff]/5 rounded-full blur-[100px]" />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="relative z-10 rounded-sm"
        style={{
          imageRendering: "pixelated",
          boxShadow:
            "0 0 2px rgba(200,80,255,0.4), 0 0 20px rgba(200,80,255,0.15), 0 0 60px rgba(200,80,255,0.06)",
          border: "2px solid rgba(200,80,255,0.25)",
        }}
      />
    </div>
  );
}
