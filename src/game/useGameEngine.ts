// ─── Game Engine Hook ───
// Manages the entire game loop, state machine, input, and rendering.

import { useRef, useEffect, useCallback, useState } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, PLAYER_SPEED, PLAYER_START_LIVES, INVINCIBLE_DURATION, SHAWARMA_SCORE, ROUND_COMPLETE_SCORE, BASE_ENEMY_SPEED, ENEMY_SPEED_INCREMENT, ENEMY_CHASE_INTERVAL, MIN_SHAWARMAS, MAX_SHAWARMAS } from "./constants";
import { generateMaze, placeShawarmas, type MazeGrid } from "./maze";
import { findPath, getSpawnPositions } from "./pathfinding";
import { renderFrame, resetMazeBuffer } from "./renderer";
import { createCollectParticles, createHitParticles, createRoundCompleteParticles, updateParticles } from "./particles";
import type { Player, Enemy, Shawarma, Particle, Direction, CharacterType, GameState } from "./types";

interface GameEngineOptions {
  character: CharacterType;
  onGameOver: (score: number, round: number) => void;
}

interface Keys {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
  w: boolean;
  s: boolean;
  a: boolean;
  d: boolean;
  W: boolean;
  S: boolean;
  A: boolean;
  D: boolean;
}

export function useGameEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>, options: GameEngineOptions) {
  const { character, onGameOver } = options;

  // Game state
  const gameStateRef = useRef<GameState>("idle");
  const gridRef = useRef<MazeGrid>([]);
  const playerRef = useRef<Player | null>(null);
  const enemiesRef = useRef<Enemy[]>([]);
  const shawarmasRef = useRef<Shawarma[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const frameRef = useRef(0);
  const keysRef = useRef<Keys>({
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    w: false, s: false, a: false, d: false,
    W: false, S: false, A: false, D: false,
  });
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const transitionTimerRef = useRef(0);
  const transitionTextRef = useRef("");
  const animFrameRef = useRef(0);

  // React state for HUD
  const [hudState, setHudState] = useState({ score: 0, round: 1, lives: PLAYER_START_LIVES });

  /**
   * Initialize a new round.
   */
  const initRound = useCallback((round: number) => {
    const grid = generateMaze();
    gridRef.current = grid;
    resetMazeBuffer();

    // Place player at top-left open area
    const startRow = 1;
    const startCol = 1;

    const player: Player = {
      type: character,
      tilePos: { row: startRow, col: startCol },
      pixelPos: { x: startCol * TILE_SIZE, y: startRow * TILE_SIZE },
      targetPixelPos: { x: startCol * TILE_SIZE, y: startRow * TILE_SIZE },
      direction: "right",
      moving: false,
      lives: playerRef.current?.lives ?? PLAYER_START_LIVES,
      invincible: true,
      invincibleTimer: INVINCIBLE_DURATION,
    };
    playerRef.current = player;

    // Place shawarmas
    const shawarmaCount = MIN_SHAWARMAS + Math.floor(Math.random() * (MAX_SHAWARMAS - MIN_SHAWARMAS + 1));
    const excludePos: [number, number][] = [[startRow, startCol]];
    const shawarmaPositions = placeShawarmas(grid, shawarmaCount, excludePos);
    shawarmasRef.current = shawarmaPositions.map(([r, c], i) => ({
      id: i,
      tilePos: { row: r, col: c },
      collected: false,
      animTimer: 0,
    }));

    // Spawn enemies
    const enemyCount = round;
    const spawnPositions = getSpawnPositions(grid, startRow, startCol, 8);
    const shuffledSpawns = spawnPositions.sort(() => Math.random() - 0.5);
    enemiesRef.current = [];
    for (let i = 0; i < enemyCount; i++) {
      const pos = shuffledSpawns[i % shuffledSpawns.length];
      enemiesRef.current.push({
        id: i,
        type: i % 5,
        tilePos: { row: pos[0], col: pos[1] },
        pixelPos: { x: pos[1] * TILE_SIZE, y: pos[0] * TILE_SIZE },
        targetPixelPos: { x: pos[1] * TILE_SIZE, y: pos[0] * TILE_SIZE },
        direction: "right",
        speed: BASE_ENEMY_SPEED + (round - 1) * ENEMY_SPEED_INCREMENT,
        active: true,
        moving: true,
      });
    }

    particlesRef.current = createRoundCompleteParticles(CANVAS_WIDTH, CANVAS_HEIGHT);
  }, [character]);

  /**
   * Handle enemy-player collision.
   */
  const handlePlayerHit = useCallback(() => {
    const player = playerRef.current;
    if (!player || player.invincible) return;

    player.lives -= 1;
    player.invincible = true;
    player.invincibleTimer = INVINCIBLE_DURATION;

    // Screen shake
    shakeRef.current = { x: 0, y: 0, intensity: 10 };

    // Hit particles
    particlesRef.current.push(
      ...createHitParticles(
        player.pixelPos.x + TILE_SIZE / 2,
        player.pixelPos.y + TILE_SIZE / 2
      )
    );

    // Check game over
    if (player.lives <= 0) {
      gameStateRef.current = "game-over";
      setTimeout(() => {
        onGameOver(scoreRef.current, roundRef.current);
      }, 1500);
    }

    setHudState((prev) => ({ ...prev, lives: player.lives }));
  }, [onGameOver]);

  /**
   * Move entity toward its target pixel position.
   */
  const moveEntity = (
    pixelPos: { x: number; y: number },
    targetPos: { x: number; y: number },
    speed: number
  ): boolean => {
    const dx = targetPos.x - pixelPos.x;
    const dy = targetPos.y - pixelPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < speed) {
      pixelPos.x = targetPos.x;
      pixelPos.y = targetPos.y;
      return true; // arrived
    }

    pixelPos.x += (dx / dist) * speed;
    pixelPos.y += (dy / dist) * speed;
    return false;
  };

  /**
   * Get tile position from pixel position.
   */
  const pixelToTile = (px: number, py: number): { row: number; col: number } => ({
    row: Math.round(py / TILE_SIZE),
    col: Math.round(px / TILE_SIZE),
  });

  /**
   * Start moving in a direction if the target tile is open.
   */
  const startMove = (player: Player, dir: Direction) => {
    if (player.moving) return;

    let dr = 0;
    let dc = 0;
    if (dir === "up") dr = -1;
    else if (dir === "down") dr = 1;
    else if (dir === "left") dc = -1;
    else if (dir === "right") dc = 1;

    const newRow = player.tilePos.row + dr;
    const newCol = player.tilePos.col + dc;

    const grid = gridRef.current;
    if (
      newRow >= 0 && newRow < grid.length &&
      newCol >= 0 && newCol < grid[0].length &&
      grid[newRow][newCol] === 0
    ) {
      player.direction = dir;
      player.moving = true;
      player.targetPixelPos = {
        x: newCol * TILE_SIZE,
        y: newRow * TILE_SIZE,
      };
    } else {
      player.direction = dir;
    }
  };

  /**
   * Main game update loop.
   */
  const update = useCallback(() => {
    const state = gameStateRef.current;
    if (state === "game-over" || state === "idle") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    frameRef.current++;
    const frame = frameRef.current;
    const player = playerRef.current;
    if (!player) return;

    // Round transition
    if (state === "round-transition") {
      transitionTimerRef.current--;
      if (transitionTimerRef.current <= 0) {
        gameStateRef.current = "playing";
        roundRef.current++;
        initRound(roundRef.current);
        setHudState({ score: scoreRef.current, round: roundRef.current, lives: player.lives });
      }
      // Still render during transition
      renderFrame(
        ctx, gridRef.current, player, enemiesRef.current, shawarmasRef.current,
        particlesRef.current, scoreRef.current, roundRef.current, frame,
        shakeRef.current.x, shakeRef.current.y
      );
      // Draw transition text
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, CANVAS_HEIGHT / 2 - 40, CANVAS_WIDTH, 80);
      ctx.fillStyle = "#c084fc";
      ctx.font = 'bold 20px "Press Start 2P", monospace, system-ui';
      ctx.textAlign = "center";
      ctx.fillText(transitionTextRef.current, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 8);
      ctx.textAlign = "left";
      return;
    }

    // Update shake
    if (shakeRef.current.intensity > 0) {
      shakeRef.current.x = (Math.random() - 0.5) * shakeRef.current.intensity;
      shakeRef.current.y = (Math.random() - 0.5) * shakeRef.current.intensity;
      shakeRef.current.intensity *= 0.85;
      if (shakeRef.current.intensity < 0.5) {
        shakeRef.current = { x: 0, y: 0, intensity: 0 };
      }
    }

    // Input handling
    const keys = keysRef.current;
    if (keys.ArrowUp || keys.w || keys.W) startMove(player, "up");
    else if (keys.ArrowDown || keys.s || keys.S) startMove(player, "down");
    else if (keys.ArrowLeft || keys.a || keys.A) startMove(player, "left");
    else if (keys.ArrowRight || keys.d || keys.D) startMove(player, "right");

    // Move player
    if (player.moving) {
      const arrived = moveEntity(player.pixelPos, player.targetPixelPos, PLAYER_SPEED);
      if (arrived) {
        player.moving = false;
        player.tilePos = pixelToTile(player.pixelPos.x, player.pixelPos.y);
      }
    }

    // Update invincibility
    if (player.invincible) {
      player.invincibleTimer--;
      if (player.invincibleTimer <= 0) {
        player.invincible = false;
      }
    }

    // Enemy AI & movement
    for (const enemy of enemiesRef.current) {
      if (!enemy.active) continue;

      // Move toward target
      if (enemy.moving === false) enemy.moving = true;
      const arrived = moveEntity(enemy.pixelPos, enemy.targetPixelPos, enemy.speed);

      if (arrived) {
        enemy.tilePos = pixelToTile(enemy.pixelPos.x, enemy.pixelPos.y);
        enemy.targetPixelPos = { ...enemy.pixelPos };

        // Recalculate path periodically
        if (frame % ENEMY_CHASE_INTERVAL === enemy.id % ENEMY_CHASE_INTERVAL) {
          const dir = findPath(
            gridRef.current,
            enemy.tilePos.row,
            enemy.tilePos.col,
            player.tilePos.row,
            player.tilePos.col
          );
          if (dir) {
            enemy.direction = dir;
            let dr = 0, dc = 0;
            if (dir === "up") dr = -1;
            else if (dir === "down") dr = 1;
            else if (dir === "left") dc = -1;
            else if (dir === "right") dc = 1;

            const nr = enemy.tilePos.row + dr;
            const nc = enemy.tilePos.col + dc;
            if (
              nr >= 0 && nr < gridRef.current.length &&
              nc >= 0 && nc < gridRef.current[0].length &&
              gridRef.current[nr][nc] === 0
            ) {
              enemy.targetPixelPos = { x: nc * TILE_SIZE, y: nr * TILE_SIZE };
            }
          }
        }
      }

      // Check collision with player
      if (!player.invincible) {
        const dx = enemy.pixelPos.x - player.pixelPos.x;
        const dy = enemy.pixelPos.y - player.pixelPos.y;
        if (Math.abs(dx) < TILE_SIZE * 0.7 && Math.abs(dy) < TILE_SIZE * 0.7) {
          handlePlayerHit();
        }
      }
    }

    // Check shawarma collection
    let allCollected = true;
    for (const s of shawarmasRef.current) {
      if (s.collected) continue;
      allCollected = false;

      const dx = s.tilePos.col * TILE_SIZE - player.pixelPos.x;
      const dy = s.tilePos.row * TILE_SIZE - player.pixelPos.y;
      if (Math.abs(dx) < TILE_SIZE * 0.6 && Math.abs(dy) < TILE_SIZE * 0.6) {
        s.collected = true;
        scoreRef.current += SHAWARMA_SCORE;

        // Collect particles
        particlesRef.current.push(
          ...createCollectParticles(
            s.tilePos.col * TILE_SIZE + TILE_SIZE / 2,
            s.tilePos.row * TILE_SIZE + TILE_SIZE / 2
          )
        );

        setHudState((prev) => ({ ...prev, score: scoreRef.current }));
      }
    }

    // Round complete
    if (allCollected && shawarmasRef.current.length > 0) {
      scoreRef.current += ROUND_COMPLETE_SCORE;
      gameStateRef.current = "round-transition";
      transitionTimerRef.current = 120; // 2 seconds
      transitionTextRef.current = `Round ${roundRef.current} Complete! +${ROUND_COMPLETE_SCORE}`;
      particlesRef.current.push(
        ...createRoundCompleteParticles(CANVAS_WIDTH, CANVAS_HEIGHT)
      );
      setHudState((prev) => ({ ...prev, score: scoreRef.current }));
    }

    // Update particles
    particlesRef.current = updateParticles(particlesRef.current);

    // Render
    renderFrame(
      ctx, gridRef.current, player, enemiesRef.current, shawarmasRef.current,
      particlesRef.current, scoreRef.current, roundRef.current, frame,
      shakeRef.current.x, shakeRef.current.y
    );

    // Render dying state
    if (state === "dying") {
      ctx.fillStyle = "rgba(239,68,68,0.3)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, [canvasRef, initRound, handlePlayerHit]);

  /**
   * Start the game.
   */
  const startGame = useCallback(() => {
    scoreRef.current = 0;
    roundRef.current = 1;
    frameRef.current = 0;
    gameStateRef.current = "playing";
    initRound(1);
    setHudState({ score: 0, round: 1, lives: PLAYER_START_LIVES });
  }, [initRound]);

  /**
   * Set up keyboard input and game loop.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key as keyof Keys;
      if (key in keysRef.current) {
        keysRef.current[key] = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key as keyof Keys;
      if (key in keysRef.current) {
        keysRef.current[key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Game loop
    const loop = () => {
      update();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [update]);

  return {
    startGame,
    hudState,
    gameState: gameStateRef.current,
  };
}
