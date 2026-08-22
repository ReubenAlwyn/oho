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
import type { Player, Enemy, Shawarma, Particle, FloatingText } from "./types";

let mazeBuffer: OffscreenCanvas | null = null;
let mazeBufferRound = -1;

// ─── Images (loaded dynamically, graceful fallback) ───
let boyImg: HTMLImageElement | null = null;
let girlImg: HTMLImageElement | null = null;
let shawarmaImg: HTMLImageElement | null = null;
let imagesLoaded = false;

function loadImages() {
  if (imagesLoaded) return;
  imagesLoaded = true;

  try {
    const boySrc = new URL("../assets/boy.jpg", import.meta.url).href;
    boyImg = new Image();
    boyImg.src = boySrc;
  } catch { /* boy.jpg not yet added */ }

  try {
    const girlSrc = new URL("../assets/girl.jpg", import.meta.url).href;
    girlImg = new Image();
    girlImg.src = girlSrc;
  } catch { /* girl.jpg not yet added */ }

  try {
    const shawSrc = new URL("../assets/shawarma-pixel.png", import.meta.url).href;
    shawarmaImg = new Image();
    shawarmaImg.src = shawSrc;
  } catch { /* shawarma image not yet added */ }
}

loadImages();

// ─── Scale helper ───

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

  const T = TILE_SIZE;
  const glowW = Math.max(3, T * 0.08);
  const glowW2 = Math.max(5, T * 0.12);

  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (grid[r][c] === 1) {
        const x = c * T;
        const y = r * T;

        // Wall body
        ctx.fillStyle = COLORS.mazeWall;
        ctx.fillRect(x, y, T, T);

        // Subtle brick texture
        ctx.fillStyle = "rgba(200,80,255,0.03)";
        for (let by = 0; by < T; by += T / 4) {
          for (let bx = 0; bx < T; bx += T / 3) {
            const offset = (Math.floor(by / (T / 4)) % 2) * (T / 6);
            ctx.fillRect(x + bx + offset + 1, y + by + 1, T / 3 - 2, T / 4 - 2);
          }
        }

        // Neon edge glow
        const hasTop = r > 0 && grid[r - 1][c] === 0;
        const hasBot = r < MAZE_ROWS - 1 && grid[r + 1][c] === 0;
        const hasLeft = c > 0 && grid[r][c - 1] === 0;
        const hasRight = c < MAZE_COLS - 1 && grid[r][c + 1] === 0;
        const hasEdge = hasTop || hasBot || hasLeft || hasRight;

        if (hasEdge) {
          // Inner glow line
          ctx.fillStyle = COLORS.mazeWallEdge;
          ctx.globalAlpha = 0.6;
          if (hasTop) ctx.fillRect(x, y, T, glowW);
          if (hasBot) ctx.fillRect(x, y + T - glowW, T, glowW);
          if (hasLeft) ctx.fillRect(x, y, glowW, T);
          if (hasRight) ctx.fillRect(x + T - glowW, y, glowW, T);

          // Outer glow spread
          ctx.globalAlpha = 0.15;
          if (hasTop) ctx.fillRect(x - 3, y - 3, T + 6, glowW2 + 3);
          if (hasBot) ctx.fillRect(x - 3, y + T - glowW2, T + 6, glowW2 + 3);
          if (hasLeft) ctx.fillRect(x - 3, y - 3, glowW2 + 3, T + 6);
          if (hasRight) ctx.fillRect(x + T - glowW2, y - 3, glowW2 + 3, T + 6);
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
 * Draw a circular clip of an image.
 */
function drawCircularImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const imgSize = radius * 2;
  ctx.drawImage(img, cx - radius, cy - radius, imgSize, imgSize);

  ctx.restore();

  // Border ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Check if an image element has loaded successfully.
 */
function imgReady(img: HTMLImageElement | null): img is HTMLImageElement {
  return img !== null && img.complete && img.naturalWidth > 0;
}

/**
 * Draw the player character using their photo (with colored circle fallback).
 */
function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  _frame: number
) {
  const T = TILE_SIZE;
  const x = player.pixelPos.x + T / 2;
  const y = player.pixelPos.y + T / 2;

  // Invincibility flash
  if (player.invincible && Math.floor(_frame / 4) % 2 === 0) return;

  const glowColor = player.type === "boy" ? COLORS.player : COLORS.neonPurple;
  const radius = T * 0.45;

  // Glow
  drawGlow(ctx, x, y, T * 0.8, glowColor, 0.5);

  // Character photo or fallback
  const img = player.type === "boy" ? boyImg : girlImg;
  const fallbackColor = player.type === "boy" ? "#00ccff" : "#c850ff";

  if (imgReady(img)) {
    drawCircularImage(ctx, img, x, y, radius);
  } else {
    // Fallback: solid colored circle
    ctx.fillStyle = fallbackColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(x - radius * 0.15, y - radius * 0.2, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    const eyeR = radius * 0.08;
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y - radius * 0.05, eyeR, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.2, y - radius * 0.05, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y - radius * 0.05, eyeR * 0.5, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.2, y - radius * 0.05, eyeR * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Direction arrow
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.85;
  const arrowSize = T * 0.1;
  const armLen = T * 0.44;
  if (player.direction === "up") {
    ctx.beginPath();
    ctx.moveTo(x, y - armLen - T * 0.12);
    ctx.lineTo(x - arrowSize, y - armLen);
    ctx.lineTo(x + arrowSize, y - armLen);
    ctx.fill();
  } else if (player.direction === "down") {
    ctx.beginPath();
    ctx.moveTo(x, y + armLen + T * 0.12);
    ctx.lineTo(x - arrowSize, y + armLen);
    ctx.lineTo(x + arrowSize, y + armLen);
    ctx.fill();
  } else if (player.direction === "left") {
    ctx.beginPath();
    ctx.moveTo(x - armLen - T * 0.12, y);
    ctx.lineTo(x - armLen, y - arrowSize);
    ctx.lineTo(x - armLen, y + arrowSize);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + armLen + T * 0.12, y);
    ctx.lineTo(x + armLen, y - arrowSize);
    ctx.lineTo(x + armLen, y + arrowSize);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw CHUB — the fat guy enemy.
 * Big round body, stubby limbs, angry little eyes, smooth bobbing movement.
 */
const CHUB_SKIN_TONES = ["#e8b89d", "#d4a574", "#c68e5b", "#f0c8a8", "#deb48a"];
const CHUB_ACCENT_COLORS = ["#c850ff", "#00ccff", "#ff3366", "#ffdd00", "#00ffaa"];

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  frame: number
) {
  const T = TILE_SIZE;
  const cx = enemy.pixelPos.x + T / 2;
  const cy = enemy.pixelPos.y + T / 2;
  const skinTone = CHUB_SKIN_TONES[enemy.id % CHUB_SKIN_TONES.length];
  const accentColor = CHUB_ACCENT_COLORS[enemy.id % CHUB_ACCENT_COLORS.length];

  // Smooth bobbing
  const bob = Math.sin(frame * 0.08 + enemy.id * 2) * 3;
  const x = cx;
  const y = cy + bob;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, cy + T * 0.4, T * 0.3, T * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glow
  drawGlow(ctx, x, y, T * 0.7, accentColor, 0.35);

  // Body (big round belly)
  const bodyW = T * 0.42;
  const bodyH = T * 0.48;
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(x, y + T * 0.05, bodyW, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly highlight
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.ellipse(x - bodyW * 0.15, y - bodyH * 0.1, bodyW * 0.5, bodyH * 0.35, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Shirt / accent stripe
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(x, y + T * 0.12, bodyW * 0.85, bodyH * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Stubby arms
  const armSwing = Math.sin(frame * 0.15 + enemy.id) * 0.2;
  // Left arm
  ctx.save();
  ctx.translate(x - bodyW - T * 0.02, y + T * 0.05);
  ctx.rotate(-0.3 + armSwing);
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.roundRect(-T * 0.04, -T * 0.05, T * 0.08, T * 0.18, T * 0.03);
  ctx.fill();
  // Hand
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, T * 0.16, T * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(x + bodyW + T * 0.02, y + T * 0.05);
  ctx.rotate(0.3 - armSwing);
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.roundRect(-T * 0.04, -T * 0.05, T * 0.08, T * 0.18, T * 0.03);
  ctx.fill();
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, T * 0.16, T * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Stubby legs
  const legSwing = Math.sin(frame * 0.15 + enemy.id + Math.PI) * 0.15;
  // Left leg
  ctx.save();
  ctx.translate(x - T * 0.1, y + bodyH - T * 0.02);
  ctx.rotate(legSwing);
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.roundRect(-T * 0.04, 0, T * 0.08, T * 0.15, T * 0.03);
  ctx.fill();
  // Shoe
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.roundRect(-T * 0.05, T * 0.12, T * 0.12, T * 0.06, T * 0.02);
  ctx.fill();
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + T * 0.1, y + bodyH - T * 0.02);
  ctx.rotate(-legSwing);
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.roundRect(-T * 0.04, 0, T * 0.08, T * 0.15, T * 0.03);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.roundRect(-T * 0.07, T * 0.12, T * 0.12, T * 0.06, T * 0.02);
  ctx.fill();
  ctx.restore();

  // Face — head is part of the body ellipse, drawn on top
  const headY = y - T * 0.18;

  // Spiky hair
  ctx.fillStyle = "#2a1a0a";
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI * 0.6 + (i / 4) * Math.PI * 0.3;
    const hx = x + Math.cos(angle) * T * 0.18;
    const hy = headY - T * 0.12 + Math.sin(angle) * T * 0.05;
    ctx.beginPath();
    ctx.moveTo(hx - T * 0.03, hy + T * 0.04);
    ctx.lineTo(hx, hy - T * 0.04);
    ctx.lineTo(hx + T * 0.03, hy + T * 0.04);
    ctx.fill();
  }

  // Angry eyebrows
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  // Left eyebrow
  ctx.beginPath();
  ctx.moveTo(x - T * 0.18, headY - T * 0.04);
  ctx.lineTo(x - T * 0.08, headY - T * 0.07);
  ctx.stroke();

  // Right eyebrow
  ctx.beginPath();
  ctx.moveTo(x + T * 0.08, headY - T * 0.07);
  ctx.lineTo(x + T * 0.18, headY - T * 0.04);
  ctx.stroke();

  // Eyes — track toward player (simplified: always look forward-ish)
  const eyeDir = getEyeDir(enemy);
  const eyeR = T * 0.055;

  // White
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - T * 0.12, headY, eyeR, 0, Math.PI * 2);
  ctx.arc(x + T * 0.12, headY, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(x - T * 0.12 + eyeDir.x * 2, headY + eyeDir.y * 2, eyeR * 0.5, 0, Math.PI * 2);
  ctx.arc(x + T * 0.12 + eyeDir.x * 2, headY + eyeDir.y * 2, eyeR * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = darkenColor(skinTone, 15);
  ctx.beginPath();
  ctx.arc(x, headY + T * 0.04, T * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Grumpy frown
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, headY + T * 0.12, T * 0.08, Math.PI + 0.3, Math.PI * 2 - 0.3);
  ctx.stroke();

}

function getEyeDir(enemy: Enemy): { x: number; y: number } {
  const dir = enemy.direction;
  if (dir === "up") return { x: 0, y: -1 };
  if (dir === "down") return { x: 0, y: 1 };
  if (dir === "left") return { x: -1, y: 0 };
  return { x: 1, y: 0 };
}

function lightenColor(hex: string, pct: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + pct);
  const g = Math.min(255, ((num >> 8) & 0xff) + pct);
  const b = Math.min(255, (num & 0xff) + pct);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex: string, pct: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - pct);
  const g = Math.max(0, ((num >> 8) & 0xff) - pct);
  const b = Math.max(0, (num & 0xff) - pct);
  return `rgb(${r},${g},${b})`;
}

/**
 * Draw a shawarma collectible with animation.
 */
function drawShawarma(
  ctx: CanvasRenderingContext2D,
  s: Shawarma,
  frame: number
) {
  if (s.collected) return;

  const T = TILE_SIZE;
  const cx = s.tilePos.col * T + T / 2;
  const cy = s.tilePos.row * T + T / 2;

  // Bob and tilt animation
  const bob = Math.sin(frame * 0.06 + s.id * 1.5) * 3;
  const tilt = Math.sin(frame * 0.04 + s.id * 2) * 0.12;

  // Glow under pellet
  const glowPulse = 0.25 + Math.sin(frame * 0.08 + s.id) * 0.1;
  drawGlow(ctx, cx, cy + bob, T * 0.5, "#fbbf24", glowPulse);

  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(tilt);

  const pelletW = T * 0.75;
  const pelletH = T * 1.1;

  if (imgReady(shawarmaImg)) {
    // Draw the shawarma image, taller than wide
    ctx.drawImage(shawarmaImg, -pelletW / 2, -pelletH / 2, pelletW, pelletH);
  } else {
    // Fallback: simple golden pill shape
    const bodyGrad = ctx.createLinearGradient(-pelletW / 2, 0, pelletW / 2, 0);
    bodyGrad.addColorStop(0, "#b8860b");
    bodyGrad.addColorStop(0.3, "#daa520");
    bodyGrad.addColorStop(0.6, "#f0c040");
    bodyGrad.addColorStop(1, "#b8860b");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-pelletW / 2, -pelletH / 2, pelletW, pelletH, pelletW * 0.3);
    ctx.fill();
    // Shine
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.roundRect(-pelletW * 0.3, -pelletH * 0.35, pelletW * 0.25, pelletH * 0.6, 3);
    ctx.fill();
  }

  ctx.restore();

  // Sparkle
  const sparklePhase = (frame * 0.05 + s.id) % (Math.PI * 2);
  const sparkleAlpha = Math.max(0, Math.sin(sparklePhase)) * 0.5;
  if (sparkleAlpha > 0.1) {
    ctx.save();
    ctx.globalAlpha = sparkleAlpha;
    ctx.fillStyle = "#fef08a";
    const sparkX = cx + Math.cos(sparklePhase) * T * 0.35;
    const sparkY = cy + bob + Math.sin(sparklePhase * 1.3) * T * 0.2;
    const ss = 3;
    ctx.beginPath();
    ctx.moveTo(sparkX, sparkY - ss * 2);
    ctx.lineTo(sparkX + ss * 0.5, sparkY - ss * 0.5);
    ctx.lineTo(sparkX + ss * 2, sparkY);
    ctx.lineTo(sparkX + ss * 0.5, sparkY + ss * 0.5);
    ctx.lineTo(sparkX, sparkY + ss * 2);
    ctx.lineTo(sparkX - ss * 0.5, sparkY + ss * 0.5);
    ctx.lineTo(sparkX - ss * 2, sparkY);
    ctx.lineTo(sparkX - ss * 0.5, sparkY - ss * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Draw particles.
 */
function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = Math.min(1, p.life / (p.maxLife * 0.4));
    ctx.save();
    ctx.globalAlpha = alpha;

    if (p.type === "spark") {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    } else if (p.type === "glow") {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      grad.addColorStop(0, p.color + "cc");
      grad.addColorStop(1, p.color + "00");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // trail
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Draw the HUD — score, round, lives, remaining shawarmas.
 */
function drawHUD(
  ctx: CanvasRenderingContext2D,
  score: number,
  round: number,
  lives: number,
  remaining: number
) {
  const T = TILE_SIZE;
  const barH = T * 1.1;
  const fontLabel = `bold ${Math.floor(T * 0.26)}px "Silkscreen", monospace, system-ui`;
  const fontValue = `bold ${Math.floor(T * 0.46)}px "Silkscreen", monospace, system-ui`;

  // HUD background bar — solid
  ctx.fillStyle = "#06060e";
  ctx.fillRect(0, 0, CANVAS_WIDTH, barH);
  // Bottom accent line
  ctx.fillStyle = "#c850ff";
  ctx.fillRect(0, barH - 3, CANVAS_WIDTH, 3);

  const cy = barH * 0.5;
  const labelY = cy - T * 0.18;
  const valueY = cy + T * 0.2;

  // ── Round (left) ──
  const roundX = T * 1;
  ctx.textAlign = "left";
  ctx.font = fontLabel;
  ctx.fillStyle = "#6a6a8a";
  ctx.fillText("ROUND", roundX, labelY);
  ctx.font = fontValue;
  ctx.shadowColor = "#c850ff";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "#c850ff";
  ctx.fillText(String(round), roundX, valueY);
  ctx.shadowBlur = 0;

  // ── Lives (3 hearts) ──
  const livesX = T * 4;
  ctx.font = fontLabel;
  ctx.fillStyle = "#6a6a8a";
  ctx.fillText("LIVES", livesX, labelY);
  // Draw 3 pixel hearts (matching PLAYER_START_LIVES)
  // 7x6 pixel grid pattern
  const heartGrid = [
    [0,1,0,0,0,1,0],
    [1,1,1,0,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ];
  const pixSize = Math.floor(T * 0.09);
  const gridW = heartGrid[0].length * pixSize;
  const gridH = heartGrid.length * pixSize;
  for (let i = 0; i < 3; i++) {
    const hx = livesX + i * (gridW + T * 0.2);
    const hy = cy - gridH * 0.5;
    const filled = i < lives;
    ctx.save();
    if (filled) {
      ctx.shadowColor = "#ff3366";
      ctx.shadowBlur = 10;
    }
    for (let row = 0; row < heartGrid.length; row++) {
      for (let col = 0; col < heartGrid[row].length; col++) {
        if (heartGrid[row][col]) {
          ctx.fillStyle = filled ? "#ff3366" : "#2a2a40";
          ctx.fillRect(hx + col * pixSize, hy + row * pixSize, pixSize, pixSize);
        }
      }
    }
    // Pixel shine on filled hearts
    if (filled) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,180,200,0.5)";
      ctx.fillRect(hx + 1 * pixSize, hy + 1 * pixSize, pixSize, pixSize);
    }
    ctx.restore();
  }

  // ── Score (center) ──
  const scoreX = CANVAS_WIDTH / 2;
  ctx.textAlign = "center";
  ctx.font = fontLabel;
  ctx.fillStyle = "#6a6a8a";
  ctx.fillText("SCORE", scoreX, labelY);
  ctx.font = `bold ${Math.floor(T * 0.55)}px "Silkscreen", monospace, system-ui`;
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#ffdd00";
  ctx.fillText(score.toLocaleString(), scoreX, valueY + T * 0.03);
  ctx.shadowBlur = 0;

  // ── Remaining shawarmas (right) ──
  const shawX = CANVAS_WIDTH - T * 1;
  ctx.textAlign = "right";
  ctx.font = fontLabel;
  ctx.fillStyle = "#6a6a8a";
  ctx.fillText("SHAWARMAS", shawX, labelY);
  ctx.font = fontValue;
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "#00ccff";
  ctx.fillText(String(remaining), shawX, valueY);
  ctx.shadowBlur = 0;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

/**
 * Main render function — draws everything in order.
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
  shakeY: number,
  floatingTexts?: FloatingText[]
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

  // Draw floating texts (combo, collection messages)
  if (floatingTexts) {
    for (const ft of floatingTexts) {
      const alpha = Math.min(1, ft.life / (ft.maxLife * 0.3));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${ft.fontSize}px "Silkscreen", monospace, system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Shadow glow
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

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
