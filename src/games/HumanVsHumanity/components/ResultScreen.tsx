import { useCountUp } from "../utils/hooks";
import type { HvhGameResult, HvhQuestion, HvhWorldStats } from "../types";
import { RoundHistory } from "./RoundHistory";
import { ShareCard } from "./ShareCard";
import { Button, MetricGrid, Note, Panel, Row, Stack, Stat } from "./Primitives";

export interface ResultScreenProps {
  result: HvhGameResult;
  questionIndex: Map<string, HvhQuestion>;
  worldStats?: HvhWorldStats;
  best: number;
  isNewBest: boolean;
  showShareCard: boolean;
  showShareText: boolean;
  showHistory: boolean;
  shareStatus: string;
  onShare: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onChallenge?: () => void;
  challengeLabel: string;
  onReplay: () => void;
  onMenu: () => void;
  onStartChallenge: () => void;
  animate: boolean;
}

const OUTCOME: Record<string, { title: string; cls: string; line: string }> = {
  win: {
    title: "YOU WON",
    cls: "hvh-outcome-win",
    line: "You finished above your opponent on the same questions.",
  },
  loss: {
    title: "YOUR FRIEND WON",
    cls: "hvh-outcome-loss",
    line: "Same questions, same crowd. They read it better this time.",
  },
  tie: {
    title: "TIE",
    cls: "hvh-outcome-tie",
    line: "Identical scores. Nobody wins a draw, both of you survived.",
  },
};

