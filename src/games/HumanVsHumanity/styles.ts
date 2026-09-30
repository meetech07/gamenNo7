/**
 * Human vs Humanity — stylesheet.
 *
 * Injected at runtime into document.head as a single <style id="hvh-styles">.
 * Every selector is scoped under .hvh-root and every class is hvh- prefixed,
 * so nothing here can reach out and restyle the host website.
 *
 * There are no global element selectors, no `body`, no bare `*`. The only
 * `!important` declarations are scoped to `.hvh-root` inside the
 * `prefers-reduced-motion` block below.
 */
export const HVH_STYLE_ID = "hvh-styles";

export const HVH_STYLES = `
.hvh-root {
  all: initial;
  display: block;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 560px;
  padding: 0;
  margin: 0;
  font-family: "Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #e9ecf8;
  background: #05060d;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  unicode-bidi: isolate;
  isolation: isolate;
  overflow: hidden;
}

.hvh-root *,
.hvh-root *::before,
.hvh-root *::after {
  box-sizing: border-box;
}

.hvh-root h1,
.hvh-root h2,
.hvh-root h3,
.hvh-root h4,
.hvh-root p,
.hvh-root ul,
.hvh-root ol,
.hvh-root li,
.hvh-root figure {
  margin: 0;
  padding: 0;
  list-style: none;
  font-weight: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

.hvh-root button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-align: inherit;
  appearance: none;
  -webkit-appearance: none;
}

.hvh-root input,
.hvh-root select {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
}

.hvh-root a {
  color: inherit;
  text-decoration: none;
}

.hvh-root strong { font-weight: 700; }
.hvh-root em { font-style: normal; }
.hvh-root svg { display: block; }

/* ------------------------------------------------------------------ shell */

.hvh-stage {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 72px;
  min-height: 520px;
}

.hvh-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(120% 90% at 50% -20%, #141a3a 0%, #080a18 45%, #05060d 100%);
}

.hvh-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.5;
  will-change: transform;
}
.hvh-orb-1 {
  width: 420px; height: 420px; top: -140px; left: -80px;
  background: radial-gradient(circle, #22d3ee 0%, rgba(34, 211, 238, 0) 70%);
  animation: hvh-drift-a 22s ease-in-out infinite;
}
.hvh-orb-2 {
  width: 460px; height: 460px; bottom: -180px; right: -100px;
  background: radial-gradient(circle, #8b5cf6 0%, rgba(139, 92, 246, 0) 70%);
  animation: hvh-drift-b 27s ease-in-out infinite;
}
.hvh-orb-3 {
  width: 320px; height: 320px; top: 42%; left: 46%;
  background: radial-gradient(circle, #f472b6 0%, rgba(244, 114, 182, 0) 70%);
  opacity: 0.28;
  animation: hvh-drift-c 31s ease-in-out infinite;
}

.hvh-grain {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.35;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(100% 70% at 50% 0%, #000 0%, transparent 85%);
  -webkit-mask-image: radial-gradient(100% 70% at 50% 0%, #000 0%, transparent 85%);
}

/* ------------------------------------------------------------- typography */

.hvh-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #8ea0c9;
}

.hvh-display {
  font-size: clamp(34px, 8vw, 74px);
  font-weight: 800;
  line-height: 0.94;
  letter-spacing: -0.035em;
  background: linear-gradient(120deg, #ffffff 8%, #a5b4fc 45%, #22d3ee 92%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.hvh-h2 {
  font-size: clamp(24px, 5vw, 40px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.03em;
  color: #f4f6ff;
}

.hvh-h3 {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: #f4f6ff;
}

.hvh-lede {
  font-size: clamp(15px, 2.2vw, 18px);
  line-height: 1.62;
  color: #a9b6d6;
}

.hvh-micro {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6f7da6;
}

.hvh-accent { color: #22d3ee; }
.hvh-muted { color: #8492b8; }

/* ----------------------------------------------------------------- panels */

.hvh-panel {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.055) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 26px 24px;
  box-shadow: 0 24px 70px -30px rgba(0, 0, 0, 0.9);
}

.hvh-panel-flush { padding: 0; overflow: hidden; }
.hvh-panel-tight { padding: 18px 18px; border-radius: 18px; }

.hvh-stack { display: flex; flex-direction: column; }
.hvh-gap-6 { gap: 6px; }
.hvh-gap-8 { gap: 8px; }
.hvh-gap-10 { gap: 10px; }
.hvh-gap-12 { gap: 12px; }
.hvh-gap-14 { gap: 14px; }
.hvh-gap-18 { gap: 18px; }
.hvh-gap-24 { gap: 24px; }
.hvh-gap-32 { gap: 32px; }

.hvh-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hvh-spread {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hvh-center { text-align: center; }
.hvh-full { width: 100%; }

/* ---------------------------------------------------------------- buttons */

.hvh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 50px;
  padding: 0 26px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #04060f;
  background: linear-gradient(120deg, #67e8f9 0%, #818cf8 100%);
  box-shadow: 0 14px 34px -14px rgba(99, 179, 255, 0.75);
  transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
}
.hvh-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 20px 40px -14px rgba(99, 179, 255, 0.85); }
.hvh-button:active:not(:disabled) { transform: translateY(0); }
.hvh-button:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.hvh-button:focus-visible { outline: 2px solid #22d3ee; outline-offset: 3px; }

.hvh-button-ghost {
  color: #cfd9f5;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: none;
}
.hvh-button-ghost:hover:not(:disabled) { box-shadow: 0 16px 34px -22px rgba(0, 0, 0, 0.9); }

.hvh-button-sm { min-height: 40px; padding: 0 18px; font-size: 11px; }
.hvh-button-block { width: 100%; }

/* --------------------------------------------------------------- progress */

.hvh-progress {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hvh-progress-track {
  position: relative;
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.hvh-progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #22d3ee, #818cf8);
  transition: width 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hvh-progress-dots { display: flex; gap: 5px; }
.hvh-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  transition: background 240ms ease, transform 240ms ease;
}
.hvh-dot-on { background: linear-gradient(120deg, #67e8f9, #818cf8); transform: scale(1.25); }
.hvh-dot-now { background: #ffffff; transform: scale(1.4); }

/* ------------------------------------------------------------- mode cards */

.hvh-modes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.hvh-mode {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  text-align: left;
  padding: 20px 18px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.035);
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}
.hvh-mode:hover {
  transform: translateY(-3px);
  border-color: rgba(129, 140, 248, 0.6);
  background: rgba(129, 140, 248, 0.1);
}
.hvh-mode:focus-visible { outline: 2px solid #818cf8; outline-offset: 2px; }
.hvh-mode-name { font-size: 15px; font-weight: 800; letter-spacing: 0.04em; }
.hvh-mode-blurb { font-size: 13px; line-height: 1.5; color: #9dabcf; }
.hvh-badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #9ff0ff;
  background: rgba(34, 211, 238, 0.12);
  border: 1px solid rgba(34, 211, 238, 0.28);
}

/* ---------------------------------------------------------------- country */

.hvh-country {
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #e9ecf8;
  font-size: 14px;
  font-weight: 600;
}
.hvh-country option { background: #0b0f20; color: #e9ecf8; }
.hvh-country:focus-visible { outline: 2px solid #22d3ee; outline-offset: 2px; }

/* ---------------------------------------------------------------- options */

.hvh-question {
  font-size: clamp(21px, 4vw, 34px);
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -0.028em;
  color: #f7f9ff;
}

.hvh-options { display: flex; flex-direction: column; gap: 10px; }

.hvh-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.035);
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
  animation: hvh-rise 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hvh-option:hover { transform: translateX(4px); border-color: rgba(129, 140, 248, 0.55); }
.hvh-option:focus-visible { outline: 2px solid #22d3ee; outline-offset: 2px; }

.hvh-option-selected {
  border-color: rgba(103, 232, 249, 0.85);
  background: linear-gradient(100deg, rgba(34, 211, 238, 0.16), rgba(129, 140, 248, 0.12));
  box-shadow: 0 18px 44px -26px rgba(34, 211, 238, 0.9);
}
.hvh-option-selected:hover { transform: none; }

.hvh-option-locked { opacity: 0.55; cursor: default; }
.hvh-option-locked:hover { transform: none; border-color: rgba(255, 255, 255, 0.1); }

.hvh-option-key {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #a9b6d6;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.hvh-option-selected .hvh-option-key {
  color: #04060f;
  background: linear-gradient(120deg, #67e8f9, #818cf8);
  border-color: transparent;
}

.hvh-option-text { font-size: 15px; font-weight: 600; line-height: 1.4; color: #e4e9fb; }
.hvh-option-you {
  margin-left: auto;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #7ff0ff;
}

/* ----------------------------------------------------------------- lock in */

.hvh-lock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 22px;
  border-radius: 18px;
  border: 1px dashed rgba(103, 232, 249, 0.4);
  background: rgba(34, 211, 238, 0.06);
  animation: hvh-pop 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hvh-lock-pick { font-size: 17px; font-weight: 800; color: #f4f6ff; }

/* ----------------------------------------------------------------- reveal */

.hvh-reveal {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: linear-gradient(180deg, rgba(20, 26, 58, 0.85), rgba(8, 10, 24, 0.9));
  animation: hvh-pop 460ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hvh-bars { display: flex; flex-direction: column; gap: 11px; }

.hvh-bar-row { display: flex; flex-direction: column; gap: 6px; }

.hvh-bar-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #b8c3e2;
  animation: hvh-slide 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hvh-bar-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hvh-bar-value { font-variant-numeric: tabular-nums; color: #e9ecf8; }
.hvh-bar-tag {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #04060f;
  background: #7ff0ff;
  border-radius: 6px;
  padding: 2px 6px;
}
.hvh-bar-tag-you { background: #fde68a; }

.hvh-bar-track {
  position: relative;
  height: 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}
.hvh-bar-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(129, 140, 248, 0.95), rgba(103, 232, 249, 0.95));
  transform-origin: left center;
  transform: scaleX(0);
  animation: hvh-grow 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hvh-bar-fill-you { background: linear-gradient(90deg, #fbbf24, #fde68a); }
.hvh-bar-fill-top { background: linear-gradient(90deg, #6366f1, #a78bfa); }

/* ----------------------------------------------------------------- battle */

.hvh-vs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  gap: 12px;
}

.hvh-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.035);
}
.hvh-side-you { border-color: rgba(253, 230, 138, 0.45); background: rgba(253, 230, 138, 0.07); }
.hvh-side-them { border-color: rgba(165, 180, 252, 0.45); background: rgba(165, 180, 252, 0.07); }
.hvh-side-name { font-size: 10px; font-weight: 800; letter-spacing: 0.2em; color: #8ea0c9; }
.hvh-side-pick { font-size: 16px; font-weight: 800; line-height: 1.24; letter-spacing: -0.01em; color: #f7f9ff; }
.hvh-side-pct { font-size: 30px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hvh-side-you .hvh-side-pct { color: #fde68a; }
.hvh-side-them .hvh-side-pct { color: #a5b4fc; }

.hvh-vs-mark {
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #04060f;
  background: linear-gradient(140deg, #67e8f9, #a78bfa);
  box-shadow: 0 0 0 6px rgba(103, 232, 249, 0.08);
}

.hvh-headline {
  font-size: clamp(20px, 3.6vw, 30px);
  font-weight: 900;
  letter-spacing: -0.02em;
  text-align: center;
  background: linear-gradient(120deg, #ffffff, #a5b4fc 60%, #67e8f9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: hvh-pop 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hvh-events { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.hvh-event {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #c7d2fe;
  background: rgba(129, 140, 248, 0.12);
  border: 1px solid rgba(129, 140, 248, 0.32);
}
.hvh-event-rare { color: #fde68a; background: rgba(253, 230, 138, 0.1); border-color: rgba(253, 230, 138, 0.3); }
.hvh-event-crowd { color: #7ff0ff; background: rgba(34, 211, 238, 0.1); border-color: rgba(34, 211, 238, 0.3); }
.hvh-event-info { color: #94a3b8; background: rgba(148, 163, 184, 0.1); border-color: rgba(148, 163, 184, 0.26); }

/* ---------------------------------------------------------------- metrics */

.hvh-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }

.hvh-metric {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.035);
}
.hvh-metric-name { font-size: 10px; font-weight: 800; letter-spacing: 0.16em; color: #8ea0c9; }
.hvh-metric-value {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: #f7f9ff;
}
.hvh-metric-track { position: relative; height: 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); overflow: hidden; }
.hvh-metric-fill {
  position: absolute; inset: 0 auto 0 0; height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #22d3ee, #a78bfa);
  transform-origin: left center;
  transform: scaleX(0);
  animation: hvh-grow 1000ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ------------------------------------------------------------------ score */

.hvh-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 30px 20px;
}
.hvh-score-value {
  font-size: clamp(60px, 15vw, 108px);
  font-weight: 900;
  line-height: 0.86;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(140deg, #ffffff 5%, #a5b4fc 45%, #22d3ee 95%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: hvh-pop 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hvh-profile-name {
  font-size: clamp(26px, 5.4vw, 44px);
  font-weight: 900;
  letter-spacing: -0.03em;
  text-align: center;
  background: linear-gradient(120deg, #fde68a, #f9a8d4 55%, #a5b4fc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

/* ---------------------------------------------------------------- history */

.hvh-timeline { display: flex; flex-direction: column; gap: 8px; }

.hvh-tl-row {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
}
.hvh-tl-head {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  transition: background 160ms ease;
}
.hvh-tl-head:hover { background: rgba(255, 255, 255, 0.05); }
.hvh-tl-head:focus-visible { outline: 2px solid #22d3ee; outline-offset: -2px; }
.hvh-tl-num { font-size: 10px; font-weight: 800; letter-spacing: 0.16em; color: #6f7da6; min-width: 62px; }
.hvh-tl-label { flex: 1; font-size: 13px; font-weight: 600; color: #cbd5f5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hvh-tl-tag {
  font-size: 9px; font-weight: 800; letter-spacing: 0.12em;
  padding: 3px 8px; border-radius: 7px; white-space: nowrap;
}
.hvh-tl-match { color: #7ff0ff; background: rgba(34, 211, 238, 0.12); }
.hvh-tl-unique { color: #fde68a; background: rgba(253, 230, 138, 0.12); }
.hvh-tl-outlier { color: #fda4af; background: rgba(253, 164, 175, 0.12); }
.hvh-tl-close { color: #c4b5fd; background: rgba(196, 181, 253, 0.12); }
.hvh-tl-body {
  padding: 0 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: hvh-slide 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* -------------------------------------------------------------- share card */

.hvh-share-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 420px;
  padding: 26px 24px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background:
    radial-gradient(120% 80% at 12% 0%, rgba(34, 211, 238, 0.24) 0%, rgba(5, 6, 13, 0) 62%),
    radial-gradient(120% 80% at 92% 100%, rgba(139, 92, 246, 0.3) 0%, rgba(5, 6, 13, 0) 60%),
    #080a16;
  box-shadow: 0 30px 80px -40px rgba(0, 0, 0, 1);
}
.hvh-share-card-title { font-size: 12px; font-weight: 800; letter-spacing: 0.28em; color: #9fb0d8; }
.hvh-share-card-score { font-size: 62px; font-weight: 900; line-height: 0.9; letter-spacing: -0.05em; color: #ffffff; font-variant-numeric: tabular-nums; }
.hvh-share-card-line { font-size: 13px; font-weight: 700; letter-spacing: 0.04em; color: #c3cee9; }
.hvh-share-card-quote {
  font-size: 15px;
  font-weight: 700;
  font-style: italic;
  line-height: 1.45;
  color: #e8edff;
}
.hvh-share-card-cta { font-size: 10px; font-weight: 800; letter-spacing: 0.2em; color: #7ff0ff; }

/* ------------------------------------------------------------------ misc */

.hvh-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: #7c8ab3;
}
.hvh-note strong { color: #a5b4fc; }

.hvh-source-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 24px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #c4b5fd;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.3);
}
.hvh-source-pill-live { color: #6ee7b7; background: rgba(110, 231, 183, 0.1); border-color: rgba(110, 231, 183, 0.3); }

.hvh-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
.hvh-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}
.hvh-stat-value { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; color: #f7f9ff; font-variant-numeric: tabular-nums; }
.hvh-stat-name { font-size: 9.5px; font-weight: 800; letter-spacing: 0.14em; color: #6f7da6; }

.hvh-steps { display: flex; flex-direction: column; gap: 12px; }
.hvh-step { display: flex; gap: 14px; align-items: flex-start; }
.hvh-step-num {
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 10px;
  font-size: 12px; font-weight: 800;
  color: #04060f;
  background: linear-gradient(120deg, #67e8f9, #818cf8);
}
.hvh-step-title { font-size: 15px; font-weight: 800; letter-spacing: 0.02em; color: #f4f6ff; }
.hvh-step-body { font-size: 13.5px; line-height: 1.55; color: #9dabcf; }

.hvh-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.hvh-compare { display: flex; flex-direction: column; gap: 8px; }
.hvh-compare-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.hvh-compare-name { flex: 1; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: #a9b6d6; }
.hvh-compare-score { font-size: 24px; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }

.hvh-outcome {
  font-size: clamp(28px, 7vw, 52px);
  font-weight: 900;
  letter-spacing: -0.03em;
  text-align: center;
}
.hvh-outcome-win { color: #6ee7b7; }
.hvh-outcome-loss { color: #fda4af; }
.hvh-outcome-tie { color: #fde68a; }

.hvh-skeleton {
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.06) 100%);
  background-size: 200% 100%;
  animation: hvh-shimmer 1200ms linear infinite;
}

.hvh-fade { animation: hvh-fade 380ms ease both; }
.hvh-fade-1 { animation-delay: 60ms; }
.hvh-fade-2 { animation-delay: 120ms; }
.hvh-fade-3 { animation-delay: 180ms; }
.hvh-fade-4 { animation-delay: 240ms; }

.hvh-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.hvh-best { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #7c8ab3; }

@keyframes hvh-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes hvh-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes hvh-pop { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
@keyframes hvh-slide { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
@keyframes hvh-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes hvh-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@keyframes hvh-drift-a { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(60px, 40px, 0) scale(1.12); } }
@keyframes hvh-drift-b { 0%,100% { transform: translate3d(0,0,0) scale(1.05); } 50% { transform: translate3d(-70px, -50px, 0) scale(0.95); } }
@keyframes hvh-drift-c { 0%,100% { transform: translate3d(0,0,0) scale(0.9); } 50% { transform: translate3d(-40px, 60px, 0) scale(1.1); } }

@media (max-width: 620px) {
  .hvh-stage { padding: 18px 14px 56px; }
  .hvh-panel { padding: 20px 16px; border-radius: 18px; }
  .hvh-vs { grid-template-columns: 1fr; }
  .hvh-vs-mark { justify-self: center; }
  .hvh-button { width: 100%; }
  .hvh-footer { flex-direction: column; align-items: stretch; }
}

@media (prefers-reduced-motion: reduce) {
  .hvh-root *,
  .hvh-root *::before,
  .hvh-root *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
`;
