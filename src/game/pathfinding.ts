// ─── Enemy AI / Pathfinding ───
// Uses BFS to find the shortest path from enemy to player.

import { MAZE_COLS, MAZE_ROWS } from "./constants";
import { MazeGrid, isWall } from "./maze";
import type { Direction } from "./types";

interface BFSNode {
  row: number;
  col: number;
  parent: BFSNode | null;
  dir: Direction | null;
}

/**
 * Find the next direction an enemy should move to chase the player.
 * Uses BFS for shortest-pathfinding on the maze grid.
 */
export function findPath(
  grid: MazeGrid,
  enemyRow: number,
  enemyCol: number,
  playerRow: number,
  playerCol: number
): Direction | null {
  // If already at player position, just go right (fallback)
  if (enemyRow === playerRow && enemyCol === playerCol) return null;

  const visited = new Set<string>();
  const queue: BFSNode[] = [];
  const start: BFSNode = { row: enemyRow, col: enemyCol, parent: null, dir: null };
  queue.push(start);
  visited.add(`${enemyRow},${enemyCol}`);

  const dirs: [Direction, number, number][] = [
    ["up", -1, 0],
    ["down", 1, 0],
    ["left", 0, -1],
    ["right", 0, 1],
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.row === playerRow && current.col === playerCol) {
      // Trace back to find the first move
      let node: BFSNode | null = current;
      while (node?.parent?.parent !== null) {
        node = node?.parent ?? null;
      }
      return node?.dir ?? null;
    }

    for (const [dir, dr, dc] of dirs) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      const key = `${nr},${nc}`;

      if (!visited.has(key) && !isWall(grid, nr, nc)) {
        visited.add(key);
        queue.push({
          row: nr,
          col: nc,
          parent: current,
          dir: current.dir ?? dir,
        });
      }
    }
  }

  // No path found, try random valid direction
  return getRandomValidDirection(grid, enemyRow, enemyCol);
}

/**
 * Pick a random non-wall direction.
 */
export function getRandomValidDirection(
  grid: MazeGrid,
  row: number,
  col: number
): Direction {
  const dirs: [Direction, number, number][] = [
    ["up", -1, 0],
    ["down", 1, 0],
    ["left", 0, -1],
    ["right", 0, 1],
  ];

  const valid = dirs.filter(([, dr, dc]) => !isWall(grid, row + dr, col + dc));
  if (valid.length === 0) return "right";
  return valid[Math.floor(Math.random() * valid.length)][0];
}

/**
 * Get all valid spawn positions at minimum distance from player.
 */
export function getSpawnPositions(
  grid: MazeGrid,
  playerRow: number,
  playerCol: number,
  minDistance: number
): [number, number][] {
  const positions: [number, number][] = [];
  for (let r = 1; r < MAZE_ROWS - 1; r += 2) {
    for (let c = 1; c < MAZE_COLS - 1; c += 2) {
      if (grid[r][c] === 0) {
        const dist = Math.abs(r - playerRow) + Math.abs(c - playerCol);
        if (dist >= minDistance) {
          positions.push([r, c]);
        }
      }
    }
  }
  return positions;
}
