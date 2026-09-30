import { classifyProfile } from "../data/profiles";
import { isDecline } from "../data/questions";
import type {
  HvhDataSource,
  HvhEventType,
  HvhGameResult,
  HvhGameSummary,
  HvhHeadline,
  HvhHumanityDistribution,
  HvhMetrics,
  HvhMode,
  HvhQuestion,
  HvhRoundResult,
} from "../types";
import { avg, clamp, getStats, percentageFor, round, stdev } from "./core";

/* ------------------------------------------------------------- round maths */

/** 0-1. 0 = you sat with the plurality, 1 = you took the most extreme option. */
function stanceOf(playerPct: number, topPct: number): number {
  if (topPct <= 0) return 0;
  return clamp((topPct - playerPct) / topPct, 0, 1);
}

/**
 * Alignment: how close the player's option sits to the crowd's plurality.
 * Picking the top option scores 100. 10 points behind a 40% plurality still
 * scores around 68 — deliberately generous, because alignment measures
 * proximity, not agreement.
 */
function alignmentOf(playerPct: number, topPct: number): number {
  if (topPct <= 0) return 0;
  return clamp(100 - 130 * ((topPct - playerPct) / topPct), 0, 100);
}

/**
 * Individuality: how uncommon the player's option was, measured against the
 * even split (100 / options). Picking the plurality of a wide-open crowd still
 * leaves individuality on the table; picking a minority option in a close
 * crowd does not punish you as hard as picking it in a lopsided one.
 */
function individualityOf(playerPct: number, optionCount: number): number {
  const even = 100 / Math.max(1, optionCount);
  return clamp(50 + 300 * ((even - playerPct) / 100), 0, 100);
}

function riskOf(playerPct: number, topPct: number, difficulty: number): number {
  return clamp(stanceOf(playerPct, topPct) * 100 * (0.75 + 0.125 * difficulty), 0, 100);
}

function headlineOf(
  isTop: boolean,
  isSecond: boolean,
  margin: number,
  playerPct: number,
): HvhHeadline {
  if (isTop) return "think-like-humanity";
  if (isSecond && margin <= 5) return "nearly-split";
  if (playerPct <= 8) return "went-rogue";
  if (playerPct <= 14) return "own-way";
  return "own-way";
}

/**
 * Special events. Every single one of them is only raised when the actual
 * distribution for that round satisfies the condition. Nothing is invented.
 */
function eventsOf(args: {
  isTop: boolean;
  playerPct: number;
  margin: number;
  topThreeSpread: number;
  optionCount: number;
  stance: number;
  previousStance: number | null;
}): HvhEventType[] {
  const out: HvhEventType[] = [];
  if (args.isTop) out.push("crowd-match");
  if (args.playerPct <= 6) out.push("total-disagreement");
  else if (args.playerPct <= 12 && args.optionCount >= 3) out.push("rare-choice");
  if (args.margin <= 5 && args.optionCount >= 2) out.push("close-battle");
  if (args.topThreeSpread <= 6 && args.optionCount >= 3) out.push("perfect-split");
  if (
    args.previousStance !== null &&
    Math.abs(args.stance - args.previousStance) >= 0.4 &&
    args.previousStance >= 0
  ) {
    out.push("humanity-twist");
  }
  return out;
}

export interface RoundScoreInput {
  question: HvhQuestion;
  index: number;
  playerOptionId: string;
  distribution: HvhHumanityDistribution;
  dataSource: HvhDataSource;
  previousStance: number | null;
  crowdMatchStreak: number;
  totalRounds: number;
  country?: string;
}

