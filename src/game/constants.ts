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

// Colors
export const COLORS = {
  mazeWall: "#1a1a2e",
  mazeWallGlow: "#4a1a7a",
  mazePath: "#0a0a15",
  mazeWallEdge: "#6b21a8",
  player: "#22d3ee",
  playerGlow: "#06b6d4",
  enemy: "#ef4444",
  enemyGlow: "#dc2626",
  shawarma: "#f59e0b",
  shawarmaGlow: "#d97706",
  text: "#f8fafc",
  textShadow: "#a855f7",
  neonPink: "#ec4899",
  neonBlue: "#3b82f6",
  neonGreen: "#10b981",
  neonPurple: "#8b5cf6",
} as const;