export function ResultScreen(props: ResultScreenProps) {
  const { result, worldStats, animate } = props;
  const animatedScore = useCountUp(result.score, 1100, animate);
  const outcome = result.challengeOutcome ? OUTCOME[result.challengeOutcome] : null;

  return (
    <div className="hvh-stack hvh-gap-24">
      <div className="hvh-center hvh-stack hvh-gap-8 hvh-fade">
        <span className="hvh-eyebrow">HUMAN VS HUMANITY</span>
        <span className="hvh-micro">YOUR BATTLE SCORE</span>
        <span className="hvh-score-value">{animatedScore}</span>
        {props.isNewBest ? (
          <span className="hvh-badge" style={{ color: "#fde68a", background: "rgba(253,230,138,0.12)", borderColor: "rgba(253,230,138,0.3)" }}>
            NEW PERSONAL BEST
          </span>
        ) : null}
      </div>

      <Panel className="hvh-fade-1">
        <div className="hvh-center hvh-stack hvh-gap-10">
          <span className="hvh-eyebrow">YOUR HUMANITY PROFILE</span>
          <h2 className="hvh-profile-name">{result.profile.name}</h2>
          <p className="hvh-lede" style={{ maxWidth: 520, margin: "0 auto" }}>
            {result.profile.description}
          </p>
        </div>
      </Panel>

      {outcome ? (
        <Panel className="hvh-fade-1">
          <div className="hvh-center hvh-stack hvh-gap-10">
            <span className="hvh-eyebrow">FRIEND BATTLE RESULT</span>
            <p className={["hvh-outcome", outcome.cls].join(" ")}>{outcome.title}</p>
            <p className="hvh-mode-blurb">{outcome.line}</p>
            <div className="hvh-compare hvh-full" style={{ maxWidth: 420, margin: "0 auto" }}>
              <div className="hvh-compare-row">
                <span className="hvh-compare-name">YOU</span>
                <span className="hvh-compare-score">{result.score}</span>
              </div>
              <div className="hvh-compare-row">
                <span className="hvh-compare-name">THEM</span>
                <span className="hvh-compare-score">{result.challengeHostScore}</span>
              </div>
            </div>
            <Button onClick={props.onStartChallenge} variant="ghost" small>
              REMATCH
            </Button>
          </div>
        </Panel>
      ) : null}

      <div className="hvh-fade-2">
        <MetricGrid metrics={result.metrics} />
      </div>

      <Panel className="hvh-fade-2">
        <Stack gap={14}>
          <div className="hvh-spread">
            <span className="hvh-eyebrow">YOUR HUMANITY BATTLE</span>
            <span className="hvh-micro">{result.rounds} ROUNDS</span>
          </div>
          <div className="hvh-stats">
            <Stat value={result.summary.crowdMatches} name="CROWD MATCHES" />
            <Stat value={result.summary.uniqueChoices} name="UNIQUE CHOICES" />
            <Stat value={`${result.metrics.adaptability}%`} name="ADAPTABILITY" />
            <Stat value={`${result.metrics.consistency}%`} name="CONSISTENCY" />
          </div>
          <div className="hvh-compare">
            <div className="hvh-compare-row">
              <span className="hvh-compare-name" style={{ color: "#6ee7b7" }}>
                BIGGEST STRENGTH
              </span>
              <span className="hvh-mode-blurb hvh-full" style={{ textAlign: "right" }}>
                {result.summary.biggestStrength}
              </span>
            </div>
            <div className="hvh-compare-row">
              <span className="hvh-compare-name" style={{ color: "#fda4af" }}>
                WATCH OUT FOR
              </span>
              <span className="hvh-mode-blurb hvh-full" style={{ textAlign: "right" }}>
                {result.summary.biggestWatchout}
              </span>
            </div>
          </div>
          <div className="hvh-stats">
            <Stat value={result.summary.rareChoices} name="RARE CHOICES" />
            <Stat value={result.summary.closeBattles} name="CLOSE BATTLES" />
            <Stat value={result.summary.twists} name="PATTERN TWISTS" />
            <Stat value={result.summary.declines} name="DECLINED" />
            <Stat value={result.dataSource === "sample" ? "SAMPLE" : "LIVE"} name="CROWD DATA" />
          </div>
          <Note>
            {result.dataSource === "sample"
              ? "Every crowd shown in this game was built-in sample data labelled GAME HUMANITY. No real-world statistics were used or implied."
              : "Real participation data supplied by the host site for this battle."}
          </Note>
        </Stack>
      </Panel>

      {worldStats ? (
        <Panel className="hvh-fade-2">
          <Stack gap={12}>
            <span className="hvh-eyebrow">WORLD COMPARISON</span>
            <div className="hvh-stats">
              <Stat value={worldStats.totalPlayers.toLocaleString()} name="PARTICIPATING PLAYERS" />
              <Stat value={worldStats.averageScore} name="AVERAGE SCORE" />
              <Stat value={`${worldStats.averageAlignment}%`} name="AVERAGE ALIGNMENT" />
            </div>
            {typeof worldStats.percentile === "number" ? (
              <p className="hvh-lede">
                You performed better than <strong className="hvh-accent">{worldStats.percentile}%</strong> of
                participating players.
              </p>
            ) : null}
            <Note>
              Figures supplied by the host site. The component never invents rankings, player counts
              or percentiles.
            </Note>
          </Stack>
        </Panel>
      ) : null}

      {props.showShareCard ? (
        <div className="hvh-center hvh-fade-3">
          <ShareCard result={result} />
        </div>
      ) : null}

      <Panel className="hvh-fade-3">
        <Stack gap={12}>
          <span className="hvh-eyebrow">SHARE</span>
          <Row>
            <Button onClick={props.onShare}>SHARE RESULT</Button>
            <Button onClick={props.onCopy} variant="ghost">
              COPY RESULT
            </Button>
            <Button onClick={props.onDownload} variant="ghost">
              DOWNLOAD CARD
            </Button>
            {props.onChallenge ? <Button onClick={props.onChallenge} variant="ghost">CHALLENGE A FRIEND</Button> : null}
          </Row>
          <span className="hvh-micro" style={{ color: props.shareStatus ? "#7ff0ff" : "#6f7da6" }}>
            {props.shareStatus || "SHARE USES THE WEB SHARE API, WITH COPY AS FALLBACK"}
          </span>
          {props.challengeLabel ? (
            <Note>
              CHALLENGE ID <strong>{props.challengeLabel}</strong> — send this to your friend. Your
              host decides the URL.
            </Note>
          ) : null}
          {props.showShareText ? (
            <div className="hvh-demo">
              <span className="hvh-micro">SHARE TEXT</span>
              <span className="hvh-step-body">{result.shareText}</span>
            </div>
          ) : null}
        </Stack>
      </Panel>

      {props.showHistory ? (
        <Panel className="hvh-fade-3">
          <Stack gap={12}>
            <span className="hvh-eyebrow">ROUND HISTORY</span>
            <RoundHistory
              rounds={result.roundResults}
              questionById={props.questionIndex}
              participantsLabel={result.participantsLabel}
            />
          </Stack>
        </Panel>
      ) : null}

      <div className="hvh-footer hvh-fade-4">
        <span className="hvh-best">
          {props.best > 0 ? `PERSONAL BEST · ${props.best}` : "FIRST GAME"}
        </span>
        <Row>
          <Button onClick={props.onReplay} small>
            PLAY AGAIN
          </Button>
          <Button onClick={props.onMenu} variant="ghost" small>
            CHANGE MODE
          </Button>
        </Row>
      </div>
    </div>
  );
}
