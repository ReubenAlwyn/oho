// ─── Canvas Renderer ───
// Draws the maze, player, enemies, shawarmas, and effects on an HTML5 Canvas.

import {
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAZE_COLS,
  MAZE_ROWS,
  COLORS,
} from "./constants";
import type { MazeGrid } from "./maze";
import type { Player, Enemy, Shawarma, Particle } from "./types";

let mazeBuffer: OffscreenCanvas | null = null;
let mazeBufferRound = -1;

/**
 * Pre-render maze walls to an offscreen canvas for performance.
 */
function getMazeBuffer(grid: MazeGrid, round: number): OffscreenCanvas {
  if (mazeBuffer && mazeBufferRound === round) return mazeBuffer;
  mazeBuffer = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  mazeBufferRound = round;
  const ctx = mazeBuffer.getContext("2d")!;
  drawMazeToBuffer(ctx, grid);
  return mazeBuffer;
}

function drawMazeToBuffer(ctx: OffscreenCanvasRenderingContext2D, grid: MazeGrid) {
  ctx.fillStyle = COLORS.mazePath;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw walls
  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (grid[r][c] === 1) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        // Wall body
        ctx.fillStyle = COLORS.mazeWall;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Neon edge glow — brighter for arcade feel
        const hasTop = r > 0 && grid[r - 1][c] === 0;
        const hasBot = r < MAZE_ROWS - 1 && grid[r + 1][c] === 0;
        const hasLeft = c > 0 && grid[r][c - 1] === 0;
        const hasRight = c < MAZE_COLS - 1 && grid[r][c + 1] === 0;
        const hasEdge = hasTop || hasBot || hasLeft || hasRight;

        if (hasEdge) {
          // Inner glow
          ctx.fillStyle = COLORS.mazeWallEdge;
          ctx.globalAlpha = 0.5;
          if (hasTop) ctx.fillRect(x, y, TILE_SIZE, 3);
          if (hasBot) ctx.fillRect(x, y + TILE_SIZE - 3, TILE_SIZE, 3);
          if (hasLeft) ctx.fillRect(x, y, 3, TILE_SIZE);
          if (hasRight) ctx.fillRect(x + TILE_SIZE - 3, y, 3, TILE_SIZE);

          // Outer glow (wider, more transparent)
          ctx.globalAlpha = 0.12;
          if (hasTop) ctx.fillRect(x - 2, y - 2, TILE_SIZE + 4, 5);
          if (hasBot) ctx.fillRect(x - 2, y + TILE_SIZE - 3, TILE_SIZE + 4, 5);
          if (hasLeft) ctx.fillRect(x - 2, y - 2, 5, TILE_SIZE + 4);
          if (hasRight) ctx.fillRect(x + TILE_SIZE - 3, y - 2, 5, TILE_SIZE + 4);
        }
        ctx.globalAlpha = 1;
      }
    }
  }
}

/**
 * Draw a glowing circle for entities.
 */
function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number = 0.6
) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
  gradient.addColorStop(0, color + "cc");
  gradient.addColorStop(0.5, color + "44");
  gradient.addColorStop(1, color + "00");
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * Draw the player character.
 */
