import { QUESTIONS } from "./src/games/HumanVsHumanity/data/questions";
import { PROFILES } from "./src/games/HumanVsHumanity/data/profiles";
import { buildSampleDistribution, getStats, normalizePercentages, createRng } from "./src/games/HumanVsHumanity/engine/core";
import { buildGameResult, scoreRound, computeMetrics, computeBattleScore } from "./src/games/HumanVsHumanity/engine/scoring";
import { selectQuestions, dailySeed } from "./src/games/HumanVsHumanity/engine/selection";
import type { HvhRoundResult, HvhGameResult } from "./src/games/HumanVsHumanity/types";
import { reducer, createInitialState, type HvhState } from "./src/games/HumanVsHumanity/engine/gameReducer";

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (!cond) {
    failures += 1;
    console.log("FAIL  " + name, extra ?? "");
  } else {
    console.log("ok    " + name);
  }
}

/* 1. content bank ------------------------------------------------------- */
check("86 questions", QUESTIONS.length === 86, QUESTIONS.length);
const perCat: Record<string, number> = {};
QUESTIONS.forEach((q) => (perCat[q.category] = (perCat[q.category] ?? 0) + 1));
console.log("   categories:", perCat);
check("every question has 3-5 options", QUESTIONS.every((q) => q.options.length >= 3 && q.options.length <= 5));
check("19 profiles", PROFILES.length === 19, PROFILES.length);
const ids = new Set(QUESTIONS.map((q) => q.id));
check("unique question ids", ids.size === QUESTIONS.length);
const optIds = QUESTIONS.every((q) => new Set(q.options.map((o) => o.id)).size === q.options.length);
check("unique option ids per question", optIds);

/* 2. distributions ------------------------------------------------------ */
const allSumTo100 = QUESTIONS.every((q) => {
  const d = buildSampleDistribution(q);
  const total = d.options.reduce((a, o) => a + o.percentage, 0);
  return Math.abs(total - 100) < 0.05;
});
check("sample distributions sum to 100", allSumTo100);
check("normalizePercentages handles zeros", normalizePercentages([0, 0, 4, 0]).reduce((a, b) => a + b, 0) === 100);
check("no crowd has a 100% monopoly", QUESTIONS.every((q) => {
  const s = getStats(buildSampleDistribution(q), q);
  return s.topPercentage <= 55;
}));
const margins = QUESTIONS.map((q) => getStats(buildSampleDistribution(q), q).margin);
check("bank contains close battles", margins.filter((m) => m <= 5).length >= 8, margins.filter((m) => m <= 5).length);
const spreads = QUESTIONS.map((q) => getStats(buildSampleDistribution(q), q).topThreeSpread);
check("bank contains perfect splits", spreads.filter((s) => s <= 6).length >= 3, spreads.filter((s) => s <= 6).length);
const topPcts = QUESTIONS.map((q) => getStats(buildSampleDistribution(q), q).topPercentage);
check("no single dominant option in the whole bank", topPcts.filter((p) => p > 45).length <= 3, topPcts.filter((p) => p > 45).length);

/* 3. selection ---------------------------------------------------------- */
for (const count of [5, 7, 10, 12]) {
  const qs = selectQuestions(QUESTIONS, count, "seed-" + count);
  check("select " + count, qs.length === count, qs.length);
  check("select " + count + " unique", new Set(qs.map((q) => q.id)).size === count);
}
const seven = selectQuestions(QUESTIONS, 7, dailySeed(new Date(2026, 0, 5)));
const sevenAgain = selectQuestions(QUESTIONS, 7, dailySeed(new Date(2026, 0, 5)));
check("daily seed is deterministic", seven.map((q) => q.id).join() === sevenAgain.map((q) => q.id).join());
const spread = selectQuestions(QUESTIONS, 12, "x");
check("12 rounds span many categories", new Set(spread.map((q) => q.category)).size >= 6, new Set(spread.map((q) => q.category)).size);
check("12 rounds span many axes", new Set(spread.map((q) => q.axis)).size >= 3, new Set(spread.map((q) => q.axis)).size);

