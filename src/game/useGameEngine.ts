// ─── Game Engine Hook ───
// Manages the entire game loop, state machine, input, and rendering.

import { useRef, useEffect, useCallback, useState } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, PLAYER_SPEED, PLAYER_START_LIVES, INVINCIBLE_DURATION, SHAWARMA_SCORE, ROUND_COMPLETE_SCORE, BASE_ENEMY_SPEED, ENEMY_SPEED_INCREMENT, ENEMY_CHASE_INTERVAL, MIN_SHAWARMAS, MAX_SHAWARMAS } from "./constants";
import { generateMaze, placeShawarmas, type MazeGrid } from "./maze";
import { findPath, getSpawnPositions } from "./pathfinding";
import { renderFrame, resetMazeBuffer } from "./renderer";
import { createCollectParticles, createHitParticles, createRoundCompleteParticles, updateParticles, createCollectText } from "./particles";
import type { Player, Enemy, Shawarma, Particle, Direction, CharacterType, GameState, FloatingText } from "./types";

interface GameEngineOptions {
  character: CharacterType;
  onGameOver: (score: number, round: number) => void;
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
  // Tap-to-run: persistent direction that stays active until changed
  const pendingDirectionRef = useRef<Direction | null>(null);
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const transitionTimerRef = useRef(0);
  const transitionTextRef = useRef("");
  const animFrameRef = useRef(0);
  const roundStartFrameRef = useRef(0);
  const ENEMY_GRACE_FRAMES = 120; // ~2 seconds before CHUB starts chasing
  const pausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const comboRef = useRef(0);
  const comboTimerRef = useRef(0);

  const togglePause = useCallback(() => {
    const state = gameStateRef.current;
    if (state !== "playing" && state !== "paused") return;
    pausedRef.current = !pausedRef.current;
    gameStateRef.current = pausedRef.current ? "paused" : "playing";
    setIsPaused(pausedRef.current);
  }, []);

  // React state for HUD
  const [hudState, setHudState] = useState({ score: 0, round: 1, lives: PLAYER_START_LIVES });

  /**
   * Initialize a new round.
   */
  const initRound = useCallback((round: number) => {
    const grid = generateMaze();
    gridRef.current = grid;
    resetMazeBuffer();

    const startRow = 1;
    const startCol = 1;

    const player: Player = {
      type: character,
      tilePos: { row: startRow, col: startCol },
      pixelPos: { x: startCol * TILE_SIZE, y: startRow * TILE_SIZE },
      targetPixelPos: { x: startCol * TILE_SIZE, y: startRow * TILE_SIZE },
      direction: "right",
      moving: false,
      lives: PLAYER_START_LIVES,
      invincible: true,
      invincibleTimer: INVINCIBLE_DURATION,
    };
    playerRef.current = player;
    pendingDirectionRef.current = null;

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

    // Track when the round started for enemy grace period
    roundStartFrameRef.current = frameRef.current;

    // Spawn enemies
    const enemyCount = round;
    const spawnPositions = getSpawnPositions(grid, startRow, startCol, 8);
    const shuffledSpawns = spawnPositions.sort(() => Math.random() - 0.5);
    enemiesRef.current = [];
    for (let i = 0; i < enemyCount; i++) {
      // Use unique spawn positions — slice instead of modulo to avoid overlap
      const pos = shuffledSpawns[i % shuffledSpawns.length];
      // If wrapping, offset by 2 tiles to avoid stacking
      const offset = i >= shuffledSpawns.length ? (i - shuffledSpawns.length + 1) * 2 : 0;
      const adjustedCol = Math.min(pos[1] + offset, CANVAS_WIDTH / TILE_SIZE - 1);
      enemiesRef.current.push({
        id: i,
        type: i % 5,
        tilePos: { row: pos[0], col: adjustedCol },
        pixelPos: { x: adjustedCol * TILE_SIZE, y: pos[0] * TILE_SIZE },
        targetPixelPos: { x: adjustedCol * TILE_SIZE, y: pos[0] * TILE_SIZE },
        direction: "right",
        speed: BASE_ENEMY_SPEED + (round - 1) * ENEMY_SPEED_INCREMENT,
        active: true,
        moving: true,
      });
    }

    particlesRef.current = createRoundCompleteParticles(CANVAS_WIDTH, CANVAS_HEIGHT);
    floatingTextsRef.current = [];
    comboRef.current = 0;
    comboTimerRef.current = 0;
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

    shakeRef.current = { x: 0, y: 0, intensity: 10 };

    particlesRef.current.push(
      ...createHitParticles(
        player.pixelPos.x + TILE_SIZE / 2,
        player.pixelPos.y + TILE_SIZE / 2
      )
    );

    // Funny hit reaction text
    const hitTexts = ["OUCH!", "BONK!", "YOINK!", "BOP!", "WHAM!", "owie!", "hey!"];
    floatingTextsRef.current.push({
      x: player.pixelPos.x + TILE_SIZE / 2,
      y: player.pixelPos.y - TILE_SIZE * 0.5,
      text: hitTexts[Math.floor(Math.random() * hitTexts.length)],
      color: "#ff3366",
      life: 45,
      maxLife: 45,
      fontSize: 16,
      vy: -3,
    });

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
      return true;
    }

    pixelPos.x += (dx / dist) * speed;
    pixelPos.y += (dy / dist) * speed;
    return false;
  };

