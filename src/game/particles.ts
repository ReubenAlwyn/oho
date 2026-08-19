// ─── Particle Effects ───

import type { Particle } from "./types";

/**
 * Create particles for shawarma collection.
 */
export function createCollectParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  const colors = ["#fbbf24", "#f59e0b", "#fef08a", "#22c55e", "#10b981"];

  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
    const speed = 1.5 + Math.random() * 2.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 15,
      maxLife: 45,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 3,
      type: Math.random() > 0.5 ? "spark" : "glow",
    });
  }
  return particles;
}

/**
 * Create particles for enemy hit / player death.
 */
export function createHitParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  const colors = ["#ef4444", "#f87171", "#fca5a5", "#fbbf24"];

  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40 + Math.random() * 20,
      maxLife: 60,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 4,
      type: "spark",
    });
  }
  return particles;
}

/**
 * Create particles for round completion.
 */
export function createRoundCompleteParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  const colors = ["#8b5cf6", "#a855f7", "#c084fc", "#e879f9", "#f472b6", "#22d3ee"];

  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * width,
      y: height + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -3 - Math.random() * 4,
      life: 60 + Math.random() * 30,
      maxLife: 90,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 4,
      type: Math.random() > 0.3 ? "glow" : "spark",
    });
  }
  return particles;
}

/**
 * Update all particles. Returns only living particles.
 */
export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vx: p.vx * 0.96,
      vy: p.vy * 0.96,
      life: p.life - 1,
    }))
    .filter((p) => p.life > 0);
}
