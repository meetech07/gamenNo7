import type { HvhCategory, HvhQuestion } from "../types";
import { hashString, shuffle } from "./core";

/**
 * Round selection.
 *
 * Deterministic for a given seed, so a Daily Battle is identical for every
 * player on that day and a Friend Battle can replay an exact question set.
 * Categories are balanced first, then behavioural axes are spread so the
 * adaptability metric has something real to measure.
 */
export function selectQuestions(
  pool: HvhQuestion[],
  count: number,
  seed: string | number,
): HvhQuestion[] {
  if (!pool.length) return [];

  const byCategory = new Map<HvhCategory, HvhQuestion[]>();
  for (const q of pool) {
    const list = byCategory.get(q.category) ?? [];
    list.push(q);
    byCategory.set(q.category, list);
  }
  const categories = [...byCategory.keys()].sort();
  categories.forEach((c) => byCategory.set(c, shuffle(byCategory.get(c)!, String(seed) + ":" + c)));

  const buckets = categories.map((c) => (byCategory.get(c) ?? []).slice());
  const bucketsLeft = buckets.map((b) => b.length);
  const categoryUse = new Map<HvhCategory, number>();
  const axisUse = new Map<string, number>();
  const picked: HvhQuestion[] = [];
  let cursor = 0;

  while (picked.length < count) {
    let advanced = false;
    for (let i = 0; i < buckets.length && picked.length < count; i += 1) {
      const idx = (cursor + i) % buckets.length;
      if (bucketsLeft[idx] <= 0) continue;
      const list = buckets[idx];
      let best = 0;
      let bestCost = Number.POSITIVE_INFINITY;
      for (let k = 0; k < list.length; k += 1) {
        if (!list[k]) continue;
        const q = list[k];
        const cost =
          (categoryUse.get(q.category) ?? 0) * 2 + (axisUse.get(q.axis) ?? 0) * 3 + k * 0.001;
        if (cost < bestCost) {
          bestCost = cost;
          best = k;
        }
      }
      const chosen = list[best];
      list[best] = null as unknown as HvhQuestion;
      bucketsLeft[idx] -= 1;
      categoryUse.set(chosen.category, (categoryUse.get(chosen.category) ?? 0) + 1);
      axisUse.set(chosen.axis, (axisUse.get(chosen.axis) ?? 0) + 1);
      picked.push(chosen);
      advanced = true;
    }
    if (!advanced) break;
    cursor += 1;
    if (cursor > buckets.length * 4) break;
  }

  if (picked.length < count) {
    // Pool smaller than the requested round count: fill with unused questions.
    const used = new Set(picked.map((q) => q.id));
    const extra = shuffle(pool, String(seed) + ":fill").filter((q) => !used.has(q.id));
    picked.push(...extra);
  }

  return picked.slice(0, count);
}

export function dailySeed(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `hvh-daily-${y}-${m}-${d}-${hashString(`${y}${m}${d}`) % 997}`;
}

export function randomSeed(): string {
  return `hvh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
