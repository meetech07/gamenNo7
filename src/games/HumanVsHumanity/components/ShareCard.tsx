import type { HvhGameResult } from "../types";

/**
 * The visual share card. Everything on it comes from the player's own result.
 * A matching PNG is generated on demand for download / native share.
 */
export function ShareCard({ result }: { result: HvhGameResult }) {
  return (
    <div className="hvh-share-card" role="img" aria-label={`Share card: ${result.score} points, ${result.profile.name}`}>
      <span className="hvh-share-card-title">HUMAN VS HUMANITY</span>
      <div>
        <span className="hvh-micro" style={{ display: "block" }}>
          BATTLE SCORE
        </span>
        <span className="hvh-share-card-score" style={{ display: "block" }}>
          {result.score}
        </span>
      </div>
      <div className="hvh-stack hvh-gap-6">
        <span className="hvh-share-card-line">
          {result.metrics.alignment}% HUMANITY ALIGNMENT
        </span>
        <span className="hvh-share-card-line">{result.metrics.individuality}% INDIVIDUALITY</span>
        <span className="hvh-share-card-line">{result.metrics.adaptability}% ADAPTABILITY</span>
      </div>
      <div className="hvh-stack hvh-gap-6">
        <span className="hvh-profile-name" style={{ fontSize: 28, textAlign: "left" }}>
          {result.profile.name}
        </span>
        <span className="hvh-share-card-quote">“{result.profile.tagline}”</span>
      </div>
      <span className="hvh-share-card-cta">PLAY THE BATTLE</span>
    </div>
  );
}
