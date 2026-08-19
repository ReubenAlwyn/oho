// ─── Game Constants ───

export const TILE_SIZE = 32;
export const MAZE_COLS = 21; // Must be odd
export const MAZE_ROWS = 15; // Must be odd
export const CANVAS_WIDTH = MAZE_COLS * TILE_SIZE;
export const CANVAS_HEIGHT = MAZE_ROWS * TILE_SIZE;

// Player
export const PLAYER_SPEED = 3; // pixels per frame
export const PLAYER_START_LIVES = 3;
export const INVINCIBLE_DURATION = 90; // frames (~1.5s at 60fps)
export const SHAWARMA_SCORE = 10;
export const ROUND_COMPLETE_SCORE = 500;

// Enemies
export const BASE_ENEMY_SPEED = 1.5;
export const ENEMY_SPEED_INCREMENT = 0.2;
export const ENEMY_CHASE_INTERVAL = 30; // frames between pathfinding recalculations

// Maze
export const MIN_SHAWARMAS = 8;
export const MAX_SHAWARMAS = 15;

// Colors — Neon arcade palette
export const COLORS = {
  mazeWall: "#111120",
  mazeWallGlow: "#ff6b2b",
  mazePath: "#08081a",
  mazeWallEdge: "#ff6b2b",
  player: "#00ccff",
  playerGlow: "#00eeff",
  enemy: "#ff3366",
  enemyGlow: "#ff5588",
  shawarma: "#ff6b2b",
  shawarmaGlow: "#ff8844",
  text: "#e0e0f0",
  textShadow: "#ff6b2b",
  coral: "#ff3366",
  neonPink: "#ff3366",
  neonBlue: "#00ccff",
  neonGreen: "#00ffaa",
  neonPurple: "#c850ff",
  neonYellow: "#ffdd00",
  neonOrange: "#ff6b2b",
} as const;
