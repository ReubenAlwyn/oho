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

// ─── Character images (loaded dynamically, graceful fallback) ───
let boyImg: HTMLImageElement | null = null;
let girlImg: HTMLImageElement | null = null;
let imagesLoaded = false;

function loadCharacterImages() {
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
}

loadCharacterImages();

// ─── Scale helper (keep tile-based math, draw at 1× TILE_SIZE) ───

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
    // Fallback: solid colored circle with inner detail
    ctx.fillStyle = fallbackColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(x - radius * 0.15, y - radius * 0.2, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
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

  // Direction indicator (bigger arrow)
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.85;
  const arrowSize = T * 0.1;
  const armLen = T * 0.42;
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
function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  frame: number
) {
  const T = TILE_SIZE;
  const x = enemy.pixelPos.x + T / 2;
  const y = enemy.pixelPos.y + T / 2;

  // Pulsing glow
  const pulse = Math.sin(frame * 0.08 + enemy.id) * 0.15 + 0.5;
  drawGlow(ctx, x, y, T * 0.9, COLORS.enemyGlow, pulse);

  // CHUB color variants
  const chubColors = ["#c850ff", "#a040e0", "#9030d0", "#d060ff", "#8020c0"];
  const skinColors = ["#e8b89d", "#d4a58a", "#c9977d", "#f0c4a8", "#dbb098"];
  const color = chubColors[enemy.type % chubColors.length];
  const skin = skinColors[enemy.type % skinColors.length];

  // Smooth bobbing (not jerky — uses sin with slow frequency)
  const bob = Math.sin(frame * 0.06 + enemy.id * 1.7) * T * 0.03;
  const squash = 1 + Math.sin(frame * 0.12 + enemy.id) * 0.03;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(1, squash);

  const bodyR = T * 0.36; // big round body radius
  const headR = T * 0.22; // head radius

  // ── Stubby legs ──
  const legY = bodyR * 0.75;
  const legW = T * 0.08;
  const legH = T * 0.12;
  // Animate leg waddle
  const legAngle = Math.sin(frame * 0.15 + enemy.id * 2) * 0.25;
  // Left leg
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(-bodyR * 0.35, legY);
  ctx.rotate(-legAngle);
  ctx.beginPath();
  ctx.roundRect(-legW / 2, 0, legW, legH, legW * 0.3);
  ctx.fill();
  // Shoe
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(0, legH, legW * 0.7, legW * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Right leg
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(bodyR * 0.35, legY);
  ctx.rotate(legAngle);
  ctx.beginPath();
  ctx.roundRect(-legW / 2, 0, legW, legH, legW * 0.3);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(0, legH, legW * 0.7, legW * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Stubby arms ──
  const armLen = T * 0.1;
  const armW = T * 0.07;
  const armY = -bodyR * 0.1;
  const armSwing = Math.sin(frame * 0.15 + enemy.id * 2 + Math.PI) * 0.3;
  // Left arm
  ctx.save();
  ctx.translate(-bodyR - armW * 0.5, armY);
  ctx.rotate(-0.4 + armSwing);
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.roundRect(-armW / 2, -armLen / 2, armW, armLen, armW * 0.4);
  ctx.fill();
  // Fist
  ctx.beginPath();
  ctx.arc(0, armLen * 0.5, armW * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Right arm
  ctx.save();
  ctx.translate(bodyR + armW * 0.5, armY);
  ctx.rotate(0.4 - armSwing);
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.roundRect(-armW / 2, -armLen / 2, armW, armLen, armW * 0.4);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, armLen * 0.5, armW * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Big round body ──
  const bodyGrad = ctx.createRadialGradient(
    -bodyR * 0.2, -bodyR * 0.2, bodyR * 0.1,
    0, 0, bodyR
  );
  bodyGrad.addColorStop(0, lightenColor(skin, 20));
  bodyGrad.addColorStop(0.7, skin);
  bodyGrad.addColorStop(1, darkenColor(skin, 20));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyR, bodyR * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body outline
  ctx.strokeStyle = darkenColor(skin, 40);
  ctx.lineWidth = Math.max(1, T * 0.015);
  ctx.stroke();

  // Belly highlight
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.ellipse(-bodyR * 0.15, -bodyR * 0.15, bodyR * 0.45, bodyR * 0.35, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // ── Head (on top of body) ──
  const headY = -bodyR - headR * 0.5;
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = darkenColor(skin, 40);
  ctx.stroke();

  // ── Hair (spiky top) ──
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.ellipse(0, headY - headR * 0.65, headR * 0.85, headR * 0.35, 0, Math.PI, 0);
  ctx.fill();
  // Spikes
  const spikeCount = 5;
  for (let i = 0; i < spikeCount; i++) {
    const angle = Math.PI + (Math.PI * (i + 0.5)) / spikeCount;
    const sx = Math.cos(angle) * headR * 0.9;
    const sy = Math.sin(angle) * headR * 0.9 + headY;
    const spikeH = T * 0.04 + Math.sin(i * 2.1) * T * 0.015;
    ctx.beginPath();
    ctx.moveTo(sx - T * 0.02, sy);
    ctx.lineTo(sx, sy - spikeH);
    ctx.lineTo(sx + T * 0.02, sy);
    ctx.fill();
  }

  // ── Eyes (angry, looking at player) ──
  const eyeSpacing = headR * 0.4;
  const eyeY = headY + headR * 0.05;
  const eyeW = T * 0.045;
  const eyeH = T * 0.055;
  const pupilOff = getEyeDir(enemy);

  // Eye whites
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(-eyeSpacing - eyeW / 2, eyeY - eyeH / 2, eyeW, eyeH, eyeW * 0.3);
  ctx.roundRect(eyeSpacing - eyeW / 2, eyeY - eyeH / 2, eyeW, eyeH, eyeW * 0.3);
  ctx.fill();

  // Angry eyebrow angle
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = Math.max(1.5, T * 0.02);
  // Left brow (angled down toward center)
  ctx.beginPath();
  ctx.moveTo(-eyeSpacing - eyeW * 0.7, eyeY - eyeH * 0.9);
  ctx.lineTo(-eyeSpacing + eyeW * 0.5, eyeY - eyeH * 1.1);
  ctx.stroke();
  // Right brow
  ctx.beginPath();
  ctx.moveTo(eyeSpacing + eyeW * 0.7, eyeY - eyeH * 0.9);
  ctx.lineTo(eyeSpacing - eyeW * 0.5, eyeY - eyeH * 1.1);
  ctx.stroke();

  // Pupils (follow player)
  ctx.fillStyle = color;
  const pupilR = eyeW * 0.35;
  ctx.beginPath();
  ctx.arc(-eyeSpacing + pupilOff.x, eyeY + pupilOff.y, pupilR, 0, Math.PI * 2);
  ctx.arc(eyeSpacing + pupilOff.x, eyeY + pupilOff.y, pupilR, 0, Math.PI * 2);
  ctx.fill();

  // ── Nose ──
  ctx.fillStyle = darkenColor(skin, 15);
  ctx.beginPath();
  ctx.arc(0, headY + headR * 0.2, headR * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // ── Mouth (grumpy frown) ──
  ctx.strokeStyle = darkenColor(skin, 45);
  ctx.lineWidth = Math.max(1.5, T * 0.018);
  ctx.beginPath();
  ctx.arc(0, headY + headR * 0.5, headR * 0.2, 0.1, Math.PI - 0.1);
  ctx.stroke();

  ctx.restore();
}

/** Get pupil offset toward the player for CHUB's eyes. */
function getEyeDir(enemy: Enemy): { x: number; y: number } {
  const dx = (enemy.targetPixelPos?.x ?? 0) - enemy.pixelPos.x;
  const dy = (enemy.targetPixelPos?.y ?? 0) - enemy.pixelPos.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: (dx / len) * 1.5, y: (dy / len) * 1.5 };
}

/** Lighten a hex color by a percentage. */
function lightenColor(hex: string, pct: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((num >> 16) & 255) + pct);
  const g = Math.min(255, ((num >> 8) & 255) + pct);
  const b = Math.min(255, (num & 255) + pct);
  return `rgb(${r},${g},${b})`;
}

/** Darken a hex color by a percentage. */
function darkenColor(hex: string, pct: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((num >> 16) & 255) - pct);
  const g = Math.max(0, ((num >> 8) & 255) - pct);
  const b = Math.max(0, (num & 255) - pct);
  return `rgb(${r},${g},${b})`;
}

/**
 * Draw a shawarma pellet — a proper wrap shape with visible fillings.
 */
function drawShawarma(
  ctx: CanvasRenderingContext2D,
  shawarma: Shawarma,
  frame: number
) {
  if (shawarma.collected) return;

  const T = TILE_SIZE;
  const x = shawarma.tilePos.col * T + T / 2;
  const y = shawarma.tilePos.row * T + T / 2;
  const bob = Math.sin(frame * 0.06 + shawarma.id * 0.7) * T * 0.05;
  const tilt = Math.sin(frame * 0.04 + shawarma.id) * 0.1;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(tilt);

  // Glow underneath
  drawGlow(ctx, 0, 0, T * 0.45, COLORS.shawarmaGlow, 0.35);

  const w = T * 0.22; // half-width of wrap
  const h = T * 0.35; // half-height of wrap

  // ── Skewer line (vertical stick through center) ──
  ctx.strokeStyle = "#8B7355";
  ctx.lineWidth = Math.max(2, T * 0.03);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -h - T * 0.08);
  ctx.lineTo(0, h + T * 0.1);
  ctx.stroke();

  // ── Wrap body (rounded rectangle) ──
  const wrapTop = -h;
  const wrapBot = h;
  const wrapH = wrapBot - wrapTop;
  const cornerR = w * 0.4;

  // Main golden wrap
  const wrapGrad = ctx.createLinearGradient(-w, 0, w, 0);
  wrapGrad.addColorStop(0, "#e8a832");
  wrapGrad.addColorStop(0.3, "#f5c842");
  wrapGrad.addColorStop(0.5, "#ffd84a");
  wrapGrad.addColorStop(0.7, "#f5c842");
  wrapGrad.addColorStop(1, "#d49828");

  ctx.fillStyle = wrapGrad;
  ctx.beginPath();
  ctx.roundRect(-w, wrapTop, w * 2, wrapH, cornerR);
  ctx.fill();

  // Wrap outline
  ctx.strokeStyle = "#a07820";
  ctx.lineWidth = Math.max(1, T * 0.015);
  ctx.stroke();

  // ── Wrap fold creases (diagonal lines) ──
  ctx.strokeStyle = "rgba(160,120,32,0.3)";
  ctx.lineWidth = Math.max(1, T * 0.012);
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.7, wrapTop + wrapH * 0.2 * (i > 0 ? 1 : 0.6));
    ctx.lineTo(w * 0.7, wrapTop + wrapH * (i > 0 ? 0.8 : 0.4));
    ctx.stroke();
  }

  // ── Toasted spots ──
  ctx.fillStyle = "rgba(180,110,20,0.15)";
  const spots = [
    [-w * 0.4, -h * 0.2, w * 0.15, h * 0.08],
    [w * 0.2, h * 0.1, w * 0.12, h * 0.06],
    [-w * 0.1, h * 0.3, w * 0.1, h * 0.05],
  ];
  for (const [sx, sy, sw, sh] of spots) {
    ctx.beginPath();
    ctx.ellipse(sx, sy, sw, sh, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Shine highlight on left side ──
  ctx.fillStyle = "rgba(255,255,220,0.25)";
  ctx.beginPath();
  ctx.ellipse(-w * 0.4, -h * 0.3, w * 0.15, h * 0.35, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // ── Fillings peeking from the top ──
  const fillY = wrapTop + 2;

  // Lettuce (green, wavy)
  ctx.fillStyle = "#3cb043";
  ctx.beginPath();
  for (let lx = -w * 0.7; lx <= w * 0.7; lx += T * 0.04) {
    const ly = fillY - T * 0.04 + Math.sin(lx * 0.3) * T * 0.03;
    if (lx === -w * 0.7) ctx.moveTo(lx, ly + T * 0.05);
    else ctx.lineTo(lx, ly);
  }
  ctx.lineTo(w * 0.7, fillY + T * 0.05);
  ctx.lineTo(-w * 0.7, fillY + T * 0.05);
  ctx.closePath();
  ctx.fill();

  // Tomato (red chunks)
  ctx.fillStyle = "#e63946";
  const tomatoChunks = [-w * 0.3, w * 0.1, w * 0.35];
  for (const tx of tomatoChunks) {
    ctx.beginPath();
    ctx.ellipse(tx, fillY - T * 0.02, T * 0.03, T * 0.025, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sauce drip (white/cream)
  ctx.fillStyle = "rgba(255,248,230,0.7)";
  ctx.beginPath();
  ctx.ellipse(-w * 0.1, fillY + T * 0.01, T * 0.025, T * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Sparkle effect ──
  const sparkle = Math.sin(frame * 0.1 + shawarma.id) * 0.5 + 0.5;
  ctx.fillStyle = "#fff8a0";
  ctx.globalAlpha = sparkle * 0.8;
  const sparkSize = T * 0.03 + sparkle * T * 0.02;
  ctx.fillRect(w + T * 0.05, -h * 0.5, sparkSize, sparkSize);
  ctx.fillRect(-w - T * 0.08, h * 0.3, sparkSize * 0.8, sparkSize * 0.8);
  ctx.globalAlpha = 1;

  ctx.restore();
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
 * Draw the HUD overlay — scaled for the higher resolution canvas.
 */
function drawHUD(
  ctx: CanvasRenderingContext2D,
  score: number,
  round: number,
  lives: number,
  remainingShawarmas: number
) {
  ctx.save();
  const T = TILE_SIZE;
  const barH = T * 0.9;
  const bottomBarH = T * 0.7;
  const fontSize = Math.round(T * 0.42);
  const smallFontSize = Math.round(T * 0.32);

  // Top bar background
  ctx.fillStyle = "rgba(6,6,14,0.85)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, barH);
  // Bottom bar background
  ctx.fillStyle = "rgba(6,6,14,0.85)";
  ctx.fillRect(0, CANVAS_HEIGHT - bottomBarH, CANVAS_WIDTH, bottomBarH);

  // Top divider line
  ctx.fillStyle = "rgba(200,80,255,0.3)";
  ctx.fillRect(0, barH - 1, CANVAS_WIDTH, 1);
  // Bottom divider line
  ctx.fillStyle = "rgba(200,80,255,0.3)";
  ctx.fillRect(0, CANVAS_HEIGHT - bottomBarH, CANVAS_WIDTH, 1);

  ctx.font = `bold ${fontSize}px "Silkscreen", monospace, system-ui`;
  ctx.textBaseline = "middle";

  // Score (left)
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.neonGreen;
  ctx.shadowColor = COLORS.neonGreen;
  ctx.shadowBlur = 6;
  ctx.fillText(`⭐ ${score}`, T * 0.4, barH / 2);
  ctx.shadowBlur = 0;

  // Round (center)
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.neonPurple;
  ctx.shadowColor = COLORS.neonPurple;
  ctx.shadowBlur = 6;
  ctx.fillText(`Round ${round}`, CANVAS_WIDTH / 2, barH / 2);
  ctx.shadowBlur = 0;

  // Lives (right)
  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.neonPink;
  ctx.shadowColor = COLORS.neonPink;
  ctx.shadowBlur = 6;
  ctx.fillText(`❤️ × ${lives}`, CANVAS_WIDTH - T * 0.4, barH / 2);
  ctx.shadowBlur = 0;

  // Bottom bar — shawarmas remaining
  ctx.textAlign = "center";
  ctx.font = `${smallFontSize}px "Silkscreen", monospace, system-ui`;
  ctx.fillStyle = COLORS.shawarma;
  ctx.shadowColor = COLORS.shawarma;
  ctx.shadowBlur = 4;
  ctx.fillText(`🌮 ${remainingShawarmas} shawarmas left`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - bottomBarH / 2);
  ctx.shadowBlur = 0;

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
