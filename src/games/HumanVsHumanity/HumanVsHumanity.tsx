import { useCallback, useEffect, useImperativeHandle, useMemo, useReducer, useRef, forwardRef } from "react";
import { ChallengeIntroScreen } from "./components/ChallengeIntroScreen";
import { HowItWorksScreen } from "./components/HowItWorksScreen";
import { IntroScreen } from "./components/IntroScreen";
import { ModeSelectScreen } from "./components/ModeSelectScreen";
import { ResultScreen } from "./components/ResultScreen";
import { RoundScreen } from "./components/RoundScreen";
import { buildQuestionIndex } from "./components/RoundHistory";
import { countryName } from "./data/countries";
import { LIVE_LABEL, SAMPLE_LABEL, modeConfig } from "./data/copy";
import { QUESTIONS } from "./data/questions";
import { buildSampleDistribution, normalizeLiveDistribution } from "./engine/core";
import { createInitialState, reducer } from "./engine/gameReducer";import { dailySeed, randomSeed, selectQuestions } from "./engine/selection";
import type {
  HumanVsHumanityProps,
  HumanVsHumanityRef,
  HvhHumanityDistribution,
  HvhMode,
  HvhQuestion,
} from "./types";
import { useInjectedStyles, usePrefersReducedMotion } from "./utils/hooks";
import { copyText, DEFAULT_STORAGE_KEY, readBest, shareResult, shareTitle, triggerDownload, writeBest } from "./utils/share";
import { renderShareCard } from "./utils/shareCard";

const DEFAULT_MODES: HvhMode[] = ["quick", "standard", "full", "friend", "daily"];

/**
 * HUMAN VS HUMANITY
 * "You have one brain. Humanity has millions. Go."
 *
 * Fully standalone: no global CSS, no global state, no router, no backend,
 * no UI library. The host renders one component and optionally hands it data.
 */
