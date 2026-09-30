# Human vs Humanity

A standalone React + TypeScript game component. The player decides how **they** would answer a
moral scenario, locks it in, then finds out what thousands of other players chose.

The component ships with its own sample crowd, so it runs with **zero host setup**. A host can
optionally plug in real participation data, real world statistics, and a friend challenge flow.

```tsx
import { HumanVsHumanity } from "./src/games/HumanVsHumanity";

export default function Page() {
  return <HumanVsHumanity />;
}
```

## Why it is safe to embed

| Concern | How it is handled |
| --- | --- |
| Host CSS | All styling is injected at runtime under `.hvh-root`. No global selectors, no `body`/`*`/`h1`/`p` rules, no resets. The only `!important` uses are inside a `prefers-reduced-motion` block scoped to `.hvh-root`. |
| Host state | All state is internal (`useReducer`). Nothing is written outside the component except one namespaced `localStorage` key. |
| Host routing | The component never navigates. Friend challenges are created through the host callback. |
| Dependencies | `react` only. No UI library, no CSS framework, no animation library, no network calls. |
| Rendering | SSR safe: styles are injected inside `useEffect`, so server output contains markup only. |
| Reduced motion | Honours `prefers-reduced-motion`. |

Every DOM node carries an `hvh-` class, and the stylesheet is injected once as
`<style id="hvh-styles">` from inside `useEffect`, so a server render emits markup only. Verified by
the jsdom harness: the host stylesheet is byte-identical after a full playthrough, `document.body`
gains no styles, and no `hvh-` markup leaks into `<head>`.

## Game flow

1. **Intro / How it works** — optional, skippable via `autoStart`.
2. **Mode select** — round length and optional manual country.
3. **Round loop** (5–12 rounds):
   - `choose` — the player answers for themselves. The crowd is never asked to be predicted.
   - `lock` — the decision is committed; the data for the round loads.
   - `reveal` — the participation chart for the round.
   - `battle` — head-to-head verdict against the biggest group.
   - `summary` — per-round score, events, and the decision to continue.
4. **Result** — battle score, Humanity Profile, five metrics, round history, share, challenge, replay.

The player never sees "what will humanity pick?". The comparison always runs **after** the lock,
which is the whole point of the game.

## Modes

| Mode | Default rounds | Notes |
| --- | --- | --- |
| `quick` | 5 | Short run of hard decisions. |
| `standard` | 7 | Default. |
| `full` | 12 | Every category is used. |
| `daily` | 7 | Deterministic per-day seed, same questions for everyone that day. |
| `friend` | 7 | Only offered when a `challenge` prop exists. |

`rounds` overrides the round count of every mode (clamped to 5–12) and the mode select screen
reflects the real length in its badges and copy.

## Props

```ts
interface HumanVsHumanityProps {
  rounds?: number;                 // 5-12, overrides every mode
  enabledModes?: HvhMode[];        // subset of the mode list
  autoStart?: HvhMode;             // skip intro + mode select
  humanityDataProvider?: (questionId: string, context: HvhDataContext) =>
    HvhHumanityDistribution | undefined | Promise<HvhHumanityDistribution | undefined>;
  labels?: { sample?: string; live?: string };
  enableCountrySelection?: boolean; // manual only, never detected
  countries?: { code: string; name: string }[];
  defaultCountry?: string;
  worldStats?: HvhWorldStats;      // omit and no ranking UI renders
  challenge?: HvhChallengeInput;   // incoming friend challenge
  onChallengeCreate?: (result: HvhGameResult) => HvhChallenge | string | null | Promise<...>;
  onComplete?: (result: HvhGameResult) => void;
  onStart?: (config: { mode: HvhMode; rounds: number; country?: string; questionIds: string[] }) => void;
  onShare?: (result: HvhGameResult) => void;
  questionSet?: HvhQuestion[];     // replace or extend the built-in bank
  showShareCard?: boolean;         // default true
  showShareText?: boolean;         // default true
  showHistory?: boolean;           // default true
  storageKey?: string;             // pass "" to disable persistence
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}
```