export function scoreRound(input: RoundScoreInput): HvhRoundResult {
  const { question, index, playerOptionId, distribution } = input;
  const stats = getStats(distribution, question);
  const playerPct = percentageFor(distribution, playerOptionId);
  const isTop = playerOptionId === stats.top.optionId;
  const playerRank = stats.rows.findIndex((r) => r.optionId === playerOptionId);
  const isSecond = playerRank === 1;

  const alignment = round(alignmentOf(playerPct, stats.topPercentage));
  const individuality = round(individualityOf(playerPct, question.options.length));
  const risk = round(riskOf(playerPct, stats.topPercentage, question.difficulty));
  const stance = stanceOf(playerPct, stats.topPercentage);

  const events = eventsOf({
    isTop,
    playerPct,
    margin: stats.margin,
    topThreeSpread: stats.topThreeSpread,
    optionCount: question.options.length,
    stance,
    previousStance: input.previousStance,
  });

  /* --- round score ------------------------------------------------------ */
  let base = isTop ? 100 : 40 + 60 * stance;
  if (events.includes("rare-choice")) base += 80; // strong independence
  if (events.includes("close-battle")) base += 40; // narrow margin bonus
  if (events.includes("perfect-split")) base += 50; // no safe answer
  if (events.includes("total-disagreement")) base += 35;
  if (events.includes("humanity-twist")) base += 30;
  if (input.crowdMatchStreak >= 1 && isTop) base += 25 * input.crowdMatchStreak;
  const difficultyMultiplier = 1 + 0.15 * (question.difficulty - 1);
  const score = round(base * difficultyMultiplier);

  return {
    index,
    questionId: question.id,
    category: question.category,
    axis: question.axis,
    difficulty: question.difficulty,
    playerOptionId,
    playerLabel:
      question.options.find((o) => o.id === playerOptionId)?.label ?? playerOptionId,
    distribution,
    topOptionId: stats.top.optionId,
    topLabel: stats.top.label,
    playerPercentage: playerPct,
    topPercentage: stats.topPercentage,
    alignment,
    individuality,
    risk,
    score,
    events,
    headline: headlineOf(isTop, isSecond, stats.margin, playerPct),
    dataSource: input.dataSource,
    totalResponses: stats.totalResponses,
    declined: isDecline(question.id, playerOptionId),
    country: input.country,
  };
}

/* ---------------------------------------------------------- game aggregates */

/**
 * Adaptability: does the player's stance actually change with the type of
 * scenario? Measured as the share of stance variance that is explained by the
 * behavioural axis (eta-squared) plus how far apart the per-axis means sit.
 * Random play produces no axis structure, so it does not score.
 */
function adaptabilityOf(rounds: HvhRoundResult[]): number {
  if (rounds.length < 3) return 40;
  const axes = new Set(rounds.map((r) => r.axis));
  if (axes.size < 2) return 40;

  const stances = rounds.map((r) => stanceOf(r.playerPercentage, r.topPercentage));
  const grand = avg(stances);
  const totalVariance = avg(stances.map((s) => (s - grand) ** 2));

  let between = 0;
  axes.forEach((axis) => {
    const groupStances = stances.filter((_, i) => rounds[i].axis === axis);
    const mean = avg(groupStances);
    between += groupStances.length * (mean - grand) ** 2;
  });
  between /= rounds.length;

  const eta2 = totalVariance > 0.0001 ? clamp(between / totalVariance, 0, 1) : 0;

  const axisMeans = [...axes].map((axis) =>
    avg(stances.filter((_, i) => rounds[i].axis === axis)),
  );
  const spread = clamp(Math.max(...axisMeans) - Math.min(...axisMeans), 0, 1);

  return round(clamp(0.7 * (eta2 / 0.6) * 100 + 0.3 * spread * 100, 0, 100));
}

export function computeMetrics(rounds: HvhRoundResult[]): HvhMetrics {
  if (!rounds.length) {
    return { alignment: 0, individuality: 0, adaptability: 0, consistency: 0, risk: 0 };
  }
  const individualitySeries = rounds.map((r) => r.individuality);
  // A player with a perfectly steady style scores 100; a wild one scores near 0.
  const consistency = round(clamp(100 - stdev(individualitySeries) * 2.2, 0, 100));
  return {
    alignment: round(avg(rounds.map((r) => r.alignment))),
    individuality: round(avg(rounds.map((r) => r.individuality))),
    adaptability: adaptabilityOf(rounds),
    consistency,
    risk: round(avg(rounds.map((r) => r.risk))),
  };
}

