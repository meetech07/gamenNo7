import type { HvhHumanityDistribution, HvhHumanityOption, HvhQuestion } from "../types";

/* ------------------------------------------------------------------ numbers */

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function clamp01(n: number): number {
  return clamp(n, 0, 1);
}

export function round(n: number): number {
  return Math.round(n);
}

export function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = avg(values);
  return Math.sqrt(avg(values.map((v) => (v - m) * (v - m))));
}

/* ---------------------------------------------------------------------- rng */

/** Deterministic 32-bit string hash. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded, repeatable pseudo-random generator (mulberry32). */
export function createRng(seed: string | number) {
  let a = typeof seed === "number" ? seed >>> 0 : hashString(seed);
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], seed: string | number): T[] {
  const rng = createRng(seed);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/* ------------------------------------------------------------- distribution */

export interface DistributionRow extends HvhHumanityOption {
  label: string;
}

export interface DistributionStats {
  rows: DistributionRow[];
  top: DistributionRow;
  second: DistributionRow | null;
  topPercentage: number;
  minPercentage: number;
  /** top - lowest */
  spread: number;
  /** top - second */
  margin: number;
  /** top - third */
  topThreeSpread: number;
  totalResponses: number;
  isEven: boolean;
}

/** Scales raw percentages so they add up to exactly 100 (1 decimal). */
export function normalizePercentages(values: number[]): number[] {
  const safe = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const total = safe.reduce((a, b) => a + b, 0);
  if (total <= 0) {
    const even = safe.length ? 100 / safe.length : 0;
    return safe.map(() => round1(even));
  }
  const scaled = safe.map((v) => round1((v / total) * 100));
  const drift = round1(100 - scaled.reduce((a, b) => a + b, 0));
  if (drift !== 0) {
    let biggest = 0;
    for (let i = 1; i < scaled.length; i += 1) {
      if (scaled[i] > scaled[biggest]) biggest = i;
    }
    scaled[biggest] = round1(scaled[biggest] + drift);
  }
  return scaled;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Builds the built-in GAME HUMANITY distribution for a question.
 * This is invented game data and is never presented as real statistics.
 */
export function buildSampleDistribution(
  question: HvhQuestion,
  seedSalt = "",
): HvhHumanityDistribution {
  const percentages = normalizePercentages(question.sample);
  const rng = createRng(question.id + seedSalt);
  const totalResponses = 800 + Math.floor(rng() * 1800);
  return {
    totalResponses,
    source: "game-sample",
    options: question.options.map((o, i) => ({
      optionId: o.id,
      percentage: percentages[i],
      count: Math.round((totalResponses * percentages[i]) / 100),
    })),
  };
}

export function normalizeLiveDistribution(
  raw: HvhHumanityDistribution,
  question: HvhQuestion,
): HvhHumanityDistribution {
  const byId = new Map(raw.options.map((o) => [o.optionId, o]));
  const values = question.options.map((o) => {
    const hit = byId.get(o.id);
    return hit && Number.isFinite(hit.percentage) && hit.percentage > 0 ? hit.percentage : 0;
  });
  const percentages = normalizePercentages(values);
  return {
    totalResponses: raw.totalResponses ?? 0,
    updatedAt: raw.updatedAt,
    source: raw.source,
    options: question.options.map((o, i) => ({
      optionId: o.id,
      percentage: percentages[i],
      count: byId.get(o.id)?.count,
    })),
  };
}

export function getStats(
  distribution: HvhHumanityDistribution,
  question: HvhQuestion,
): DistributionStats {
  const labelById = new Map(question.options.map((o) => [o.id, o.label]));
  const rows = distribution.options
    .map((o) => ({ ...o, label: labelById.get(o.optionId) ?? o.optionId }))
    .sort((a, b) => b.percentage - a.percentage);

  const top = rows[0];
  const second = rows[1] ?? null;
  const third = rows[2] ?? null;
  const percentages = rows.map((r) => r.percentage);
  const margin = second ? round1(top.percentage - second.percentage) : top.percentage;
  const topThreeSpread = third ? round1(top.percentage - third.percentage) : margin;

  return {
    rows,
    top,
    second,
    topPercentage: top.percentage,
    minPercentage: percentages.length ? Math.min(...percentages) : 0,
    spread: percentages.length ? round1(Math.max(...percentages) - Math.min(...percentages)) : 0,
    margin,
    topThreeSpread,
    totalResponses: distribution.totalResponses,
    isEven: rows.length > 1 && margin <= 5,
  };
}

/** Percentage of the crowd sitting behind a given option. */
export function percentageFor(
  distribution: HvhHumanityDistribution,
  optionId: string,
): number {
  const hit = distribution.options.find((o) => o.optionId === optionId);
  return hit ? hit.percentage : 0;
}
