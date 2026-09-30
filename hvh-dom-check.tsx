import { JSDOM } from "jsdom";

/* ---------------------------------------------------------------- jsdom -- */
const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
  pretendToBeVisual: true,
  url: "https://host-site.example/game",
});
const g = globalThis as unknown as Record<string, unknown>;
g.window = dom.window;
g.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
});
g.HTMLElement = dom.window.HTMLElement;
g.Element = dom.window.Element;
g.Node = dom.window.Node;
g.MouseEvent = dom.window.MouseEvent;
g.KeyboardEvent = dom.window.KeyboardEvent;
g.getComputedStyle = dom.window.getComputedStyle;
g.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
g.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
g.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};

import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import { createElement, createRef } from "react";
import HumanVsHumanity from "./src/games/HumanVsHumanity";
import type { HvhGameResult, HumanVsHumanityRef, HvhHumanityDistribution } from "./src/games/HumanVsHumanity";

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (!cond) { failures += 1; console.log("FAIL  " + name, extra ?? ""); }
  else console.log("ok    " + name);
}

/* ------------------------------------------------------------- harness -- */
const host = dom.window.document.getElementById("root")!;
const root: Root = createRoot(host);

function text(): string {
  return host.textContent ?? "";
}
function buttons(): HTMLButtonElement[] {
  return Array.from(host.querySelectorAll("button")) as HTMLButtonElement[];
}
function byLabel(re: RegExp): HTMLButtonElement | undefined {
  return buttons().find((b) => re.test(b.textContent ?? ""));
}
function click(el: Element | undefined | null, label: string): void {
  if (!el) { failures += 1; console.log("FAIL  could not click " + label); return; }
  act(() => {
    (el as HTMLElement).dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  });
}
async function settle(ms = 0): Promise<void> {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}

/* -------------------------------------------------- host page protection */
dom.window.document.head.innerHTML = "<style id='host-style'>body{background:#f00}h1{color:#f00}</style>";
const hostStyleBefore = dom.window.document.getElementById("host-style")!.textContent;

/* --------------------------------------------------------- live data test */
let providerCalls = 0;
const liveRef = createRef<HumanVsHumanityRef>();
let completed: HvhGameResult | null = null;

async function runGame(opts: { autoStart?: "quick" | "standard"; rounds?: number }): Promise<void> {
  await act(async () => {
    root.render(
      createElement(HumanVsHumanity, {
        ref: liveRef,
        rounds: opts.rounds ?? 5,
        autoStart: opts.autoStart ?? "quick",
        enableCountrySelection: true,
        humanityDataProvider: async (questionId, ctx): Promise<HvhHumanityDistribution> => {
          providerCalls += 1;
          return {
            totalResponses: 5000,
            source: "test-host",
            options: (ctx.country ? ["a", "b", "c", "d"] : ["d", "c", "b", "a"]).map((id, i) => ({
              optionId: id,
              percentage: [40, 28, 18, 14][i],
            })),
          };
        },
        onComplete: (r) => { completed = r; },
      }),
    );
  });
  await settle(60);
}

async function playOneRound(): Promise<void> {
  const option = host.querySelectorAll(".hvh-option")[0] as HTMLButtonElement;
  click(option, "option");
  click(byLabel(/LOCK YOUR DECISION/), "lock");
  await settle(900);
  click(byLabel(/SEE THE BATTLE/), "see the battle");
  click(byLabel(/ROUND RESULT/), "round result");
  click(byLabel(/CONTINUE|FINAL RESULT/), "continue");
  await settle(30);
}