const METRIC_QUOTES: Record<keyof HvhMetrics, (m: HvhMetrics) => string> = {
  alignment: (m) =>
    m.alignment >= 70
      ? "locking in with the largest group in the room"
      : m.alignment >= 50
        ? "staying close to the crowd without copying it"
        : "deciding as if the crowd were not in the room",
  individuality: (m) =>
    m.individuality >= 65
      ? "reaching for options most people walk past"
      : m.individuality >= 45
        ? "mixing familiar picks with a few of your own"
        : "choosing the safe, popular end of every question",
  adaptability: (m) =>
    m.adaptability >= 70
      ? "changing your mind when the question actually changes"
      : m.adaptability >= 45
        ? "shifting style a little, depending on the scenario"
        : "answering with one fixed style whatever was asked",
  consistency: (m) =>
    m.consistency >= 70
      ? "repeating yourself with real discipline"
      : m.consistency >= 45
        ? "drifting a little from round to round"
        : "changing direction almost every round",
  risk: (m) =>
    m.risk >= 65
      ? "sitting with the shortest bar on the chart"
      : m.risk >= 40
        ? "taking calculated chances and avoiding the extremes"
        : "refusing to be the shortest bar on the chart",
};

function lowest(metrics: HvhMetrics): keyof HvhMetrics {
  const keys: Array<keyof HvhMetrics> = ["alignment", "individuality", "adaptability", "consistency", "risk"];
  return keys.reduce((acc, k) => (metrics[k] < metrics[acc] ? k : acc), keys[0]);
}

/**
 * Did the player's style change mid-game? Compares the mean stance of the first
 * half of the rounds with the second half.
 */
function lateSwitchOf(rounds: HvhRoundResult[]): boolean {
  if (rounds.length < 4) return false;
  const half = Math.floor(rounds.length / 2);
  const stance = (r: HvhRoundResult) =>
    r.topPercentage > 0 ? clamp((r.topPercentage - r.playerPercentage) / r.topPercentage, 0, 1) : 0;
  const first = avg(rounds.slice(0, half).map(stance));
  const second = avg(rounds.slice(half).map(stance));
  return Math.abs(second - first) >= 0.35;
}

export function buildSummary(
  rounds: HvhRoundResult[],
  metrics: HvhMetrics,
): HvhGameSummary {
  const crowdMatches = rounds.filter((r) => r.events.includes("crowd-match")).length;
  const uniqueChoices = rounds.filter((r) => r.playerOptionId !== r.topOptionId).length;
  const rareChoices = rounds.filter((r) => r.events.includes("rare-choice")).length;
  const closeBattles = rounds.filter((r) => r.events.includes("close-battle")).length;
  const twists = rounds.filter((r) => r.events.includes("humanity-twist")).length;
  const perfectSplits = rounds.filter((r) => r.events.includes("perfect-split")).length;
  const declines = rounds.filter((r) => r.declined).length;
  const weakest = lowest(metrics);

  return {
    rounds: rounds.length,
    crowdMatches,
    uniqueChoices,
    closeBattles,
    rareChoices,
    twists,
    perfectSplits,
    declines,
    biggestStrength: METRIC_QUOTES[strongest(metrics)](metrics),
    biggestWatchout: METRIC_QUOTES[weakest](metrics),
  };
}

function strongest(metrics: HvhMetrics): keyof HvhMetrics {
  const keys: Array<keyof HvhMetrics> = ["alignment", "individuality", "adaptability", "consistency", "risk"];
  return keys.reduce((acc, k) => (metrics[k] > metrics[acc] ? k : acc), keys[0]);
}

/* --------------------------------------------------------------- the score */

