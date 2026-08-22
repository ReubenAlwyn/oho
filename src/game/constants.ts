// ─── Game Constants ───

export const TILE_SIZE = 64; // Doubled for higher quality rendering
export const MAZE_COLS = 21; // Must be odd
export const MAZE_ROWS = 15; // Must be odd
export const CANVAS_WIDTH = MAZE_COLS * TILE_SIZE;
export const CANVAS_HEIGHT = MAZE_ROWS * TILE_SIZE;

// Player
export const PLAYER_SPEED = 7; // pixels per frame (zippy)
export const PLAYER_START_LIVES = 3;
export const INVINCIBLE_DURATION = 90; // frames (~1.5s at 60fps)
export const SHAWARMA_SCORE = 10;
export const ROUND_COMPLETE_SCORE = 500;

// Enemies
export const BASE_ENEMY_SPEED = 3.0;
export const ENEMY_SPEED_INCREMENT = 0.35;
export const ENEMY_CHASE_INTERVAL = 20; // frames between pathfinding recalculations

// Maze
export const MIN_SHAWARMAS = 8;
export const MAX_SHAWARMAS = 15;

// Colors — Neon arcade palette (purple / cyan / yellow)
export const COLORS = {
  mazeWall: "#111120",
  mazeWallGlow: "#c850ff",
  mazePath: "#08081a",
  mazeWallEdge: "#c850ff",
  player: "#00ccff",
  playerGlow: "#00eeff",
  enemy: "#c850ff",
  enemyGlow: "#d070ff",
  shawarma: "#ffdd00",
  shawarmaGlow: "#ffee44",
  text: "#e0e0f0",
  textShadow: "#c850ff",
  neonPink: "#c850ff",
  neonBlue: "#00ccff",
  neonGreen: "#00ffaa",
  neonPurple: "#c850ff",
  neonYellow: "#ffdd00",
  neonOrange: "#c850ff",
} as const;