Ref API:

```ts
interface HumanVsHumanityRef {
  getResult(): HvhGameResult | null;
  getQuestionIds(): string[];
  reset(): void;
}
```

## Data honesty rules

The component never invents a crowd it was not given.

- Built-in data is labelled **`GAME HUMANITY`** and described as sample game numbers, not
  real-world statistics.
- Host data is labelled **`PARTICIPATING PLAYERS`**, or
  **`PARTICIPATING PLAYERS IN <COUNTRY>`** when a country is selected.
- The crowd label is always a passed label or a host override; there are no phrases such as
  "97% of humanity".
- If a provider throws, returns `undefined`, or returns an invalid distribution, the round falls
  back to sample data and the round is labelled as such.
- `worldStats` UI only renders when the host supplies real values. Omit the prop and no ranking,
  percentile, or platform-wide claim appears anywhere.

### Live data provider

```tsx
<HumanVsHumanity
  humanityDataProvider={async (questionId, ctx) => {
    const res = await fetch(`/api/humans?question=${questionId}&country=${ctx.country ?? ""}`);
    const rows = await res.json();
    return {
      totalResponses: rows.total,
      options: rows.options.map((o: { id: string; percentage: number }) => ({
        optionId: o.id,
        percentage: o.percentage,
      })),
    };
  }}
/>
```

The component calls the provider once per round, plus a second call for the selected country when
one is set. Unknown or missing option ids are dropped, missing options count as `0%`, and the
remainder is renormalised to 100 so the chart can never lie about the total.

## Friend challenges

The component has no routing. The host owns the URL.

```tsx
// Host creates the link when a game finishes.
<HumanVsHumanity
  onChallengeCreate={async (result) => {
    const id = await api.createChallenge({ questionIds: result.questionIds, score: result.score });
    return `${location.origin}/human-vs-humanity/challenge/${id}`;
  }}
/>

// Another player opens that URL.
<HumanVsHumanity challenge={{ challengeId, questionIds, hostName: "Maya", hostScore: 8210 }} />
```

When a `challenge` is present the component routes intro → challenge screen → game, and the result
screen shows `WIN` / `LOSS` / `TIE` plus an opponent line. The challenge button is hidden when no
`onChallengeCreate` handler is provided.

## Content

- **86 original scenarios** across ten categories: life (15), social (10), technology (10),
  travel (10), work (8), food (8), money (5), absurd (10), future (6), survival-lite (4).
- **19 Humanity Profiles**, chosen by a deterministic classifier over alignment, individuality,
  adaptability, consistency, risk, declines, late switches, splits, and crowd-match counts.
- Question selection is balanced across categories, with a deterministic seed for `daily` and a
  seeded random seed otherwise.

## Demo

```bash
npm install
npm run demo      # vite dev server for the demo host in demo/
npm run typecheck # tsc --noEmit
```

`demo/App.tsx` exercises the component three ways: plain sample mode, a live provider with a
simulated 450 ms fetch, and a friend challenge.

## Verification

Three harnesses live at the repo root and run without a browser.

```bash
npm test            # typecheck + engine harness + jsdom DOM harness
npm run test:engine # questions, profiles, classifier, scoring, reducer
npm run test:dom    # full interactive flow through jsdom
npm run test:ssr    # server render + stylesheet audit
```

`hvh-dom-check.tsx` drives real clicks through a complete sample game, a live-provider game, the
result screen, history expansion, mode changes, and fresh mounts, then asserts:

- the host stylesheet is byte-identical, `document.body` gained no styles, no `hvh-` markup
  reached `<head>`, and exactly one stylesheet was injected;
- every rendered element inside `.hvh-root` carries an `hvh-` class;
- every rendered class has a matching rule in the injected stylesheet;
- no selector in the stylesheet escapes the `hvh-` scope.

`hvh-check.ts` verifies the 86-question bank, that every one of the 19 profiles is reachable by
the classifier, that distribution percentages always total 100, and that a simulated playthrough
produces a complete, correctly shaped result.
