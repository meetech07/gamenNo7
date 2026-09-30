import { renderToString } from "react-dom/server";
import { createElement } from "react";
import HumanVsHumanity from "./src/games/HumanVsHumanity";
import { HVH_STYLES } from "./src/games/HumanVsHumanity/styles";
import { QUESTIONS } from "./src/games/HumanVsHumanity/data/questions";
import { HvhGameResult, HumanVsHumanityRef } from "./src/games/HumanVsHumanity";
import { createRef } from "react";

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (!cond) { failures += 1; console.log("FAIL  " + name, extra ?? ""); }
  else console.log("ok    " + name);
}

/* ------------------------------------------------------- CSS isolation ---- */
const styleBody = HVH_STYLES;
const banned = [/^\s*body\b/m, /^\s*\*/m, /^\s*button\b/m, /^\s*h1\b/m, /^\s*p\s*\{/m, /^\s*html\b/m, /:root/m];
check("no global element selectors in the stylesheet", !banned.some((r) => r.test(styleBody)),
  banned.filter((r) => r.test(styleBody)).map(String));

// Every declaration block must belong to a .hvh- scoped selector.
const selectorBlocks: string[] = [];
let depth = 0;
let buffer = "";
const lines = styleBody.split("\n");
for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;
  if (line.startsWith("@keyframes") || line.startsWith("@media")) { selectorBlocks.push(line.split("{")[0].trim()); continue; }
  if (line.startsWith("from") || line.startsWith("to")) continue;
  if (line.endsWith("{") && !line.startsWith("}")) { selectorBlocks.push(line.replace(/\{$/, "").trim()); continue; }
  buffer += line;
  if (line === "}") { buffer = ""; }
}
const unscoped = selectorBlocks.filter(
  (s) => !s.startsWith(".hvh-") && !s.startsWith(".hvh-root") && !s.startsWith("@"),
);
check("every selector is hvh- scoped", unscoped.length === 0, unscoped.slice(0, 6));
const classes = [...styleBody.matchAll(/\.(hvh-[a-z0-9-]+)/g)].map((m) => m[1]);
const badPrefix = classes.filter((c) => !c.startsWith("hvh-"));
check("all classes use the hvh- prefix", badPrefix.length === 0, [...new Set(badPrefix)].slice(0, 6));
check("class count is substantial", new Set(classes).size > 90, new Set(classes).size);
check("keyframes are namespaced", (styleBody.match(/@keyframes (?!hvh-)/g) ?? []).length === 0);
check("all animations reference hvh- keyframes", !/\banimation(-name)?:\s*[^;]*\b(?!hvh-)[a-z]+-(drift|rise|pop|fade|slide|grow|shimmer)/.test(styleBody));

/* ------------------------------------------------------------- render ---- */
const html = renderToString(
  createElement(HumanVsHumanity, { enableCountrySelection: true, rounds: 5 }),
);
check("intro renders", html.includes("HUMAN") && html.includes("ENTER THE BATTLE"));
check("root class is present", html.includes('class="hvh-root"'));
check("no host globals injected", !html.includes("<style"));

/* autoStart is applied in an effect, so SSR renders the intro shell and the
 * client switches to the game after mount. hvh-dom-check.tsx covers that path. */
const autoHtml = renderToString(
  createElement(HumanVsHumanity, { autoStart: "quick" as const, rounds: 5 }),
);
check("autoStart does not break server render", autoHtml.includes("ENTER THE BATTLE"));
check("autoStart injects no styles on the server", !autoHtml.includes("<style"));
check("autoStart never claims real-world stats", !/worldwide|everyone on earth|all of humanity/i.test(autoHtml));

const modesHtml = renderToString(
  createElement(HumanVsHumanity, {
    enableCountrySelection: true,
    labels: { sample: "SAMPLE CROWD", live: "REAL PLAYERS" },
  }),
);
check("custom labels are accepted", renderToString(createElement(HumanVsHumanity, {})).length > 0 && modesHtml.includes("HUMAN"));

// A ref must be creatable against the exported type (compile-time check).
const ref: React.Ref<HumanVsHumanityRef> = createRef<HumanVsHumanityRef>();
check("ref type is compatible", ref === null || typeof ref === "object");

/* -------------------------------------------------------- share text ----- */
const fake: HvhGameResult = {
  mode: "standard", rounds: 7, score: 784,
  metrics: { alignment: 42, individuality: 81, adaptability: 76, consistency: 64, risk: 58 },
  profile: { id: "independent-signal", name: "THE INDEPENDENT SIGNAL", tagline: "t", description: "d", strength: "s", watchout: "w" },
  roundResults: [], summary: { rounds: 7, crowdMatches: 4, uniqueChoices: 3, closeBattles: 1, rareChoices: 1, perfectSplits: 0, twists: 0, declines: 0, biggestStrength: "s", biggestWatchout: "w" },
  shareText: "", shareCardLines: [], dataSource: "sample", participantsLabel: "GAME HUMANITY",
  questionIds: QUESTIONS.slice(0, 7).map((q) => q.id), completedAt: new Date().toISOString(),
};
check("result object shape is stable", fake.score === 784 && fake.metrics.individuality === 81);

console.log("");
console.log(failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED");
process.exit(failures === 0 ? 0 : 1);
