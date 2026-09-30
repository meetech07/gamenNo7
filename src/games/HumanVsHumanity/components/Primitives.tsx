import type { CSSProperties, ReactNode } from "react";
import { EVENT_DETAIL, EVENT_LABELS, HEADLINE_DETAIL, HEADLINE_LABELS, METRIC_LABELS } from "../data/copy";
import { getStats } from "../engine/core";
import type {
  HvhEventType,
  HvhHeadline,
  HvhHumanityDistribution,
  HvhMetrics,
  HvhQuestion,
} from "../types";

/* ------------------------------------------------------------------ shell */

export function Panel({
  children,
  tight,
  flush,
  className,
  style,
}: {
  children: ReactNode;
  tight?: boolean;
  flush?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const cls = [
    "hvh-panel",
    tight ? "hvh-panel-tight" : "",
    flush ? "hvh-panel-flush" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  small,
  block,
  type = "button",
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  small?: boolean;
  block?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  const cls = [
    "hvh-button",
    variant === "ghost" ? "hvh-button-ghost" : "",
    small ? "hvh-button-sm" : "",
    block ? "hvh-button-block" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export function Stack({
  children,
  gap = 12,
  className,
  style,
}: {
  children: ReactNode;
  gap?: 6 | 8 | 10 | 12 | 14 | 16 | 18 | 24 | 32;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={["hvh-stack", `hvh-gap-${gap}`, className ?? ""].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}

export function Row({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={["hvh-row", className ?? ""].filter(Boolean).join(" ")} style={style}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- copy */

export function SourcePill({ label, live, note }: { label: string; live?: boolean; note?: string }) {
  return (
    <span
      className={["hvh-source-pill", live ? "hvh-source-pill-live" : ""].filter(Boolean).join(" ")}
      title={note}
    >
      {label}
    </span>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="hvh-note">{children}</p>;
}

export function Headline({ id }: { id: HvhHeadline }) {
  return (
    <div className="hvh-center hvh-stack hvh-gap-6">
      <p className="hvh-headline">{HEADLINE_LABELS[id]}</p>
      <p className="hvh-lede hvh-muted" style={{ fontSize: 14 }}>
        {HEADLINE_DETAIL[id]}
      </p>
    </div>
  );
}

const EVENT_TONE: Record<HvhEventType, string> = {
  "crowd-match": "hvh-event-crowd",
  "rare-choice": "hvh-event-rare",
  "close-battle": "hvh-event-info",
  "perfect-split": "hvh-event-info",
  "total-disagreement": "hvh-event-rare",
  "humanity-twist": "hvh-event-crowd",
};

export function EventBadges({ events }: { events: HvhEventType[] }) {
  if (!events.length) return null;
  return (
    <div className="hvh-events">
      {events.map((e) => (
        <span key={e} className={["hvh-event", EVENT_TONE[e]].filter(Boolean).join(" ")} title={EVENT_DETAIL[e]}>
          {EVENT_LABELS[e]}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- data */

export function DistributionBars({
  distribution,
  question,
  playerOptionId,
  animate = true,
}: {
  distribution: HvhHumanityDistribution;
  question: HvhQuestion;
  playerOptionId?: string;
  animate?: boolean;
}) {
  const stats = getStats(distribution, question);
  return (
    <div className="hvh-bars" role="list">
      {stats.rows.map((row, i) => {
        const isYou = row.optionId === playerOptionId;
        const isTop = row.optionId === stats.top.optionId;
        return (
          <div className="hvh-bar-row" role="listitem" key={row.optionId}>
            <div
              className="hvh-bar-head"
              style={animate ? { animationDelay: `${120 + i * 110}ms` } : undefined}
            >
              <span className="hvh-bar-label">
                {row.optionId.toUpperCase()}. {row.label}
              </span>
              {isYou ? <span className="hvh-bar-tag hvh-bar-tag-you">YOU</span> : null}
              {isTop ? <span className="hvh-bar-tag">MOST SELECTED</span> : null}
              <span className="hvh-bar-value">{row.percentage.toFixed(1)}%</span>
            </div>
            <div className="hvh-bar-track">
              <div
                className={[
                  "hvh-bar-fill",
                  isYou ? "hvh-bar-fill-you" : "",
                  !isYou && isTop ? "hvh-bar-fill-top" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  width: `${Math.max(2, row.percentage)}%`,
                  ...(animate ? { animationDelay: `${120 + i * 110}ms` } : null),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MetricGrid({ metrics, delay = 0 }: { metrics: HvhMetrics; delay?: number }) {
  const keys: Array<keyof HvhMetrics> = ["alignment", "individuality", "adaptability", "consistency", "risk"];
  return (
    <div className="hvh-metrics">
      {keys.map((k, i) => (
        <div className="hvh-metric" key={k}>
          <span className="hvh-metric-name">{METRIC_LABELS[k]}</span>
          <span className="hvh-metric-value">{metrics[k]}%</span>
          <span className="hvh-metric-track">
            <span
              className="hvh-metric-fill"
              style={{ width: `${Math.max(1.5, metrics[k])}%`, animationDelay: `${delay + i * 90}ms` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export function Stat({ value, name }: { value: ReactNode; name: string }) {
  return (
    <div className="hvh-stat">
      <span className="hvh-stat-value">{value}</span>
      <span className="hvh-stat-name">{name}</span>
    </div>
  );
}

export function Progress({ index, total }: { index: number; total: number }) {
  const pct = Math.round(((index + 1) / Math.max(1, total)) * 100);
  return (
    <div className="hvh-stack hvh-gap-8">
      <div className="hvh-spread">
        <span className="hvh-micro">ROUND {Math.min(index + 1, total)} / {total}</span>
        <span className="hvh-micro">{pct}% COMPLETE</span>
      </div>
      <div className="hvh-progress">
        <div className="hvh-progress-track">
          <div className="hvh-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="hvh-progress-dots" aria-hidden="true">
          {Array.from({ length: Math.min(total, 12) }).map((_, i) => (
            <span
              key={i}
              className={[
                "hvh-dot",
                i < index ? "hvh-dot-on" : "",
                i === index ? "hvh-dot-now" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