export const HumanVsHumanity = forwardRef<HumanVsHumanityRef, HumanVsHumanityProps>(
  function HumanVsHumanity(props, ref) {
    useInjectedStyles();
    const reducedMotion = usePrefersReducedMotion();

    const {
      rounds: roundsProp,
      enabledModes,
      autoStart,
      humanityDataProvider,
      labels,
      enableCountrySelection = false,
      countries,
      defaultCountry = "",
      worldStats,
      challenge,
      onChallengeCreate,
      onComplete,
      onStart,
      onShare,
      questionSet,
      showShareCard = true,
      showShareText = true,
      showHistory = true,
      storageKey,
      className,
      style,
      ariaLabel = "Human vs Humanity game",
    } = props;

    const pool: HvhQuestion[] = useMemo(
      () => (questionSet && questionSet.length ? questionSet : QUESTIONS),
      [questionSet],
    );
    const questionById = useMemo(() => new Map(pool.map((q) => [q.id, q])), [pool]);

    const sampleLabel = labels?.sample ?? SAMPLE_LABEL;
    const liveLabel = labels?.live ?? LIVE_LABEL;

    const [state, dispatch] = useReducer(
      reducer,
      undefined,
      (): ReturnType<typeof createInitialState> =>
        createInitialState({
          sampleLabel,
          liveLabel,
          country: defaultCountry,
          best: readBest(storageKey ?? DEFAULT_STORAGE_KEY),
          challengeHostScore: challenge?.hostScore,
          challengeDeclined: false,
        }),
    );

    /* ------------------------------------------------------------- start up */

    const startedRef = useRef(false);
    const countryRef = useRef(state.country);
    countryRef.current = state.country;

    const beginGame = useCallback(
      (mode: HvhMode, forceSeed?: string) => {
        const cfg = modeConfig(mode, roundsProp);
        const forced =
          mode === "friend" && challenge?.questionIds?.length
            ? challenge.questionIds
                .map((id) => questionById.get(id))
                .filter((q): q is HvhQuestion => !!q)
            : null;
        const questions =
          forced && forced.length
            ? forced.slice(0, cfg.rounds)
            : selectQuestions(
                pool,
                cfg.rounds,
                forceSeed ?? (mode === "daily" ? dailySeed() : randomSeed()),
              );
        if (!questions.length) return;
        dispatch({ type: "start", mode, questions });
        onStart?.({
          mode,
          rounds: questions.length,
          country: countryRef.current || undefined,
          questionIds: questions.map((q) => q.id),
        });
      },
      [roundsProp, pool, questionById, challenge, onStart],
    );

    useEffect(() => {
      if (startedRef.current) return;
      startedRef.current = true;
      if (autoStart) {
        beginGame(autoStart);
        return;
      }
      if (challenge && typeof challenge.hostScore === "number") {
        dispatch({ type: "nav", screen: "challenge" });
      }
    }, [autoStart, beginGame, challenge]);

    /* -------------------------------------------------------- round data */

    const timerRef = useRef<number | null>(null);
    const question = state.questions[state.index];

    useEffect(() => {
      if (state.phase !== "locked" || !question) return;
      let cancelled = false;

      const load = async () => {
        dispatch({ type: "data-loading" });
        let distribution: HvhHumanityDistribution | null = null;
        let countryDistribution: HvhHumanityDistribution | null = null;
        let live = false;
        let failed = false;

        if (humanityDataProvider) {
          const base = {
            category: question.category,
            mode: state.mode,
            roundIndex: state.index,
          };
          try {
            const raw = await humanityDataProvider(question.id, base);
            if (raw) {
              distribution = normalizeLiveDistribution(raw, question);
              live = true;
            }
          } catch {
            failed = true;
          }
          if (state.country) {
            try {
              const rawCountry = await humanityDataProvider(question.id, {
                ...base,
                country: state.country,
              });
              if (rawCountry) countryDistribution = normalizeLiveDistribution(rawCountry, question);
            } catch {
              /* country data is optional; never blocks the round */
            }
          }
        }

        if (cancelled) return;
        const resolved = distribution ?? buildSampleDistribution(question, state.country);

        const reveal = () => {
          if (cancelled) return;
          dispatch({
            type: "data-loaded",
            distribution: resolved,
            countryDistribution,
            dataSource: live ? "live" : "sample",
            error: failed,
          });
        };

        if (reducedMotion) {
          reveal();
          return;
        }
        timerRef.current = window.setTimeout(reveal, live ? 520 : 820);
      };

      void load();
      return () => {
        cancelled = true;
        if (timerRef.current !== null) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [state.phase, state.index, question, humanityDataProvider, state.country, state.mode, reducedMotion]);

    /* ------------------------------------------------------------- results */

    useEffect(() => {
      if (!state.result) return;
      const key = storageKey ?? DEFAULT_STORAGE_KEY;
      writeBest(key, state.result.score);
    }, [state.result, storageKey]);

    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;
    const firedRef = useRef<string | null>(null);
    useEffect(() => {
      const result = state.result;
      if (!result || firedRef.current === result.completedAt) return;
      firedRef.current = result.completedAt;
      onCompleteRef.current?.(result);
    }, [state.result]);

    /* -------------------------------------------------------------- actions */

    const crowdLabel = state.distribution
      ? state.dataSource === "sample"
        ? state.sampleLabel
        : state.liveLabel
      : humanityDataProvider
        ? state.liveLabel
        : state.sampleLabel;

    const handleContinue = useCallback(() => {
      dispatch({ type: "advance" });
    }, []);

    const handleSelect = useCallback((optionId: string) => {
      dispatch({ type: "select", optionId });
    }, []);

    const handleLock = useCallback(() => {
      dispatch({ type: "lock" });
    }, []);

    const replay = useCallback(() => {
      firedRef.current = null;
      dispatch({ type: "reset" });
      beginGame(state.mode);
    }, [state.mode, beginGame]);

    const replayFriend = useCallback(() => {
      firedRef.current = null;
      dispatch({ type: "reset" });
      beginGame("friend");
    }, [beginGame]);

    const goModes = useCallback(() => {
      firedRef.current = null;
      dispatch({ type: "reset" });
    }, []);

    const startChallenge = useCallback(() => {
      if (!challenge) return;
      beginGame("friend", challenge.challengeId);
    }, [challenge, beginGame]);

    const makeCard = useCallback((): string => {
      if (!state.result || typeof document === "undefined") return "";
      try {
        return renderShareCard(state.result);
      } catch {
        return "";
      }
    }, [state.result]);

    const handleShare = useCallback(async () => {
      const result = state.result;
      if (!result) return;
      const outcome = await shareResult({
        title: shareTitle(result),
        text: result.shareText,
        cardDataUrl: makeCard(),
      });
      dispatch({
        type: "share-status",
        status:
          outcome === "shared"
            ? "SHARED"
            : outcome === "copied"
              ? "SHARED VIA CLIPBOARD — THE WEB SHARE API WAS UNAVAILABLE"
              : "COULD NOT SHARE — USE COPY RESULT",
      });
      onShare?.(result);
    }, [state.result, makeCard, onShare]);

    const handleCopy = useCallback(async () => {
      const result = state.result;
      if (!result) return;
      const outcome = await copyText(result.shareText);
      dispatch({
        type: "share-status",
        status: outcome === "copied" ? "RESULT TEXT COPIED" : "COPY FAILED — SELECT THE TEXT MANUALLY",
      });
    }, [state.result]);

    const handleDownload = useCallback(() => {
      const url = makeCard();
      if (!url) {
        dispatch({ type: "share-status", status: "CARD COULD NOT BE RENDERED IN THIS BROWSER" });
        return;
      }
      triggerDownload(url, "human-vs-humanity.png");
      dispatch({ type: "share-status", status: "CARD DOWNLOADED" });
    }, [makeCard]);

    const handleCreateChallenge = useCallback(async () => {
      const result = state.result;
      if (!result || !onChallengeCreate) return;
      dispatch({ type: "challenge-busy", busy: true });
      try {
        const out = await onChallengeCreate(result);
        const id = typeof out === "string" ? out : out?.challengeId ?? "";
        dispatch({ type: "challenge-id", id });
      } catch {
        dispatch({ type: "challenge-id", id: "" });
      }
    }, [state.result, onChallengeCreate]);

    /* ----------------------------------------------------------------- ref */

    useImperativeHandle(
      ref,
      (): HumanVsHumanityRef => ({
        getResult: () => state.result,
        getQuestionIds: () => state.questions.map((q) => q.id),
        reset: () => {
          firedRef.current = null;
          dispatch({ type: "reset" });
        },
      }),
      [state.result, state.questions],
    );

    /* -------------------------------------------------------------- scroll */

    const rootRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      const el = rootRef.current;
      if (!el || typeof el.scrollIntoView !== "function") return;
      el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }, [state.screen, state.index, state.phase, reducedMotion]);

    /* ---------------------------------------------------------------- view */

    const modes: HvhMode[] = useMemo(() => {
      const list = enabledModes && enabledModes.length ? enabledModes : DEFAULT_MODES;
      return list.filter((m) => {
        if (m === "friend" && !challenge) return false;
        return true;
      });
    }, [enabledModes, challenge]);

    const historyIndex = useMemo(
      () => (state.result ? buildQuestionIndex(state.result.roundResults) : new Map<string, HvhQuestion>()),
      [state.result],
    );

    const rootCls = ["hvh-root", className ?? ""].filter(Boolean).join(" ");

    return (
      <div ref={rootRef} className={rootCls} style={style} role="region" aria-label={ariaLabel} lang="en">
        <div className="hvh-backdrop" aria-hidden="true">
          <span className="hvh-orb hvh-orb-1" />
          <span className="hvh-orb hvh-orb-2" />
          <span className="hvh-orb hvh-orb-3" />
          <span className="hvh-grain" />
        </div>

        <div className="hvh-stage">
          {state.screen === "intro" ? (
            <IntroScreen onEnter={() => dispatch({ type: "nav", screen: "modes" })} onHow={() => dispatch({ type: "nav", screen: "how" })} />
          ) : null}

          {state.screen === "how" ? (
            <HowItWorksScreen
              onBack={() => dispatch({ type: "nav", screen: "intro" })}
              onEnter={() => dispatch({ type: "nav", screen: challenge && !state.challengeDeclined ? "challenge" : "modes" })}
            />
          ) : null}

          {state.screen === "modes" ? (
            <ModeSelectScreen
              modes={modes}
              rounds={roundsProp}
              enableCountrySelection={enableCountrySelection}
              countries={countries}
              country={state.country}
              onCountry={(code) => dispatch({ type: "set-country", country: code })}
              onStart={(mode) => beginGame(mode)}
              onBack={() => dispatch({ type: "nav", screen: "intro" })}
              best={state.best}
            />
          ) : null}

          {state.screen === "challenge" && challenge ? (
            <ChallengeIntroScreen
              challenge={challenge}
              onStart={startChallenge}
              onDecline={() => {
                dispatch({ type: "nav", screen: "modes" });
              }}
            />
          ) : null}

          {state.screen === "round" && question ? (
            <RoundScreen
              question={question}
              index={state.index}
              total={state.questions.length}
              phase={state.phase}
              selectedOptionId={state.selected}
              onSelect={handleSelect}
              onLock={handleLock}
              onContinue={handleContinue}
              distribution={state.distribution}
              countryDistribution={state.countryDistribution}
              countryName={countryName(state.country)}
              dataSource={state.dataSource}
              participantsLabel={crowdLabel}
              loading={state.loading}
              loadError={state.loadError}
              roundResult={state.currentRound}
              isLast={state.index === state.questions.length - 1}
              animate={!reducedMotion}
            />
          ) : null}

          {state.screen === "result" && state.result ? (
            <ResultScreen
              result={state.result}
              questionIndex={historyIndex}
              worldStats={worldStats}
              best={state.best}
              isNewBest={state.isNewBest}
              showShareCard={showShareCard}
              showShareText={showShareText}
              showHistory={showHistory}
              shareStatus={state.shareStatus}
              onShare={() => void handleShare()}
              onCopy={() => void handleCopy()}
              onDownload={handleDownload}
              onChallenge={onChallengeCreate ? () => void handleCreateChallenge() : undefined}
              challengeLabel={state.challengeId ?? ""}
              onReplay={replay}
              onMenu={goModes}
              onStartChallenge={replayFriend}
              animate={!reducedMotion}
            />
          ) : null}
        </div>
      </div>
    );
  },
);

export default HumanVsHumanity;
