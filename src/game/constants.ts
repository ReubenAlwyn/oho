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

// Colors — OHO Shawarma Panic palette
export const COLORS = {
  mazeWall: "#1a1528",
  mazeWallGlow: "#f97316",
  mazePath: "#0f0f1a",
  mazeWallEdge: "#f97316",
  player: "#0ea5e9",
  playerGlow: "#38bdf8",
  enemy: "#f43f5e",
  enemyGlow: "#fb7185",
  shawarma: "#f97316",
  shawarmaGlow: "#fb923c",
  text: "#ffffff",
  textShadow: "#f97316",
  coral: "#f43f5e",
  neonPink: "#f43f5e",
  neonBlue: "#0ea5e9",
  neonGreen: "#10b981",
  neonPurple: "#a855f7",
} as const;