/* 4. simulated players -------------------------------------------------- */
type Style = "follower" | "rebel" | "context" | "chaos" | "middle";
function playGame(style: Style, seed: string, count = 7): HvhGameResult {
  const rng = createRng(seed);
  const questions = selectQuestions(QUESTIONS, count, seed);
  const rounds: HvhRoundResult[] = [];
  let prevStance: number | null = null;
  let streak = 0;
  let axisBias: Record<string, number> = { dream: 0, risk: 0.3, social: -0.2, practical: 0.1 };
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    const d = buildSampleDistribution(q);
    const s = getStats(d, q);
    const target =
      style === "follower" ? 0.95
      : style === "rebel" ? 0.06
      : style === "middle" ? 0.5
      : style === "chaos" ? rng()
      : Math.max(0.03, Math.min(0.95, 0.5 + (axisBias[q.axis] ?? 0)));
    // pick the option closest to the target percentage
    const row = s.rows.reduce((best, r) =>
      Math.abs(r.percentage - target * s.topPercentage) < Math.abs(best.percentage - target * s.topPercentage) ? r : best,
    );
    const scored = scoreRound({
      question: q,
      index: i,
      playerOptionId: row.optionId,
      distribution: d,
      dataSource: "sample",
      previousStance: prevStance,
      crowdMatchStreak: streak,
      totalRounds: count,
    });
    prevStance = scored.topPercentage > 0 ? (scored.topPercentage - scored.playerPercentage) / scored.topPercentage : 0;
    streak = scored.events.includes("crowd-match") ? streak + 1 : 0;
    rounds.push(scored);
  }
  return buildGameResult({ mode: "standard", rounds, participantsLabel: "GAME HUMANITY" });
}

const results: Record<string, HvhGameResult> = {
  follower: playGame("follower", "s1"),
  rebel: playGame("rebel", "s2"),
  middle: playGame("middle", "s3"),
  context: playGame("context", "s4"),
  chaos: playGame("chaos", "s5"),
};
Object.entries(results).forEach(([k, r]) => {
  console.log(
    `   ${k.padEnd(9)} score=${String(r.score).padStart(4)} align=${String(r.metrics.alignment).padStart(3)} indiv=${String(r.metrics.individuality).padStart(3)} adapt=${String(r.metrics.adaptability).padStart(3)} cons=${String(r.metrics.consistency).padStart(3)} risk=${String(r.metrics.risk).padStart(3)} -> ${r.profile.name}`,
  );
});
check("follower scores high alignment", results.follower.metrics.alignment >= 80, results.follower.metrics.alignment);
check("follower scores low individuality", results.follower.metrics.individuality <= 45, results.follower.metrics.individuality);
check("rebel scores low alignment", results.rebel.metrics.alignment <= 55, results.rebel.metrics.alignment);
check("rebel is far less aligned than a follower", results.follower.metrics.alignment - results.rebel.metrics.alignment >= 35);
check("rebel scores high individuality", results.rebel.metrics.individuality >= 70, results.rebel.metrics.individuality);
check("follower consistency high", results.follower.metrics.consistency >= 78, results.follower.metrics.consistency);
check("context adaptability > follower", results.context.metrics.adaptability > results.follower.metrics.adaptability,
  [results.context.metrics.adaptability, results.follower.metrics.adaptability]);
check("chaos consistency < follower", results.chaos.metrics.consistency < results.follower.metrics.consistency);
check("scores are in a sane band", Object.values(results).every((r) => r.score > 400 && r.score < 1600),
  Object.values(results).map((r) => r.score));
check("every result has a profile", Object.values(results).every((r) => !!r.profile && r.profile.name.length > 3));
check("share text never claims the world", Object.values(results).every((r) => !/worldwide|everyone in the world|all of humanity/i.test(r.shareText)));
check("summary strengths are non-empty", Object.values(results).every((r) => r.summary.biggestStrength.length > 12 && r.summary.biggestWatchout.length > 12));

/* 5. profile coverage --------------------------------------------------- */
const seen = new Set<string>();
for (let i = 0; i < 500; i += 1) {
  const style = (["follower", "rebel", "middle", "context", "chaos"] as Style[])[i % 5];
  seen.add(playGame(style, "cov-" + i, 5 + (i % 8)).profile.id);
}
const missed = PROFILES.map((p) => p.id).filter((id) => !seen.has(id));
console.log("   profiles reached by simulated play:", seen.size, "/", PROFILES.length, missed.length ? "unreached: " + missed.join(", ") : "");
check("at least 12 profiles reachable in simulation", seen.size >= 12, seen.size);

/* 5b. every profile id is producible by the classifier -------------------- */
import { classifyProfile } from "./src/games/HumanVsHumanity/data/profiles";
const grid: string[] = [];
for (let a = 10; a <= 95; a += 5)
  for (let i = 5; i <= 95; i += 5)
    for (let ad = 0; ad <= 100; ad += 10)
      for (let c = 0; c <= 100; c += 10)
        for (let r = 0; r <= 100; r += 10)
          for (const declines of [0, 5])
            for (const lateSwitch of [false, true])
              grid.push(
                classifyProfile(
                  { alignment: a, individuality: i, adaptability: ad, consistency: c, risk: r },
                  { perfectSplits: 1, rareChoices: 0, crowdMatches: 4, totalRounds: 7, declines, lateSwitch },
                ).id,
              );
const gridIds = new Set(grid);
const gridMissed = PROFILES.map((p) => p.id).filter((id) => !gridIds.has(id));
check("classifier can produce every profile", gridMissed.length === 0, gridMissed);
check("classifier is deterministic", (() => {
  const m = { alignment: 55, individuality: 61, adaptability: 72, consistency: 48, risk: 55 };
  const f = { perfectSplits: 1, rareChoices: 1, crowdMatches: 3, totalRounds: 7, declines: 0, lateSwitch: false };
  return classifyProfile(m, f).id === classifyProfile(m, f).id;
})());