export function computeBattleScore(rounds: HvhRoundResult[], metrics: HvhMetrics): number {
  const roundTotal = rounds.reduce((a, r) => a + r.score, 0);
  // Style bonus: adaptability carries the most weight because it is the only
  // metric that cannot be produced by picking the same way twice.
  const styleBonus = Math.round(metrics.adaptability * 1.4 + metrics.consistency * 0.6 - 100);
  // Challenge bonus: the harder scenarios were worth more.
  const challengeBonus = rounds.reduce((a, r) => a + (r.difficulty - 1) * 25, 0);
  return Math.max(0, roundTotal + styleBonus + challengeBonus);
}

/* ---------------------------------------------------------------- text gen */

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function buildShareText(
  profileName: string,
  summary: HvhGameSummary,
  metrics: HvhMetrics,
  participantsLabel: string,
): string {
  const rogue = summary.uniqueChoices;
  const parts: string[] = [];
  parts.push(
    `I just played Human vs Humanity. I matched the ${participantsLabel.toLowerCase()} ${plural(
      summary.crowdMatches,
      "time",
      "times",
    )} and went my own way ${plural(rogue, "time", "times")}.`,
  );
  if (summary.rareChoices > 0) {
    parts.push(`${plural(summary.rareChoices, "round", "rounds")} ended up on the shortest bar on the chart.`);
  } else if (summary.closeBattles > 0) {
    parts.push(`The crowd was split ${plural(summary.closeBattles, "time", "times")} and I had to call it.`);
  }
  parts.push(`${metrics.individuality}% individuality, ${metrics.adaptability}% adaptability.`);
  parts.push(`Final read: ${profileName}. Your choice. Your rules.`);
  return parts.join(" ");
}

export function buildShareCardLines(
  metrics: HvhMetrics,
  profileName: string,
  profileTagline: string,
): string[] {
  return [
    `${metrics.alignment}% HUMANITY ALIGNMENT`,
    `${metrics.individuality}% INDIVIDUALITY`,
    `${metrics.adaptability}% ADAPTABILITY`,
    profileName,
    profileTagline,
  ];
}

/* -------------------------------------------------------------- final build */

export function buildGameResult(args: {
  mode: HvhMode;
  rounds: HvhRoundResult[];
  participantsLabel: string;
  country?: string;
  challengeHostScore?: number;
}): HvhGameResult {
  const { mode, rounds, participantsLabel } = args;
  const metrics = computeMetrics(rounds);
  const summary = buildSummary(rounds, metrics);
  const score = computeBattleScore(rounds, metrics);
  const profile = classifyProfile(metrics, {
    perfectSplits: summary.perfectSplits,
    rareChoices: summary.rareChoices,
    crowdMatches: summary.crowdMatches,
    totalRounds: rounds.length,
    declines: summary.declines,
    lateSwitch: lateSwitchOf(rounds),
  });

  const liveRounds = rounds.filter((r) => r.dataSource === "live").length;
  const dataSource: HvhDataSource =
    liveRounds === rounds.length && rounds.length > 0
      ? "live"
      : liveRounds > 0
        ? "live-fallback"
        : "sample";

  let challengeOutcome: "win" | "loss" | "tie" | undefined;
  if (typeof args.challengeHostScore === "number") {
    challengeOutcome =
      score > args.challengeHostScore ? "win" : score < args.challengeHostScore ? "loss" : "tie";
  }

  return {
    mode,
    rounds: rounds.length,
    score,
    metrics,
    profile,
    roundResults: rounds,
    summary,
    shareText: buildShareText(profile.name, summary, metrics, participantsLabel),
    shareCardLines: buildShareCardLines(metrics, profile.name, profile.tagline),
    dataSource,
    participantsLabel,
    country: args.country,
    questionIds: rounds.map((r) => r.questionId),
    completedAt: new Date().toISOString(),
    challengeOutcome,
    challengeHostScore: args.challengeHostScore,
  };
}
