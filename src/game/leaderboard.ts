// ─── Leaderboard (localStorage) ───
// Structured so Supabase can easily replace localStorage later.

import type { ScoreEntry, CharacterType } from "./types";

const STORAGE_KEY = "shawarma-chase-leaderboard";

/**
 * Get all leaderboard entries sorted by score (highest first).
 */
export function getLeaderboard(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: ScoreEntry[] = JSON.parse(raw);
    return entries.sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

/**
 * Add a new score entry to the leaderboard.
 */
export function addScoreEntry(
  playerName: string,
  score: number,
  highestRound: number,
  character: CharacterType
): void {
  const entries = getLeaderboard();

  // Only keep the highest score per player name
  const existing = entries.find((e) => e.playerName === playerName);
  if (existing) {
    // Update only if the new score is higher
    if (score > existing.score) {
      existing.score = score;
      existing.highestRound = highestRound;
      existing.character = character;
      existing.date = new Date().toISOString();
    }
  } else {
    // New player — add entry
    entries.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      playerName,
      score,
      highestRound,
      character,
      date: new Date().toISOString(),
    });
  }

  entries.sort((a, b) => b.score - a.score);
  // Keep top 50
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 50)));
}

/**
 * Clear the entire leaderboard.
 */
export function clearLeaderboard(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Format score for display.
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Format date for display.
 */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Unknown";
  }
}
