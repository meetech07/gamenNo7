/**
 * HUMAN VS HUMANITY — public type surface.
 * Nothing here imports from the host application. Safe to copy into any project.
 */

/* ------------------------------------------------------------------ content */

export type HvhCategory =
  | "life"
  | "future"
  | "social"
  | "technology"
  | "travel"
  | "work"
  | "food"
  | "money"
  | "absurd"
  | "survival";

/** Behavioural flavour of a scenario. Used by the adaptability engine. */
export type HvhAxis = "dream" | "risk" | "social" | "practical";

export interface HvhOption {
  id: string;
  label: string;
}

export interface HvhQuestion {
  id: string;
  category: HvhCategory;
  axis: HvhAxis;
  /** 1 = easy read, 2 = real tension, 3 = a genuine dilemma. */
  difficulty: 1 | 2 | 3;
  prompt: string;
  sub?: string;
  options: HvhOption[];
  /**
   * Built-in sample crowd. This is GAME DATA, never real statistics.
   * Percentages are listed in the same order as `options` and are
   * normalised to exactly 100 at load time.
   */
  sample: number[];
}

/* --------------------------------------------------------------------- data */

export interface HvhHumanityOption {
  optionId: string;
  percentage: number;
  count?: number;
}

export interface HvhHumanityDistribution {
  totalResponses: number;
  options: HvhHumanityOption[];
  updatedAt?: string;
  /** Optional free-form source tag from the host. */
  source?: string;
}

export interface HvhDataContext {
  country?: string;
  category?: HvhCategory;
  mode?: HvhMode;
  roundIndex?: number;
}

export type HvhHumanityDataProvider = (
  questionId: string,
  context: HvhDataContext,
) => Promise<HvhHumanityDistribution | null | undefined> | HvhHumanityDistribution | null | undefined;

/* ------------------------------------------------------------------- result */

export type HvhDataSource = "sample" | "live" | "live-fallback";

export type HvhEventType =
  | "crowd-match"
  | "rare-choice"
  | "close-battle"
  | "perfect-split"
  | "total-disagreement"
  | "humanity-twist";

export type HvhHeadline =
  | "think-like-humanity"
  | "nearly-split"
  | "own-way"
  | "went-rogue";

export interface HvhRoundResult {
  index: number;
  questionId: string;
  category: HvhCategory;
  axis: HvhAxis;
  difficulty: number;
  playerOptionId: string;
  playerLabel: string;
  distribution: HvhHumanityDistribution;
  /** Option chosen by the plurality of the crowd. */
  topOptionId: string;
  topLabel: string;
  playerPercentage: number;
  topPercentage: number;
  /** 0-100. Proximity to the crowd's plurality. */
  alignment: number;
  /** 0-100. How uncommon the player's pick was. */
  individuality: number;
  /** 0-100. How far into the tail the player was willing to go. */
  risk: number;
  score: number;
  events: HvhEventType[];
  headline: HvhHeadline;
  dataSource: HvhDataSource;
  totalResponses: number;
  /** True when the player refused the premise of the scenario. */
  declined: boolean;
  country?: string;
}

export interface HvhMetrics {
  alignment: number;
  individuality: number;
  adaptability: number;
  consistency: number;
  risk: number;
}

export interface HvhProfile {
  id: string;
  name: string;
  tagline: string;
  description: string;
  strength: string;
  watchout: string;
}

export interface HvhGameSummary {
  rounds: number;
  crowdMatches: number;
  uniqueChoices: number;
  closeBattles: number;
  rareChoices: number;
  perfectSplits: number;
  twists: number;
  declines: number;
  biggestStrength: string;
  biggestWatchout: string;
}

export interface HvhGameResult {
  mode: HvhMode;
  rounds: number;
  score: number;
  metrics: HvhMetrics;
  profile: HvhProfile;
  roundResults: HvhRoundResult[];
  summary: HvhGameSummary;
  shareText: string;
  shareCardLines: string[];
  dataSource: HvhDataSource;
  participantsLabel: string;
  country?: string;
  questionIds: string[];
  completedAt: string;
  challengeOutcome?: "win" | "loss" | "tie";
  challengeHostScore?: number;
}

/* ----------------------------------------------------------------- challenge */

export interface HvhChallengeInput {
  challengeId: string;
  questionIds?: string[];
  hostName?: string;
  hostScore?: number;
  hostProfile?: string;
  hostMetrics?: Partial<HvhMetrics>;
  hostRounds?: number;
}

export interface HvhChallenge {
  challengeId: string;
  questionIds: string[];
  hostName?: string;
  hostScore?: number;
  hostProfile?: string;
  hostMetrics?: Partial<HvhMetrics>;
  hostRounds?: number;
}

/* --------------------------------------------------------------------- props */

export type HvhMode = "quick" | "standard" | "full" | "friend" | "daily";

export interface HvhWorldStats {
  /** Number of players who finished a game on the host platform. */
  totalPlayers: number;
  averageScore: number;
  averageAlignment: number;
  /** 0-100. Percentage of players the player outperformed. */
  percentile?: number;
  label?: string;
}

export interface HvhLabelOverrides {
  sample?: string;
  live?: string;
}

export interface HumanVsHumanityProps {
  /** 5-12. Overrides the round count of every mode. */
  rounds?: number;
  /** Modes offered on the mode select screen. */
  enabledModes?: HvhMode[];
  /** Skips intro + mode select. */
  autoStart?: HvhMode;
  /** Supply real participation data. The component never talks to a network itself. */
  humanityDataProvider?: HvhHumanityDataProvider;
  /** Wording for the crowd. Defaults: "GAME HUMANITY" / "PARTICIPATING PLAYERS". */
  labels?: HvhLabelOverrides;
  enableCountrySelection?: boolean;
  countries?: { code: string; name: string }[];
  defaultCountry?: string;
  /** Real world comparison. Omit entirely and no ranking UI is rendered. */
  worldStats?: HvhWorldStats;
  /** Incoming friend challenge. */
  challenge?: HvhChallengeInput;
  /** Host creates a challenge id for the finished game. */
  onChallengeCreate?: (result: HvhGameResult) => HvhChallenge | string | null | Promise<HvhChallenge | string | null>;
  onComplete?: (result: HvhGameResult) => void;
  onStart?: (config: { mode: HvhMode; rounds: number; country?: string; questionIds: string[] }) => void;
  onShare?: (result: HvhGameResult) => void;
  /** Replace or extend the built-in scenario bank. */
  questionSet?: HvhQuestion[];
  showShareCard?: boolean;
  showShareText?: boolean;
  showHistory?: boolean;
  /** Namespaced localStorage key for the personal best. Pass "" to disable. */
  storageKey?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Accessible label for the outer region. */
  ariaLabel?: string;
}

export interface HumanVsHumanityRef {
  getResult: () => HvhGameResult | null;
  getQuestionIds: () => string[];
  reset: () => void;
}

export interface HvhModeConfig {
  mode: HvhMode;
  rounds: number;
  name: string;
  blurb: string;
  badge: string | null;
}