function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  frame: number
) {
  const x = player.pixelPos.x + TILE_SIZE / 2;
  const y = player.pixelPos.y + TILE_SIZE / 2;

  // Invincibility flash
  if (player.invincible && Math.floor(frame / 4) % 2 === 0) return;

  // Glow
  drawGlow(ctx, x, y, TILE_SIZE * 0.8, player.type === "boy" ? COLORS.player : COLORS.coral, 0.4);

  // Body
  const bodyColor = player.type === "boy" ? "#0ea5e9" : "#f43f5e";
  const size = TILE_SIZE * 0.4;

  // Simple pixel character
  ctx.fillStyle = bodyColor;

  // Head
  ctx.beginPath();
  ctx.arc(x, y - 3, size * 0.65, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillRect(x - size * 0.4, y + 1, size * 0.8, size * 0.7);

  // Eyes
  ctx.fillStyle = "#fff";
  const eyeOffsetX = player.direction === "left" ? -3 : player.direction === "right" ? 3 : 0;
  const eyeOffsetY = player.direction === "up" ? -2 : 0;
  ctx.fillRect(x - 3 + eyeOffsetX, y - 5 + eyeOffsetY, 2, 2);
  ctx.fillRect(x + 1 + eyeOffsetX, y - 5 + eyeOffsetY, 2, 2);

  // Direction indicator (small arrow)
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.6;
  const arrowSize = 3;
  if (player.direction === "up") {
    ctx.beginPath();
    ctx.moveTo(x, y - size - 4);
    ctx.lineTo(x - arrowSize, y - size);
    ctx.lineTo(x + arrowSize, y - size);
    ctx.fill();
  } else if (player.direction === "down") {
    ctx.beginPath();
    ctx.moveTo(x, y + size + 4);
    ctx.lineTo(x - arrowSize, y + size);
    ctx.lineTo(x + arrowSize, y + size);
    ctx.fill();
  } else if (player.direction === "left") {
    ctx.beginPath();
    ctx.moveTo(x - size - 4, y);
    ctx.lineTo(x - size, y - arrowSize);
    ctx.lineTo(x - size, y + arrowSize);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + size + 4, y);
    ctx.lineTo(x + size, y - arrowSize);
    ctx.lineTo(x + size, y + arrowSize);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw an enemy.
 */
function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  frame: number
) {
  const x = enemy.pixelPos.x + TILE_SIZE / 2;
  const y = enemy.pixelPos.y + TILE_SIZE / 2;

  // Pulsing glow
  const pulse = Math.sin(frame * 0.08 + enemy.id) * 0.15 + 0.5;
  drawGlow(ctx, x, y, TILE_SIZE * 0.9, COLORS.enemyGlow, pulse);

  // Body colors cycle per enemy type
  const enemyColors = ["#f43f5e", "#f97316", "#e879f9", "#a855f7", "#10b981"];
  const color = enemyColors[enemy.type % enemyColors.length];

  const size = TILE_SIZE * 0.4;

  // Ghost-like enemy body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - 2, size * 0.7, Math.PI, 0);
  // Wavy bottom
  const wave = Math.sin(frame * 0.15 + enemy.id) * 2;
  ctx.lineTo(x + size * 0.7, y + size * 0.5 + wave);
  ctx.quadraticCurveTo(x + size * 0.35, y + size * 0.3, x, y + size * 0.5 - wave);
  ctx.quadraticCurveTo(x - size * 0.35, y + size * 0.7 + wave, x - size * 0.7, y + size * 0.5 - wave);
  ctx.closePath();
  ctx.fill();

  // Angry eyes
  ctx.fillStyle = "#fff";
  ctx.fillRect(x - 4, y - 5, 3, 3);
  ctx.fillRect(x + 1, y - 5, 3, 3);
  ctx.fillStyle = color;
  ctx.fillRect(x - 3, y - 4, 2, 2);
  ctx.fillRect(x + 2, y - 4, 2, 2);
}

/**
 * Draw a shawarma.
 */
function drawShawarma(
  ctx: CanvasRenderingContext2D,
  shawarma: Shawarma,
  frame: number
) {
  if (shawarma.collected) return;

  const x = shawarma.tilePos.col * TILE_SIZE + TILE_SIZE / 2;
  const y = shawarma.tilePos.row * TILE_SIZE + TILE_SIZE / 2;
  const bob = Math.sin(frame * 0.08 + shawarma.id * 0.5) * 3;

  // Glow
  drawGlow(ctx, x, y + bob, TILE_SIZE * 0.5, COLORS.shawarmaGlow, 0.4);

  // Shawarma body (wrap shape)
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.ellipse(x, y + bob, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wrap lines
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 5, y + bob - 2);
  ctx.lineTo(x + 5, y + bob - 2);
  ctx.moveTo(x - 4, y + bob + 2);
  ctx.lineTo(x + 4, y + bob + 2);
  ctx.stroke();

  // Filling peek
  ctx.fillStyle = "#16a34a";
  ctx.beginPath();
  ctx.arc(x, y + bob - 5, 3, 0, Math.PI);
  ctx.fill();

  // Sparkle effect
  const sparkle = Math.sin(frame * 0.12 + shawarma.id) * 0.5 + 0.5;
  ctx.fillStyle = "#fef08a";
  ctx.globalAlpha = sparkle * 0.7;
  const sparkSize = 2 + sparkle * 2;
  ctx.fillRect(x + 6, y + bob - 6, sparkSize, sparkSize);
  ctx.fillRect(x - 7, y + bob + 3, sparkSize - 0.5, sparkSize - 0.5);
  ctx.globalAlpha = 1;
}

/**
 * Draw particles.
 */
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;

    if (p.type === "glow") {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, p.color + "00");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw the HUD overlay.
 */
function drawHUD(
  ctx: CanvasRenderingContext2D,
  score: number,
  round: number,
  lives: number,
  remainingShawarmas: number
) {
  ctx.save();

  // HUD background
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, 32);
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, CANVAS_HEIGHT - 28, CANVAS_WIDTH, 28);

  ctx.font = 'bold 13px "Silkscreen", monospace, system-ui';

  // Top bar
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.neonGreen;
  ctx.fillText(`⭐ ${score}`, 10, 21);

  ctx.fillStyle = COLORS.neonPurple;
  ctx.fillText(`Round ${round}`, CANVAS_WIDTH / 2 - 40, 21);

  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.neonPink;
  ctx.fillText(`❤️ × ${lives}`, CANVAS_WIDTH - 10, 21);

  // Bottom bar
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.shawarma;
  ctx.font = '11px "Silkscreen", monospace, system-ui';
  ctx.fillText(`🌮 ${remainingShawarmas} shawarmas left`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 12);

  ctx.restore();
}

/**
 * Main render function - draws one complete frame.
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  grid: MazeGrid,
  player: Player,
  enemies: Enemy[],
  shawarmas: Shawarma[],
  particles: Particle[],
  score: number,
  round: number,
  frame: number,
  shakeX: number,
  shakeY: number
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // Draw pre-rendered maze
  const buffer = getMazeBuffer(grid, round);
  ctx.drawImage(buffer, 0, 0);

  // Draw shawarmas
  for (const s of shawarmas) {
    drawShawarma(ctx, s, frame);
  }

  // Draw enemies
  for (const e of enemies) {
    if (e.active) drawEnemy(ctx, e, frame);
  }

  // Draw player
  drawPlayer(ctx, player, frame);

  // Draw particles
  drawParticles(ctx, particles);

  ctx.restore();

  // HUD (no shake)
  const remaining = shawarmas.filter((s) => !s.collected).length;
  drawHUD(ctx, score, round, player.lives, remaining);
}

/**
 * Reset the maze buffer cache (call on new round).
 */
export function resetMazeBuffer() {
  mazeBuffer = null;
  mazeBufferRound = -1;
}