  const pixelToTile = (px: number, py: number): { row: number; col: number } => ({
    row: Math.round(py / TILE_SIZE),
    col: Math.round(px / TILE_SIZE),
  });

  /** Check if a tile is already occupied by another active enemy */
  const isTileOccupiedByEnemy = (row: number, col: number, excludeId: number): boolean => {
    return enemiesRef.current.some(
      (e) => e.active && e.id !== excludeId && e.tilePos.row === row && e.tilePos.col === col
    );
  };

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
      // Wall — just face that direction
      player.direction = dir;
    }
  };

  /**
   * Set a tap direction — the player will keep moving this way.
   */
  const setDirection = useCallback((dir: Direction) => {
    pendingDirectionRef.current = dir;
  }, []);

  /**
   * Main game update loop.
   */
  const update = useCallback(() => {
    const state = gameStateRef.current;
    if (state === "game-over" || state === "idle") return;
    if (state === "paused") return; // Don't update game logic while paused

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
        const freshPlayer = playerRef.current;
        setHudState({ score: scoreRef.current, round: roundRef.current, lives: freshPlayer?.lives ?? PLAYER_START_LIVES });
      }
      renderFrame(
        ctx, gridRef.current, player, enemiesRef.current, shawarmasRef.current,
        particlesRef.current, scoreRef.current, roundRef.current, frame,
        shakeRef.current.x, shakeRef.current.y,
        floatingTextsRef.current
      );
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, CANVAS_HEIGHT / 2 - 40, CANVAS_WIDTH, 80);
      ctx.fillStyle = "#c084fc";
      ctx.font = 'bold 20px "Silkscreen", monospace, system-ui';
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

    // Tap-to-run: if there's a pending direction, try to move that way
    const pendingDir = pendingDirectionRef.current;
    if (pendingDir) {
      startMove(player, pendingDir);
    }

    // Move player
    if (player.moving) {
      const arrived = moveEntity(player.pixelPos, player.targetPixelPos, PLAYER_SPEED);
      // Trail particles while moving
      if (frame % 3 === 0) {
        const trailColor = player.type === "boy" ? "#00ccff" : "#c850ff";
        particlesRef.current.push({
          x: player.pixelPos.x + TILE_SIZE / 2 + (Math.random() - 0.5) * 8,
          y: player.pixelPos.y + TILE_SIZE / 2 + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: 15 + Math.random() * 10,
          maxLife: 25,
          color: trailColor,
          size: 1.5 + Math.random() * 2,
          type: "trail",
        });
      }
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
    const roundAge = frame - roundStartFrameRef.current;
    const graceActive = roundAge < ENEMY_GRACE_FRAMES;

    for (const enemy of enemiesRef.current) {
      if (!enemy.active) continue;

      if (enemy.moving === false) enemy.moving = true;
      const arrived = moveEntity(enemy.pixelPos, enemy.targetPixelPos, enemy.speed);

      if (arrived) {
        enemy.tilePos = pixelToTile(enemy.pixelPos.x, enemy.pixelPos.y);

        // Immediately pick next direction — no waiting for interval
        // This makes CHUB move smoothly without pausing at each tile
        if (!graceActive) {
          // Spread enemies: each targets a different offset from the player
          // This prevents them from all converging on the same tile
          const spreadOffsets = [
            { dr: 0, dc: 0 },
            { dr: -2, dc: 0 },
            { dr: 2, dc: 0 },
            { dr: 0, dc: -2 },
            { dr: 0, dc: 2 },
            { dr: -1, dc: -1 },
            { dr: 1, dc: 1 },
          ];
          const offset = spreadOffsets[enemy.id % spreadOffsets.length];
          const targetRow = player.tilePos.row + offset.dr;
          const targetCol = player.tilePos.col + offset.dc;
          // Clamp target to valid grid bounds
          const clampedRow = Math.max(1, Math.min(targetRow, gridRef.current.length - 2));
          const clampedCol = Math.max(1, Math.min(targetCol, gridRef.current[0].length - 2));
          const dir = findPath(
            gridRef.current,
            enemy.tilePos.row,
            enemy.tilePos.col,
            clampedRow,
            clampedCol
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
              gridRef.current[nr][nc] === 0 &&
              !isTileOccupiedByEnemy(nr, nc, enemy.id)
            ) {
              enemy.targetPixelPos = { x: nc * TILE_SIZE, y: nr * TILE_SIZE };
            } else if (
              nr >= 0 && nr < gridRef.current.length &&
              nc >= 0 && nc < gridRef.current[0].length &&
              gridRef.current[nr][nc] === 0 &&
              isTileOccupiedByEnemy(nr, nc, enemy.id)
            ) {
              // Another CHUB is here — wander randomly to spread out
              const altDirs: Direction[] = ["up", "down", "left", "right"];
              const shuffledAlt = altDirs.sort(() => Math.random() - 0.5);
              let found = false;
              for (const ad of shuffledAlt) {
                let adr = 0, adc = 0;
                if (ad === "up") adr = -1;
                else if (ad === "down") adr = 1;
                else if (ad === "left") adc = -1;
                else adc = 1;
                const anr = enemy.tilePos.row + adr;
                const anc = enemy.tilePos.col + adc;
                if (
                  anr >= 0 && anr < gridRef.current.length &&
                  anc >= 0 && anc < gridRef.current[0].length &&
                  gridRef.current[anr][anc] === 0 &&
                  !isTileOccupiedByEnemy(anr, anc, enemy.id)
                ) {
                  enemy.targetPixelPos = { x: anc * TILE_SIZE, y: anr * TILE_SIZE };
                  found = true;
                  break;
                }
              }
              if (!found) enemy.targetPixelPos = { ...enemy.pixelPos };
            } else {
              // Wall — stay put briefly
              enemy.targetPixelPos = { ...enemy.pixelPos };
            }
          } else {
            enemy.targetPixelPos = { ...enemy.pixelPos };
          }
        } else {
          // Grace period: enemies just wander randomly
          const dirs: Direction[] = ["up", "down", "left", "right"];
          const shuffled = dirs.sort(() => Math.random() - 0.5);
          for (const d of shuffled) {
            let dr = 0, dc = 0;
            if (d === "up") dr = -1;
            else if (d === "down") dr = 1;
            else if (d === "left") dc = -1;
            else dc = 1;
            const nr = enemy.tilePos.row + dr;
            const nc = enemy.tilePos.col + dc;
            if (
              nr >= 0 && nr < gridRef.current.length &&
              nc >= 0 && nc < gridRef.current[0].length &&
              gridRef.current[nr][nc] === 0
            ) {
              enemy.targetPixelPos = { x: nc * TILE_SIZE, y: nr * TILE_SIZE };
              break;
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

        // Combo tracking
        comboRef.current++;
        comboTimerRef.current = 90; // ~1.5s to chain next combo
        const combo = comboRef.current;
        const collectX = s.tilePos.col * TILE_SIZE + TILE_SIZE / 2;
        const collectY = s.tilePos.row * TILE_SIZE + TILE_SIZE / 2;

        particlesRef.current.push(
          ...createCollectParticles(collectX, collectY)
        );

        // Floating combo text
        floatingTextsRef.current.push(
          createCollectText(collectX, collectY - TILE_SIZE * 0.3, combo)
        );

        setHudState((prev) => ({ ...prev, score: scoreRef.current }));
      }
    }

    // Combo timer
    if (comboTimerRef.current > 0) {
      comboTimerRef.current--;
      if (comboTimerRef.current <= 0) {
        comboRef.current = 0;
      }
    }

    // Update floating texts
    floatingTextsRef.current = floatingTextsRef.current
      .map((t) => ({ ...t, y: t.y + t.vy, life: t.life - 1 }))
      .filter((t) => t.life > 0);

    // Round complete
    if (allCollected && shawarmasRef.current.length > 0) {
      scoreRef.current += ROUND_COMPLETE_SCORE;
      gameStateRef.current = "round-transition";
      transitionTimerRef.current = 120;
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
      shakeRef.current.x, shakeRef.current.y,
      floatingTextsRef.current
    );

    if (state === "dying") {
      ctx.fillStyle = "rgba(239,68,68,0.3)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, [canvasRef, initRound, handlePlayerHit]);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    roundRef.current = 1;
    frameRef.current = 0;
    pendingDirectionRef.current = null;
    floatingTextsRef.current = [];
    comboRef.current = 0;
    comboTimerRef.current = 0;
    gameStateRef.current = "playing";
    initRound(1);
    setHudState({ score: 0, round: 1, lives: PLAYER_START_LIVES });
  }, [initRound]);

  /**
   * Set up keyboard + touch input and game loop.
   */
  useEffect(() => {
    // Tap-to-run: keydown sets direction persistently
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Pause/unpause
      if (key === "Escape" || key === "p" || key === "P") {
        e.preventDefault();
        togglePause();
        return;
      }

      // Don't process movement keys while paused
      if (pausedRef.current) return;

      let dir: Direction | null = null;
      if (key === "ArrowUp" || key === "w" || key === "W") dir = "up";
      else if (key === "ArrowDown" || key === "s" || key === "S") dir = "down";
      else if (key === "ArrowLeft" || key === "a" || key === "A") dir = "left";
      else if (key === "ArrowRight" || key === "d" || key === "D") dir = "right";

      if (dir) {
        e.preventDefault();
        pendingDirectionRef.current = dir;
      }
    };

    // Touch controls: tap a quadrant to set direction
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tx = touch.clientX;
      const ty = touch.clientY;

      // Determine direction based on which quadrant of the screen was tapped
      const dx = tx - vw / 2;
      const dy = ty - vh / 2;

      // Use the axis with greater magnitude
      if (Math.abs(dx) > Math.abs(dy)) {
        pendingDirectionRef.current = dx > 0 ? "right" : "left";
      } else {
        pendingDirectionRef.current = dy > 0 ? "down" : "up";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });

    // Game loop
    const loop = () => {
      update();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [update]);

  return {
    startGame,
    setDirection,
    togglePause,
    hudState,
    gameState: gameStateRef.current,
    isPaused,
  };
}
