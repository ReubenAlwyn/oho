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

  // Fill entire viewport
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Fill the entire screen
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#06060e] overflow-hidden z-50">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
