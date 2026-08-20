import { useRef, useEffect, useCallback } from "react";
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

  // Scale canvas to fill viewport while preserving aspect ratio (contain)
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
    const screenAspect = vw / vh;

    let drawW: number;
    let drawH: number;

    if (screenAspect > canvasAspect) {
      // Screen is wider than canvas — fit to height
      drawH = vh;
      drawW = vh * canvasAspect;
    } else {
      // Screen is taller than canvas — fit to width
      drawW = vw;
      drawH = vw / canvasAspect;
    }

    canvas.style.width = `${Math.floor(drawW)}px`;
    canvas.style.height = `${Math.floor(drawH)}px`;
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]);

  return (
    <div className="fixed inset-0 bg-[#06060e] overflow-hidden z-50 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
