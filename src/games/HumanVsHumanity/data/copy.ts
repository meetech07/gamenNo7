import type { HvhEventType, HvhHeadline, HvhMode, HvhModeConfig } from "../types";

export const TAGLINE = "You have one brain. Humanity has millions. Go.";

export const SAMPLE_LABEL = "GAME HUMANITY";
export const LIVE_LABEL = "PARTICIPATING PLAYERS";
export const SAMPLE_NOTE =
  "Built-in sample crowd. These are game numbers, not real-world statistics.";
export const LIVE_NOTE = "Real participation data supplied by the host site.";

export const SAMPLE_COPY: Record<HvhMode, string> = {
  quick: "A short run of hard decisions. Enough to find out what you are.",
  standard: "The balanced Humanity battle. Long enough to see a real pattern.",
  full: "Every corner of your judgement gets tested.",
  friend: "Same questions as your opponent. Highest score wins.",
  daily: "Everyone playing today gets the same questions.",
};

export const EVENT_LABELS: Record<HvhEventType, string> = {
  "crowd-match": "HUMANITY MATCH",
  "rare-choice": "RARE CHOICE",
  "close-battle": "CLOSE BATTLE",
  "perfect-split": "PERFECT SPLIT",
  "total-disagreement": "TOTAL DISAGREEMENT",
  "humanity-twist": "HUMANITY TWIST",
};

export const EVENT_DETAIL: Record<HvhEventType, string> = {
  "crowd-match": "You picked the option the most players picked.",
  "rare-choice": "Few players chose what you chose.",
  "close-battle": "The top two options were almost level.",
  "perfect-split": "The crowd split almost evenly. There was no safe answer.",
  "total-disagreement": "Your option was the shortest bar on the chart.",
  "humanity-twist": "Your pattern changed sharply from the round before.",
};

export const HEADLINE_LABELS: Record<HvhHeadline, string> = {
  "think-like-humanity": "YOU THINK LIKE HUMANITY",
  "nearly-split": "YOU NEARLY SPLIT HUMANITY",
  "own-way": "YOU WENT YOUR OWN WAY",
  "went-rogue": "YOU WENT ROGUE",
};

export const HEADLINE_DETAIL: Record<HvhHeadline, string> = {
  "think-like-humanity": "Same direction as the crowd. That is a valid way to win.",
  "nearly-split": "You were one small margin away from the biggest group.",
  "own-way": "You took the less travelled option. The crowd did not follow.",
  "went-rogue": "Almost nobody chose what you chose. You did it anyway.",
};

export const METRIC_LABELS: Record<string, string> = {
  alignment: "HUMANITY ALIGNMENT",
  individuality: "INDIVIDUALITY",
  adaptability: "ADAPTABILITY",
  consistency: "CONSISTENCY",
  risk: "RISK",
};

export const MODE_CONFIGS: HvhModeConfig[] = [
  { mode: "quick", rounds: 5, name: "QUICK BATTLE", blurb: SAMPLE_COPY.quick, badge: null },
  {
    mode: "standard",
    rounds: 7,
    name: "STANDARD BATTLE",
    blurb: SAMPLE_COPY.standard,
    badge: null,
  },
  { mode: "full", rounds: 12, name: "FULL HUMANITY", blurb: SAMPLE_COPY.full, badge: null },
  { mode: "friend", rounds: 7, name: "FRIEND BATTLE", blurb: SAMPLE_COPY.friend, badge: "HEAD TO HEAD" },
  { mode: "daily", rounds: 7, name: "DAILY BATTLE", blurb: SAMPLE_COPY.daily, badge: "SAME FOR EVERYONE" },
];

export function modeConfig(mode: HvhMode, roundsOverride?: number): HvhModeConfig {
  const base = MODE_CONFIGS.find((m) => m.mode === mode) ?? MODE_CONFIGS[1];
  const rounds = clampRounds(roundsOverride ?? base.rounds);
  const badge = base.badge === null ? `${rounds} ROUNDS` : base.badge;
  return { ...base, rounds, badge };
}

export function clampRounds(n: number): number {
  if (!Number.isFinite(n)) return 7;
  return Math.max(5, Math.min(12, Math.round(n)));
}
