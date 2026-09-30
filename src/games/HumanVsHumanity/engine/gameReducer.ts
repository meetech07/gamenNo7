import type { RoundPhase } from "../components/RoundScreen";
import type {
  HvhDataSource,
  HvhGameResult,
  HvhHumanityDistribution,
  HvhMode,
  HvhQuestion,
  HvhRoundResult,
} from "../types";
import { buildGameResult, scoreRound } from "./scoring";

export type HvhScreen = "intro" | "how" | "modes" | "challenge" | "round" | "result";

export interface HvhState {
  screen: HvhScreen;
  mode: HvhMode;
  questions: HvhQuestion[];
  index: number;
  phase: RoundPhase;
  selected: string | null;
  distribution: HvhHumanityDistribution | null;
  countryDistribution: HvhHumanityDistribution | null;
  dataSource: HvhDataSource;
  loading: boolean;
  loadError: boolean;
  rounds: HvhRoundResult[];
  currentRound: HvhRoundResult | null;
  previousStance: number | null;
  crowdStreak: number;
  country: string;
  result: HvhGameResult | null;
  sampleLabel: string;
  liveLabel: string;
  best: number;
  shareStatus: string;
  challengeId: string | null;
  challengeBusy: boolean;
  challengeHostScore?: number;
  challengeDeclined: boolean;
  isNewBest: boolean;
}

export type HvhAction =
  | { type: "nav"; screen: HvhScreen }
  | { type: "set-country"; country: string }
  | { type: "start"; mode: HvhMode; questions: HvhQuestion[] }
  | { type: "select"; optionId: string }
  | { type: "lock" }
  | { type: "data-loading" }
  | {
      type: "data-loaded";
      distribution: HvhHumanityDistribution;
      countryDistribution: HvhHumanityDistribution | null;
      dataSource: HvhDataSource;
      error?: boolean;
    }
  | { type: "phase"; phase: RoundPhase }
  | { type: "advance" }
  | { type: "share-status"; status: string }
  | { type: "challenge-id"; id: string }
  | { type: "challenge-busy"; busy: boolean }
  | { type: "reset" };

export function createInitialState(args: {
  sampleLabel: string;
  liveLabel: string;
  country: string;
  best: number;
  challengeHostScore?: number;
  challengeDeclined: boolean;
}): HvhState {
  return {
    screen: "intro",
    mode: "standard",
    questions: [],
    index: 0,
    phase: "choose",
    selected: null,
    distribution: null,
    countryDistribution: null,
    dataSource: "sample",
    loading: false,
    loadError: false,
    rounds: [],
    currentRound: null,
    previousStance: null,
    crowdStreak: 0,
    country: args.country,
    result: null,
    sampleLabel: args.sampleLabel,
    liveLabel: args.liveLabel,
    best: args.best,
    shareStatus: "",
    challengeId: null,
    challengeBusy: false,
    challengeHostScore: args.challengeHostScore,
    challengeDeclined: args.challengeDeclined,
    isNewBest: false,
  };
}

function currentQuestion(state: HvhState): HvhQuestion | undefined {
  return state.questions[state.index];
}

function finishGame(state: HvhState): HvhState {
  const participantsLabel = state.rounds.every((r) => r.dataSource === "live")
    ? state.liveLabel
    : state.sampleLabel;
  const result = buildGameResult({
    mode: state.mode,
    rounds: state.rounds,
    participantsLabel,
    country: state.country || undefined,
    challengeHostScore: state.challengeHostScore,
  });
  return {
    ...state,
    screen: "result",
    result,
    isNewBest: result.score > state.best,
    best: Math.max(state.best, result.score),
    phase: "summary",
  };
}

export function reducer(state: HvhState, action: HvhAction): HvhState {
  switch (action.type) {
    case "nav":
      return { ...state, screen: action.screen };

    case "set-country":
      return { ...state, country: action.country };

    case "start":
      return {
        ...state,
        screen: "round",
        mode: action.mode,
        questions: action.questions,
        index: 0,
        phase: "choose",
        selected: null,
        distribution: null,
        countryDistribution: null,
        dataSource: "sample",
        loading: false,
        loadError: false,
        rounds: [],
        currentRound: null,
        previousStance: null,
        crowdStreak: 0,
        result: null,
        shareStatus: "",
        challengeId: null,
      };

    case "select":
      if (state.phase !== "choose") return state;
      return { ...state, selected: action.optionId };

    case "lock":
      if (state.phase !== "choose" || !state.selected) return state;
      return { ...state, phase: "locked", loading: true, loadError: false };

    case "data-loading":
      return { ...state, loading: true };

    case "data-loaded":
      return {
        ...state,
        loading: false,
        loadError: !!action.error,
        distribution: action.distribution,
        countryDistribution: action.countryDistribution,
        dataSource: action.dataSource,
        phase: "reveal",
      };

    case "phase": {
      if (action.phase === "battle") {
        const question = currentQuestion(state);
        if (!question || !state.selected || !state.distribution) {
          return { ...state, phase: "battle" };
        }
        const scored = scoreRound({
          question,
          index: state.index,
          playerOptionId: state.selected,
          distribution: state.distribution,
          dataSource: state.dataSource,
          previousStance: state.previousStance,
          crowdMatchStreak: state.crowdStreak,
          totalRounds: state.questions.length,
          country: state.country || undefined,
        });
        const stance =
          scored.topPercentage > 0
            ? (scored.topPercentage - scored.playerPercentage) / scored.topPercentage
            : 0;
        return {
          ...state,
          phase: "battle",
          currentRound: scored,
          rounds: [...state.rounds, scored],
          previousStance: stance,
          crowdStreak: scored.events.includes("crowd-match") ? state.crowdStreak + 1 : 0,
        };
      }
      if (action.phase === "summary") return { ...state, phase: "summary" };
      return state;
    }

    case "advance": {
      if (state.phase === "reveal") return reducer(state, { type: "phase", phase: "battle" });
      if (state.phase === "battle") return reducer(state, { type: "phase", phase: "summary" });
      if (state.phase === "summary") return advanceRound(state);
      return state;
    }

    case "share-status":
      return { ...state, shareStatus: action.status };

    case "challenge-id":
      return { ...state, challengeId: action.id, challengeBusy: false };

    case "challenge-busy":
      return { ...state, challengeBusy: action.busy };

    case "reset":
      return {
        ...createInitialState({
          sampleLabel: state.sampleLabel,
          liveLabel: state.liveLabel,
          country: state.country,
          best: state.best,
          challengeHostScore: state.challengeHostScore,
          challengeDeclined: state.challengeDeclined,
        }),
        screen: state.challengeHostScore !== undefined ? "challenge" : "modes",
      };

    default:
      return state;
  }
}

/**
 * Moves the loop one step forward: the next round, or the final result.
 * Called from the `advance` action, which also handles the phase changes.
 */
export function advanceRound(state: HvhState): HvhState {
  if (state.phase !== "summary") return state;
  const next = state.index + 1;
  if (next >= state.questions.length) return finishGame(state);
  return {
    ...state,
    index: next,
    phase: "choose",
    selected: null,
    distribution: null,
    countryDistribution: null,
    dataSource: "sample",
    loading: false,
    loadError: false,
    currentRound: null,
  };
}