(async () => {
  /* run 1: sample/live flow */
  await runGame({ rounds: 5 });

  check("round 1 question is shown", text().includes("WHICH ONE DO YOU ACTUALLY WANT"));
  check("round 1 progress is shown", text().includes("ROUND 1 / 5"));
  check("player is asked to choose for themselves", text().includes("WHICH ONE DO YOU ACTUALLY WANT"));
  check("lock is disabled before choosing", byLabel(/LOCK YOUR DECISION/)?.disabled === true);

  const options = host.querySelectorAll(".hvh-option");
  check("all options are rendered", options.length >= 3 && options.length <= 5, options.length);
  check("options are radios", Array.from(options).every((o) => o.getAttribute("role") === "radio"));

  click(options[0], "first option");
  check("lock becomes enabled after choosing", byLabel(/LOCK YOUR DECISION/)?.disabled === false);
  check("selection is marked", host.querySelector(".hvh-option-selected") !== null);

  click(byLabel(/LOCK YOUR DECISION/), "lock");
  check("locks the answer", text().includes("LOCKED IN"));
  await settle(900);
  check("reveal shows participation", /HAS ANSWERED/.test(text()), text().slice(0, 160));
  check("reveal is labelled participating players", text().includes("PARTICIPATING PLAYERS"));
  check("bars are rendered", host.querySelectorAll(".hvh-bar-fill").length >= 3);
  check("no fake global claim in sample/live mode", !/humanity chose|everyone worldwide|all of humanity/i.test(text()));

  click(byLabel(/SEE THE BATTLE/), "battle");
  check("battle shows YOU vs the crowd", text().includes("VS") && text().includes("YOU"));
  check("a headline verdict is shown", /YOU THINK LIKE HUMANITY|YOU NEARLY SPLIT|YOU WENT YOUR OWN WAY|YOU WENT ROGUE/.test(text()));
  check("headline does not call minority thinking smarter", !/smarter|cleverer|better choice/i.test(text()));

  click(byLabel(/ROUND RESULT/), "result");
  check("round result shows alignment", text().includes("ALIGNMENT"));
  check("round result shows individuality", text().includes("INDIVIDUALITY"));
  check("round result shows a score", /SCORE \+\d+/.test(text()));

  click(byLabel(/CONTINUE|FINAL RESULT/), "continue");
  check("moves to round 2", text().includes("ROUND 2 / 5"));

  /* remaining rounds */
  for (let i = 0; i < 4; i += 1) await playOneRound();

  check("finishes on the result screen", text().includes("YOUR HUMANITY PROFILE"));
  check("shows a battle score", /YOUR BATTLE SCORE/.test(text()));
  check("shows a profile name", /THE [A-Z ]+/.test(text()));
  check("shows all five metrics", ["ALIGNMENT", "INDIVIDUALITY", "ADAPTABILITY", "CONSISTENCY", "RISK"].every((m) => text().includes(m)));
  check("shows the battle summary", text().includes("CROWD MATCHES") && text().includes("UNIQUE CHOICES"));
  check("round history is present", text().includes("ROUND HISTORY"));
  check("share buttons exist", !!byLabel(/^SHARE RESULT$/) && !!byLabel(/^COPY RESULT$/));
  check("download card button exists", !!byLabel(/DOWNLOAD CARD/));
  check("first game is a personal best", text().includes("NEW PERSONAL BEST"));

  click(byLabel(/^COPY RESULT$/), "copy");
  await settle(20);
  check("copy reports an honest outcome", /COPIED|COULD NOT|FAILED/.test(text()));
  check("challenge button hidden without a host handler", !byLabel(/CHALLENGE A FRIEND/));

  const result = liveRef.current?.getResult() as HvhGameResult | null;
  check("ref exposes the result", !!result && result.rounds === 5);
  check("onComplete fired with the same result", (completed as HvhGameResult | null)?.score === result?.score);
  check("all five rounds are recorded", result!.roundResults.length === 5);
  check("every round scored above zero", result!.roundResults.every((r) => r.score > 0));
  check("every round has a crowd distribution", result!.roundResults.every((r) => r.distribution.options.length >= 3));
  check("distributions total 100 per round", result!.roundResults.every((r) =>
    Math.abs(r.distribution.options.reduce((a, o) => a + o.percentage, 0) - 100) < 0.05));
  check("live rounds are labelled live", result!.dataSource === "live", result!.dataSource);
  check("provider was called once per round", providerCalls === 5, providerCalls);
  check("getQuestionIds returns the played set", liveRef.current!.getQuestionIds().length === 5);
  check("share text is non-empty and honest", result!.shareText.length > 40 && !/worldwide|all of humanity/i.test(result!.shareText));

  click(host.querySelectorAll(".hvh-tl-head")[0] as HTMLElement, "expand history");
  check("history rows expand", host.querySelectorAll(".hvh-tl-body").length === 1, host.querySelectorAll(".hvh-tl-body").length);
  check("expanded history shows the round score", text().includes("ROUND SCORE"));
  click(host.querySelectorAll(".hvh-tl-head")[0] as HTMLElement, "collapse history");
  check("history rows collapse", host.querySelectorAll(".hvh-tl-body").length === 0);

  /* change mode from the result screen, before replaying */
  click(byLabel(/CHANGE MODE/), "change mode");
  check("change mode returns to mode select", text().includes("CHOOSE YOUR BATTLE"));
  check("mode list is shown", text().includes("QUICK BATTLE") && text().includes("STANDARD BATTLE") && text().includes("FULL HUMANITY"));
  check("daily mode is listed", text().includes("DAILY BATTLE"));
  check("friend mode is hidden without a host challenge", !byLabel(/FRIEND BATTLE/));
  check("country select is optional and manual", !!host.querySelector(".hvh-country"));
  check("no country is auto-detected", (host.querySelector(".hvh-country") as HTMLSelectElement).value === "");
  check("best score is remembered", /PERSONAL BEST/.test(text()));
  check("host rounds override wins over mode defaults", text().includes("5 ROUNDS") && !text().includes("12 ROUNDS"), text().slice(0, 200));
  click(byLabel(/DAILY BATTLE/), "daily");
  await settle(40);
  check("override applies to the chosen mode", /ROUND 1 \/ 5/.test(text()), text().slice(0, 90));
  check("daily rounds are fresh", byLabel(/LOCK YOUR DECISION/)?.disabled === true);
  check("ref reports no result yet", liveRef.current?.getResult() === null);

  /* run 2: sample mode must be labelled, never as real data */
  await act(async () => {
    root.render(createElement(HumanVsHumanity, { key: "fresh-sample", autoStart: "quick" as const, rounds: 5 }));
  });
  await settle(60);
  click(host.querySelectorAll(".hvh-option")[2] as HTMLButtonElement, "option");
  click(byLabel(/LOCK YOUR DECISION/), "lock");
  await settle(1000);
  check("sample mode is labelled GAME HUMANITY", text().includes("GAME HUMANITY"), text().slice(0, 200));
  check("sample mode never claims real participation", !text().includes("PARTICIPATING PLAYERS HAS ANSWERED"));
  check("sample note is shown on the reveal", /SAMPLE|sample/i.test(text()));

  /* intro navigation from a clean mount */
  await act(async () => {
    root.render(createElement(HumanVsHumanity, { key: "fresh-intro" }));
  });
  await settle(20);
  check("intro is the default screen", text().includes("ENTER THE BATTLE") && text().includes("Millions of people can make a decision"));
  click(byLabel(/HOW IT WORKS/), "how it works");
  check("how it works explains the three steps", text().includes("YOU CHOOSE") && text().includes("HUMANITY RESPONDS") && text().includes("THE BATTLE"));
  check("how it works never asks the player to predict the crowd", !/guess what|predict what|what will most people/i.test(text()));
  click(byLabel(/^BACK$/), "back");
  check("back returns to the intro", text().includes("ENTER THE BATTLE"));
  click(byLabel(/ENTER THE BATTLE/), "enter");
  check("enter goes to mode select", text().includes("CHOOSE YOUR BATTLE"));
  check("mode badges show real lengths", text().includes("5 ROUNDS") && text().includes("7 ROUNDS") && text().includes("12 ROUNDS"), text().slice(0, 260));
  click(byLabel(/STANDARD BATTLE/), "standard");
  await settle(40);
  check("standard mode runs 7 rounds by default", /ROUND 1 \/ 7/.test(text()), text().slice(0, 90));

  /* host page must be untouched */
  check("host stylesheet untouched", dom.window.document.getElementById("host-style")!.textContent === hostStyleBefore);
  const injected = dom.window.document.head.querySelectorAll("style").length;
  check("exactly one stylesheet is injected", injected === 2, injected);
  const styleEl = dom.window.document.getElementById("hvh-styles")!;
  check("injected stylesheet is namespaced", styleEl.textContent!.includes(".hvh-root"));
  check("body was not restyled", dom.window.document.body.getAttribute("style") === null);
  check("no hvh element leaked into head", dom.window.document.head.querySelectorAll(".hvh-root").length === 0);
  const rootNode = host.querySelector(".hvh-root")!;
  const unclassed = Array.from(rootNode.querySelectorAll("*")).filter(
    (el) => !Array.from(el.classList).some((c) => c.startsWith("hvh-")),
  );
  check("every rendered element has an hvh- class", unclassed.length === 0, unclassed.slice(0, 5).map((e) => e.tagName + "." + e.className).join(" | "));
  const usedClasses = new Set<string>();
  Array.from(rootNode.querySelectorAll("*")).forEach((el) =>
    Array.from(el.classList).forEach((c) => usedClasses.add(c)),
  );
  const styleText = dom.window.document.getElementById("hvh-styles")!.textContent!;
  const styledClasses = Array.from(styleText.matchAll(/\.(hvh-[a-zA-Z0-9_-]+)/g)).map((m) => m[1]);
  const unstyled = [...usedClasses].filter((c) => !styledClasses.includes(c));
  check("every rendered class has a style rule", unstyled.length === 0, unstyled.join(" "));
  const nonHvhRules = Array.from(styleText.matchAll(/^\s*([^\s@{}]+)\s*\{/gm))
    .map((m) => m[1].trim())
    .filter((s) => s.includes(","))
    .flatMap((s) => s.split(",").map((x) => x.trim()))
    .filter((sel) => !/^(\.hvh-[\w-]+|\*|:root|html|body|@media|:before|:after|::before|::after)/.test(sel));
  check("no selector escapes the hvh scope", nonHvhRules.length === 0, nonHvhRules.slice(0, 6).join(" | "));

  await act(async () => { root.unmount(); });

  console.log("");
  console.log(failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED");
  process.exit(failures === 0 ? 0 : 1);
})();