/* 6. events are only raised when data supports them --------------------- */
const q = QUESTIONS.find((x) => x.id === "life-07")!;
const dLife7 = buildSampleDistribution(q);
const topId = getStats(dLife7, q).top.optionId;
const topRound = scoreRound({ question: q, index: 0, playerOptionId: topId, distribution: dLife7, dataSource: "sample", previousStance: null, crowdMatchStreak: 0, totalRounds: 7 });
check("top pick raises crowd-match", topRound.events.includes("crowd-match"));
check("top pick has 100 alignment", topRound.alignment === 100, topRound.alignment);
const rarest = getStats(dLife7, q).rows[getStats(dLife7, q).rows.length - 1];
const rareRound = scoreRound({ question: q, index: 0, playerOptionId: rarest.optionId, distribution: dLife7, dataSource: "sample", previousStance: null, crowdMatchStreak: 0, totalRounds: 7 });
check("last pick is never a crowd-match", !rareRound.events.includes("crowd-match"));
check("rare pick gets an independence bonus", rareRound.score > topRound.score * 0.8, [rareRound.score, topRound.score]);

/* 7. challenge outcome -------------------------------------------------- */
const withHost = buildGameResult({ mode: "friend", rounds: results.follower.roundResults, participantsLabel: "PARTICIPATING PLAYERS", challengeHostScore: results.follower.score });
check("equal score is a tie", withHost.challengeOutcome === "tie", withHost.challengeOutcome);
const win = buildGameResult({ mode: "friend", rounds: results.follower.roundResults, participantsLabel: "P", challengeHostScore: 100 });
check("higher score is a win", win.challengeOutcome === "win", win.challengeOutcome);
const loss = buildGameResult({ mode: "friend", rounds: results.rebel.roundResults, participantsLabel: "P", challengeHostScore: 9999 });
check("lower score is a loss", loss.challengeOutcome === "loss", loss.challengeOutcome);
check("live rounds report live source",
  buildGameResult({ mode: "standard", rounds: results.rebel.roundResults.map((r) => ({ ...r, dataSource: "live" as const })), participantsLabel: "P" }).dataSource === "live");

/* 8. reducer flow ------------------------------------------------------- */
let s: HvhState = createInitialState({ sampleLabel: "GAME HUMANITY", liveLabel: "PARTICIPATING PLAYERS", country: "", best: 0, challengeDeclined: false });
s = reducer(s, { type: "start", mode: "standard", questions: selectQuestions(QUESTIONS, 5, "flow") });
check("start enters round 1", s.screen === "round" && s.index === 0 && s.phase === "choose");
s = reducer(s, { type: "select", optionId: s.questions[0].options[0].id });
check("select stores the option", !!s.selected);
s = reducer(s, { type: "lock" });
check("lock locks the choice", s.phase === "locked" && s.loading);
s = reducer(s, { type: "select", optionId: "zzz" });
check("locked answer cannot change", s.selected === s.questions[0].options[0].id);
s = reducer(s, { type: "data-loaded", distribution: buildSampleDistribution(s.questions[0]), countryDistribution: null, dataSource: "sample" });
check("data loaded reveals", s.phase === "reveal" && !!s.distribution);
s = reducer(s, { type: "advance" });
check("advance moves to battle", s.phase === "battle" && s.rounds.length === 1);
s = reducer(s, { type: "advance" });
check("advance moves to summary", s.phase === "summary" && !!s.currentRound);
s = reducer(s, { type: "advance" });
check("advance moves to round 2", s.index === 1 && s.phase === "choose" && s.selected === null);
for (let i = 1; i < 5; i += 1) {
  const qn = s.questions[i];
  s = reducer(s, { type: "select", optionId: qn.options[i % qn.options.length].id });
  s = reducer(s, { type: "lock" });
  s = reducer(s, { type: "data-loaded", distribution: buildSampleDistribution(qn), countryDistribution: null, dataSource: "sample" });
  s = reducer(s, { type: "advance" });
  s = reducer(s, { type: "advance" });
  s = reducer(s, { type: "advance" });
}
check("five rounds produce a result", s.screen === "result" && !!s.result && s.result.rounds === 5, s.result?.rounds);
check("result keeps every round", s.result!.roundResults.length === 5);
check("first best is flagged", s.isNewBest === true);
check("metrics are all 0-100", Object.values(s.result!.metrics).every((v) => v >= 0 && v <= 100));
check("round scores are positive", s.result!.roundResults.every((r) => r.score > 0));
s = reducer(s, { type: "reset" });
check("reset returns to the menu", s.screen === "modes" && !s.result);

console.log("");
console.log(failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED");
process.exit(failures === 0 ? 0 : 1);
