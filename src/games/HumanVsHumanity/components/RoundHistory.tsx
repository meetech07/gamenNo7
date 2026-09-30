import { useState } from "react";
import { CATEGORY_LABELS, QUESTIONS } from "../data/questions";
import type { HvhQuestion, HvhRoundResult } from "../types";
import { DistributionBars, Note, Stack } from "./Primitives";

type Tag = { label: string; cls: string };

function tagFor(r: HvhRoundResult): Tag {
  if (r.events.includes("total-disagreement")) return { label: "OUTLIER", cls: "hvh-tl-outlier" };
  if (r.events.includes("crowd-match")) return { label: "MATCH", cls: "hvh-tl-match" };
  if (r.events.includes("close-battle")) return { label: "CLOSE", cls: "hvh-tl-close" };
  if (r.events.includes("rare-choice")) return { label: "UNIQUE", cls: "hvh-tl-unique" };
  return { label: "UNIQUE", cls: "hvh-tl-unique" };
}

export function RoundHistory({
  rounds,
  questionById,
  participantsLabel,
}: {
  rounds: HvhRoundResult[];
  questionById: Map<string, HvhQuestion>;
  participantsLabel: string;
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="hvh-timeline">
      {rounds.map((r) => {
        const tag = tagFor(r);
        const rowKey = r.questionId + ":" + r.index;
        const isOpen = open === rowKey;
        const q = questionById.get(r.questionId);
        return (
          <div className="hvh-tl-row" key={rowKey}>
            <button
              type="button"
              className="hvh-tl-head"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : rowKey)}
            >
              <span className="hvh-tl-num">ROUND {r.index + 1}</span>
              <span className="hvh-tl-label">
                {q ? q.prompt : r.playerLabel}
              </span>
              <span className={["hvh-tl-tag", tag.cls].join(" ")}>{tag.label}</span>
              <span className="hvh-tl-num" style={{ minWidth: 0 }}>
                +{r.score}
              </span>
            </button>
            {isOpen ? (
              <div className="hvh-tl-body">
                <Stack gap={8}>
                  <span className="hvh-micro">
                    {CATEGORY_LABELS[r.category] ?? r.category} · DIFFICULTY {r.difficulty}
                  </span>
                  <div className="hvh-compare">
                    <div className="hvh-compare-row">
                      <span className="hvh-compare-name" style={{ color: "#fde68a" }}>
                        YOU
                      </span>
                      <span className="hvh-mode-blurb hvh-full" style={{ textAlign: "right" }}>
                        {r.playerLabel} · {r.playerPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="hvh-compare-row">
                      <span className="hvh-compare-name">{participantsLabel.toUpperCase()}</span>
                      <span className="hvh-mode-blurb hvh-full" style={{ textAlign: "right" }}>
                        {r.topLabel} · {r.topPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <DistributionBars
                    distribution={r.distribution}
                    question={q ?? fallbackQuestion(r)}
                    playerOptionId={r.playerOptionId}
                  />
                  <div className="hvh-stats">
                    <div className="hvh-stat">
                      <span className="hvh-stat-value">{r.alignment}%</span>
                      <span className="hvh-stat-name">ALIGNMENT</span>
                    </div>
                    <div className="hvh-stat">
                      <span className="hvh-stat-value">{r.individuality}%</span>
                      <span className="hvh-stat-name">INDIVIDUALITY</span>
                    </div>
                    <div className="hvh-stat">
                      <span className="hvh-stat-value">+{r.score}</span>
                      <span className="hvh-stat-name">ROUND SCORE</span>
                    </div>
                  </div>
                  {r.dataSource === "sample" ? (
                    <Note>Sample crowd data for this round. Not real-world statistics.</Note>
                  ) : null}
                </Stack>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function fallbackQuestion(r: HvhRoundResult): HvhQuestion {
  const options = r.distribution.options.map((o) => ({ id: o.optionId, label: o.optionId }));
  return {
    id: r.questionId,
    category: r.category,
    axis: r.axis,
    difficulty: r.difficulty as 1 | 2 | 3,
    prompt: r.questionId,
    options,
    sample: r.distribution.options.map((o) => o.percentage),
  };
}

export function buildQuestionIndex(rounds: HvhRoundResult[]): Map<string, HvhQuestion> {
  const map = new Map<string, HvhQuestion>();
  rounds.forEach((r) => {
    if (!map.has(r.questionId)) {
      const found = QUESTIONS.find((q) => q.id === r.questionId);
      map.set(r.questionId, found ?? fallbackQuestion(r));
    }
  });
  return map;
}
