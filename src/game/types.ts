// ─── Game Types ───

export type Direction = "up" | "down" | "left" | "right";
export type CharacterType = "boy" | "girl";

export interface Position {
  x: number;
  y: number;
}

export interface TilePosition {
  row: number;
  col: number;
}

export interface Player {
  type: CharacterType;
  tilePos: TilePosition;
  pixelPos: Position;
  targetPixelPos: Position;
  direction: Direction;
  moving: boolean;
  lives: number;
  invincible: boolean;
  invincibleTimer: number;
}

export interface Enemy {
  id: number;
  type: number;
  tilePos: TilePosition;
  pixelPos: Position;
  targetPixelPos: Position;
  direction: Direction;
  speed: number;
  active: boolean;
  moving: boolean;
}

export interface Shawarma {
  id: number;
  tilePos: TilePosition;
  collected: boolean;
  animTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: "spark" | "glow" | "trail";
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  fontSize: number;
  vy: number;
}

export interface ScoreEntry {
  id: string;
  playerName: string;
  score: number;
  highestRound: number;
  character: CharacterType;
  date: string;
}

export type GameScreenName =
  | "menu"
  | "character-select"
  | "game"
  | "game-over"
  | "leaderboard";

export type GameState = "idle" | "playing" | "paused" | "dying" | "round-transition" | "game-over";
