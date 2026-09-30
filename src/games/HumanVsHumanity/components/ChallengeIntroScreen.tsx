import { METRIC_LABELS } from "../data/copy";
import type { HvhChallengeInput } from "../types";
import { Button, Note, Panel, Row, Stack } from "./Primitives";

export function ChallengeIntroScreen({
  challenge,
  onStart,
  onDecline,
}: {
  challenge: HvhChallengeInput;
  onStart: () => void;
  onDecline: () => void;
}) {
  const hasHost = typeof challenge.hostScore === "number";
  return (
    <div className="hvh-stack hvh-gap-24">
      <div className="hvh-stack hvh-gap-8 hvh-fade">
        <span className="hvh-eyebrow">FRIEND BATTLE</span>
        <h2 className="hvh-h2">
          {challenge.hostName ? `${challenge.hostName.toUpperCase()} ` : ""}ENTERED THE HUMANITY
          BATTLE
        </h2>
      </div>

      <Panel tight className="hvh-fade-1">
        <Stack gap={12}>
          {hasHost ? (
            <Stack gap={6}>
              <span className="hvh-micro">THEIR HUMANITY BATTLE SCORE</span>
              <span className="hvh-score-value" style={{ fontSize: 72, textAlign: "left" }}>
                {challenge.hostScore}
              </span>
            </Stack>
          ) : (
            <Note>
              Your opponent has not finished a battle yet. Play the same questions, set the target
              yourself.
            </Note>
          )}

          {challenge.hostProfile ? (
            <div>
              <span className="hvh-micro">THEIR PROFILE</span>
              <p className="hvh-h3" style={{ marginTop: 4 }}>
                {challenge.hostProfile}
              </p>
            </div>
          ) : null}

          {challenge.hostMetrics ? (
            <div className="hvh-stats">
              {Object.entries(METRIC_LABELS).map(([key, label]) => {
                const value = (challenge.hostMetrics as Record<string, number | undefined>)[key];
                if (typeof value !== "number") return null;
                return (
                  <div className="hvh-stat" key={key}>
                    <span className="hvh-stat-value">{value}%</span>
                    <span className="hvh-stat-name">{label}</span>
                  </div>
                );
              })}
            </div>
          ) : null}

          <Note>
            Both players get the same question sequence. Same questions, same crowd, same order.
            Higher score takes it. No seeded advantages, no hidden rerolls.
          </Note>
        </Stack>
      </Panel>

      <Row className="hvh-fade-2">
        <Button onClick={onStart}>{hasHost ? "BEAT THAT SCORE" : "START FRIEND BATTLE"}</Button>
        <Button onClick={onDecline} variant="ghost">
          DECLINE
        </Button>
      </Row>
    </div>
  );
}
