// ─── Maze Generator ───
// Uses recursive backtracker (DFS) to generate a perfect maze,
// then removes some walls to create loops for more interesting gameplay.

import { MAZE_COLS, MAZE_ROWS } from "./constants";

export type MazeGrid = number[][]; // 0 = path, 1 = wall

/**
 * Generate a maze grid.
 * Returns a 2D array where 0 = open path, 1 = wall.
 */
export function generateMaze(): MazeGrid {
  // Initialize grid with all walls
  const grid: MazeGrid = Array.from({ length: MAZE_ROWS }, () =>
    Array(MAZE_COLS).fill(1)
  );

  // Carve using recursive backtracker from cell (1,1)
  function carve(row: number, col: number) {
    grid[row][col] = 0;

    // Directions: up, down, left, right (in grid units: step of 2)
    const dirs: [number, number][] = [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2],
    ];

    // Shuffle directions
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }

    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;

      if (nr > 0 && nr < MAZE_ROWS - 1 && nc > 0 && nc < MAZE_COLS - 1 && grid[nr][nc] === 1) {
        // Carve the wall between current and next cell
        grid[row + dr / 2][col + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  }

  carve(1, 1);

  // Remove some walls to create loops (makes the maze less frustrating)
  const loopCount = Math.floor((MAZE_ROWS * MAZE_COLS) * 0.03);
  let removed = 0;
  let attempts = 0;
  while (removed < loopCount && attempts < 1000) {
    attempts++;
    const r = 2 + Math.floor(Math.random() * ((MAZE_ROWS - 3) / 2)) * 2 + 1;
    const c = 2 + Math.floor(Math.random() * ((MAZE_COLS - 3) / 2)) * 2 + 1;

    // Try to remove a wall adjacent to this cell
    const dirs: [number, number][] = [
      [0, 1],
      [1, 0],
    ];
    const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
    const wr = r + dr;
    const wc = c + dc;

    if (
      wr > 0 && wr < MAZE_ROWS - 1 &&
      wc > 0 && wc < MAZE_COLS - 1 &&
      grid[wr][wc] === 1
    ) {
      // Make sure both adjacent cells are paths
      const r1 = r - dr;
      const c1 = c - dc;
      const r2 = r + 2 * dr;
      const c2 = c + 2 * dc;
      if (
        r1 >= 0 && r1 < MAZE_ROWS && c1 >= 0 && c1 < MAZE_COLS &&
        r2 >= 0 && r2 < MAZE_ROWS && c2 >= 0 && c2 < MAZE_COLS &&
        grid[r1][c1] === 0 && grid[r2][c2] === 0
      ) {
        grid[wr][wc] = 0;
        removed++;
      }
    }
  }

  return grid;
}

/**
 * Get all open (path) positions in the maze.
 */
export function getOpenPositions(grid: MazeGrid): [number, number][] {
  const positions: [number, number][] = [];
  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (grid[r][c] === 0) {
        positions.push([r, c]);
      }
    }
  }
  return positions;
}

/**
 * Check if a tile position is a wall.
 */
export function isWall(grid: MazeGrid, row: number, col: number): boolean {
  if (row < 0 || row >= MAZE_ROWS || col < 0 || col >= MAZE_COLS) return true;
  return grid[row][col] === 1;
}

/**
 * Place shawarmas in the maze at random open positions.
 */
export function placeShawarmas(
  grid: MazeGrid,
  count: number,
  excludePositions: [number, number][]
): [number, number][] {
  const open = getOpenPositions(grid);
  const excludeSet = new Set(excludePositions.map(([r, c]) => `${r},${c}`));
  const available = open.filter(([r, c]) => !excludeSet.has(`${r},${c}`));

  // Shuffle available positions
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  return available.slice(0, Math.min(count, available.length));
}
