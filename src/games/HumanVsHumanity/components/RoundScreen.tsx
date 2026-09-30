import { CATEGORY_LABELS } from "../data/questions";
import type {
  HvhDataSource,
  HvhHumanityDistribution,
  HvhQuestion,
  HvhRoundResult,
} from "../types";
import {
  Button,
  DistributionBars,
  EventBadges,
  Headline,
  Note,
  Panel,
  Progress,
  SourcePill,
  Stack,
  Stat,
} from "./Primitives";

export type RoundPhase = "choose" | "locked" | "reveal" | "battle" | "summary";

const OPTION_KEYS = ["A", "B", "C", "D", "E"];

export function RoundScreen({
  question,
  index,
  total,
  phase,
  selectedOptionId,
  onSelect,
  onLock,
  onContinue,
  distribution,
  countryDistribution,
  countryName,
  dataSource,
  participantsLabel,
  loading,
  loadError,
  roundResult,
  isLast,
  animate,
}: {
  question: HvhQuestion;
  index: number;
  total: number;
  phase: RoundPhase;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  onLock: () => void;
  onContinue: () => void;
  distribution: HvhHumanityDistribution | null;
  countryDistribution?: HvhHumanityDistribution | null;
  countryName?: string;
  dataSource: HvhDataSource;
  participantsLabel: string;
  loading: boolean;
  loadError: boolean;
  roundResult: HvhRoundResult | null;
  isLast: boolean;
  animate: boolean;
}) {
  return (
    <div className="hvh-stack hvh-gap-24">
      <Progress index={index} total={total} />

      <Stack gap={10} className="hvh-fade">
        <div className="hvh-row">
          <span className="hvh-badge">{CATEGORY_LABELS[question.category] ?? question.category}</span>
          <SourcePill
            label={dataSource === "sample" ? participantsLabel : participantsLabel}
            live={dataSource !== "sample"}
            note={
              dataSource === "sample"
                ? "Built-in sample crowd. Game numbers, not real-world statistics."
                : "Real participation data supplied by the host site."
            }
          />
        </div>
        <h2 className="hvh-question">{question.prompt}</h2>
        {question.sub ? <p className="hvh-lede">{question.sub}</p> : null}
        <p className="hvh-micro">WHICH ONE DO YOU ACTUALLY WANT?</p>
      </Stack>

      {phase === "choose" || phase === "locked" ? (
        <div
          className="hvh-options"
          role="radiogroup"
          aria-label="Your choice"
          key={question.id + phase}
        >
          {question.options.map((opt, i) => {
            const selected = opt.id === selectedOptionId;
            const locked = phase === "locked";
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={locked && !selected}
                className={[
                  "hvh-option",
                  selected ? "hvh-option-selected" : "",
                  locked ? "hvh-option-locked" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ animationDelay: `${i * 70}ms` }}
                onClick={() => onSelect(opt.id)}
              >
                <span className="hvh-option-key">{OPTION_KEYS[i]}</span>
                <span className="hvh-option-text">{opt.label}</span>
                {selected ? <span className="hvh-option-you">YOUR PICK</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {phase === "choose" ? (
        <div className="hvh-lock">
          <span className="hvh-micro">YOUR CHOICE</span>
          <span className="hvh-lock-pick">
            {selectedOptionId
              ? `${OPTION_KEYS[question.options.findIndex((o) => o.id === selectedOptionId)]}. ${
                  question.options.find((o) => o.id === selectedOptionId)?.label
                }`
              : "Pick an option first"}
          </span>
          <Button onClick={onLock} disabled={!selectedOptionId}>
            LOCK YOUR DECISION
          </Button>
          <Note>Once locked, your answer is stored and cannot be changed.</Note>
        </div>
      ) : null}

      {phase === "locked" ? (
        <div className="hvh-lock">
          <span className="hvh-micro">LOCKED IN</span>
          <span className="hvh-lock-pick">
            {selectedOptionId
              ? question.options.find((o) => o.id === selectedOptionId)?.label
              : ""}
          </span>
          <span className="hvh-micro" style={{ animation: "hvh-shimmer 1400ms linear infinite" }}>
            WAITING FOR {participantsLabel}
          </span>
        </div>
      ) : null}

      {loading ? (
        <Panel tight>
          <Stack gap={10}>
            <span className="hvh-micro">FETCHING PARTICIPATION</span>
            <div className="hvh-skeleton" style={{ width: "82%" }} />
            <div className="hvh-skeleton" style={{ width: "64%" }} />
            <div className="hvh-skeleton" style={{ width: "73%" }} />
          </Stack>
        </Panel>
      ) : null}

      {loadError ? (
        <Note>
          Live participation data could not be loaded for this round, so the built-in sample crowd is
          being used and labelled as such.
        </Note>
      ) : null}

      {phase === "reveal" && distribution ? (
        <div className="hvh-reveal" key={"reveal-" + question.id}>
          <Stack gap={6}>
            <span className="hvh-eyebrow" style={{ color: "#7ff0ff" }}>
              {participantsLabel.toUpperCase()} HAS ANSWERED
            </span>
            <span className="hvh-h3">
              {distribution.totalResponses.toLocaleString()} decisions on this one
            </span>
            <SourcePill
              label={dataSource === "sample" ? "GAME HUMANITY · SAMPLE" : "PARTICIPATING PLAYERS"}
              live={dataSource !== "sample"}
            />
          </Stack>
          <DistributionBars
            distribution={distribution}
            question={question}
            playerOptionId={selectedOptionId ?? undefined}
            animate={animate}
          />
          <div className="hvh-demo">
            <span className="hvh-micro">MOST SELECTED</span>
            <span className="hvh-step-title">{question.options.find((o) => o.id === topOf(distribution, question))?.label}</span>
          </div>
          <Button onClick={onContinue} block>
            SEE THE BATTLE
          </Button>
        </div>
      ) : null}

      {countryDistribution && countryName && (phase === "reveal" || phase === "battle") ? (
        <Panel tight>
          <Stack gap={10}>
            <span className="hvh-micro">PARTICIPATING PLAYERS IN {countryName.toUpperCase()}</span>
            <DistributionBars
              distribution={countryDistribution}
              question={question}
              playerOptionId={selectedOptionId ?? undefined}
              animate={animate}
            />
            <Note>
              Scoped to players who chose this region in-game. Participation data only — no claim is
              made about the wider population.
            </Note>
          </Stack>
        </Panel>
      ) : null}

      {phase === "battle" && roundResult ? (
        <Stack gap={16} key={"battle-" + question.id}>
          <div className="hvh-vs">
            <div className="hvh-side hvh-side-you">
              <span className="hvh-side-name">YOU</span>
              <span className="hvh-side-pick">{roundResult.playerLabel}</span>
              <span className="hvh-side-pct">{roundResult.playerPercentage.toFixed(1)}%</span>
              <span className="hvh-micro">OF {participantsLabel.toUpperCase()}</span>
            </div>
            <div className="hvh-vs-mark">VS</div>
            <div className="hvh-side hvh-side-them">
              <span className="hvh-side-name">{participantsLabel.toUpperCase()}</span>
              <span className="hvh-side-pick">{roundResult.topLabel}</span>
              <span className="hvh-side-pct">{roundResult.topPercentage.toFixed(1)}%</span>
              <span className="hvh-micro">MOST SELECTED</span>
            </div>
          </div>
          <Headline id={roundResult.headline} />
          <EventBadges events={roundResult.events} />
          <Note>
            Matching the crowd is not the safe answer and going rogue is not the smart one. Both are
            valid positions. The game only tells you where you stood.
          </Note>
          <Button onClick={onContinue} block>
            ROUND RESULT
          </Button>
        </Stack>
      ) : null}

      {phase === "summary" && roundResult ? (
        <Panel key={"sum-" + question.id} className="hvh-fade">
          <Stack gap={16}>
            <div className="hvh-spread">
              <span className="hvh-eyebrow">ROUND {roundResult.index + 1}</span>
              <span className="hvh-micro">SCORE +{roundResult.score}</span>
            </div>
            <div className="hvh-compare">
              <div className="hvh-compare-row">
                <span className="hvh-compare-name">YOU</span>
                <span className="hvh-mode-blurb hvh-full" style={{ textAlign: "right" }}>
                  {roundResult.playerLabel}
                </span>
              </div>
              <div className="hvh-compare-row">
                <span className="hvh-compare-name">{participantsLabel.toUpperCase()}</span>
                <span className="hvh-mode-blurb hvh-full" style={{ textAlign: "right" }}>
                  {roundResult.topLabel}
                </span>
              </div>
            </div>
            <div className="hvh-stats">
              <Stat value={`${roundResult.alignment}%`} name="ALIGNMENT" />
              <Stat value={`${roundResult.individuality}%`} name="INDIVIDUALITY" />
              <Stat value={`${roundResult.risk}%`} name="RISK" />
            </div>
            <DistributionBars
              distribution={roundResult.distribution}
              question={question}
              playerOptionId={roundResult.playerOptionId}
              animate={animate}
            />
            <EventBadges events={roundResult.events} />
            <Button onClick={onContinue} block>
              {isLast ? "FINAL RESULT" : "CONTINUE"}
            </Button>
          </Stack>
        </Panel>
      ) : null}
    </div>
  );
}

function topOf(distribution: HvhHumanityDistribution, question: HvhQuestion): string {
  return (
    [...distribution.options].sort((a, b) => b.percentage - a.percentage)[0]?.optionId ??
    question.options[0].id
  );
}
