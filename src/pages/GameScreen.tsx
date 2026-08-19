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
    // Start game on mount
    const timer = setTimeout(() => startGame(), 100);
    return () => clearTimeout(timer);
  }, [startGame]);

  // Auto-scale canvas to fit viewport while maintaining aspect ratio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const maxW = container.clientWidth - 16;
      const maxH = container.clientHeight - 16;
      const scaleX = maxW / CANVAS_WIDTH;
      const scaleY = maxH / CANVAS_HEIGHT;
      const scale = Math.min(scaleX, scaleY, 2);

      canvas.style.width = `${CANVAS_WIDTH * scale}px`;
      canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-shawarma/5 rounded-full blur-3xl" />
      </div>

      {/* Canvas container */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-lg"
          style={{
            imageRendering: "pixelated",
            boxShadow: "0 0 40px rgba(249,115,22,0.15), 0 0 80px rgba(249,115,22,0.08)",
            border: "2px solid rgba(249,115,22,0.2)",
          }}
        />
      </div>

      {/* Controls hint */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs opacity-40 z-10"
        style={{ color: "#8888aa", fontFamily: "monospace" }}
      >
        WASD or Arrow Keys to move
      </div>
    </div>
  );
}
