import { useRef, useState } from "react";
import HumanVsHumanity from "../src/games/HumanVsHumanity";
import type {
  HvhHumanityDistribution,
  HumanVsHumanityRef,
} from "../src/games/HumanVsHumanity";
import "../src/demoHost.css";

/**
 * Demo host. Proves the game works with zero setup: the only thing this file
 * does is render <HumanVsHumanity /> and (optionally) hand it data.
 */

type Mode = "minimal" | "live" | "challenge";

export default function App() {
  const [mode, setMode] = useState<Mode>("minimal");
  const gameRef = useRef<HumanVsHumanityRef>(null);
  const [hostScore, setHostScore] = useState<number | null>(null);

  return (
    <div className="host">
      <header className="host-bar">
        <strong>Host website (plain Vite + React, no framework)</strong>
        <div className="host-actions">
          <button onClick={() => setMode("minimal")}>MINIMAL</button>
          <button onClick={() => setMode("live")}>LIVE DATA</button>
          <button onClick={() => setMode("challenge")}>FRIEND CHALLENGE</button>
        </div>
      </header>

      <main>
        {mode === "minimal" ? (
          <HumanVsHumanity ref={gameRef} enableCountrySelection />
        ) : null}

        {mode === "live" ? (
          <HumanVsHumanity
            enableCountrySelection
            defaultCountry="IN"
            worldStats={{ totalPlayers: 15240, averageScore: 742, averageAlignment: 58, percentile: 79 }}
            humanityDataProvider={async (questionId, ctx): Promise<HvhHumanityDistribution | null> => {
              // Fake latency so the loading state is visible.
              await new Promise((r) => setTimeout(r, 450));
              const seedBase = questionId.length * 31 + (ctx.country ? ctx.country.charCodeAt(0) * 7 : 3);
              const raw = [22, 35, 19, 24];
              const shift = ctx.country ? ((ctx.country.charCodeAt(0) + seedBase) % 9) - 4 : 0;
              return {
                totalResponses: 4200 + (seedBase % 900),
                source: "demo-host",
                updatedAt: new Date().toISOString(),
                options: raw.map((v, i) => ({
                  optionId: ["a", "b", "c", "d"][i],
                  percentage: Math.max(2, v + shift - (i === 3 ? shift : 0)),
                })),
              };
            }}
            onComplete={(r) => console.log("game finished", r.score, r.profile.name)}
          />
        ) : null}

        {mode === "challenge" ? (
          <HumanVsHumanity
            challenge={
              hostScore !== null
                ? { challengeId: "ABC123", hostName: "Ravi", hostScore, hostProfile: "THE SPLIT READER" }
                : undefined
            }
            onChallengeCreate={async (result) => {
              setHostScore(result.score);
              return `ABC123`;
            }}
            onComplete={(r) => {
              console.log("outcome:", r.challengeOutcome, r.score, "vs", r.challengeHostScore);
            }}
          />
        ) : null}
      </main>
    </div>
  );
}
