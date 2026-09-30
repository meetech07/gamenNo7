import type { HvhGameResult } from "../types";

/**
 * Share card renderer — plain Canvas 2D, zero dependencies, no network.
 * Returns a PNG data URL built entirely from the player's own result.
 */
export function renderShareCard(result: HvhGameResult, width = 1080, height = 1350): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const W = width;
  const H = height;
  const pad = 84;
  const font = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';

  /* background ---------------------------------------------------------- */
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b1026");
  bg.addColorStop(0.55, "#070a18");
  bg.addColorStop(1, "#120a24");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glowA = ctx.createRadialGradient(W * 0.08, 0, 0, W * 0.08, 0, W * 0.9);
  glowA.addColorStop(0, "rgba(34, 211, 238, 0.30)");
  glowA.addColorStop(1, "rgba(34, 211, 238, 0)");
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, W, H);

  const glowB = ctx.createRadialGradient(W, H, 0, W, H, W * 0.95);
  glowB.addColorStop(0, "rgba(139, 92, 246, 0.36)");
  glowB.addColorStop(1, "rgba(139, 92, 246, 0)");
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, W, H);

  /* frame ---------------------------------------------------------------- */
  roundRect(ctx, pad * 0.5, pad * 0.5, W - pad, H - pad, 40);
  ctx.strokeStyle = "rgba(255,255,255,0.13)";
  ctx.lineWidth = 3;
  ctx.stroke();

  /* header --------------------------------------------------------------- */
  ctx.font = `700 26px ${font}`;
  ctx.fillStyle = "#9fb0d8";
  ctx.textBaseline = "alphabetic";
  trackedText(ctx, "HUMAN VS HUMANITY", pad + 12, pad + 66, 7);

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad + 12, pad + 108);
  ctx.lineTo(W - pad - 12, pad + 108);
  ctx.stroke();

  /* score ---------------------------------------------------------------- */
  ctx.font = `800 24px ${font}`;
  ctx.fillStyle = "#8492b8";
  trackedText(ctx, "HUMANITY BATTLE SCORE", pad + 12, pad + 172, 5);

  const scoreGradient = ctx.createLinearGradient(pad + 12, 0, W - pad - 12, 0);
  scoreGradient.addColorStop(0, "#ffffff");
  scoreGradient.addColorStop(0.55, "#a5b4fc");
  scoreGradient.addColorStop(1, "#22d3ee");
  ctx.font = `900 240px ${font}`;
  ctx.fillStyle = scoreGradient;
  ctx.fillText(String(result.score), pad + 8, pad + 400);

  /* tagline -------------------------------------------------------------- */
  ctx.font = `500 30px ${font}`;
  ctx.fillStyle = "#b8c3e2";
  wrapText(ctx, "You have one brain. Humanity has millions.", pad + 14, pad + 466, W - pad * 2 - 28, 42);

  /* metrics -------------------------------------------------------------- */
  const metrics: Array<[string, number]> = [
    ["HUMANITY ALIGNMENT", result.metrics.alignment],
    ["INDIVIDUALITY", result.metrics.individuality],
    ["ADAPTABILITY", result.metrics.adaptability],
  ];
  let y = pad + 570;
  const barX = pad + 14;
  const barW = W - pad * 2 - 28;
  metrics.forEach(([name, value], i) => {
    ctx.font = `800 20px ${font}`;
    ctx.fillStyle = "#8ea0c9";
    trackedText(ctx, name, barX, y, 3.5);

    ctx.font = `800 30px ${font}`;
    ctx.fillStyle = "#f4f6ff";
    ctx.textAlign = "right";
    ctx.fillText(`${value}%`, W - pad - 14, y + 4);
    ctx.textAlign = "left";

    const by = y + 22;
    roundRect(ctx, barX, by, barW, 16, 8);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();

    const g = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    g.addColorStop(0, "#22d3ee");
    g.addColorStop(1, "#a78bfa");
    ctx.fillStyle = g;
    const w = Math.max(16, (barW * Math.max(0, Math.min(100, value))) / 100);
    roundRect(ctx, barX, by, w, 16, 8);
    ctx.fill();
    y += 74 + i * 0;
  });

  /* profile -------------------------------------------------------------- */
  const profileY = pad + 880;
  ctx.font = `700 22px ${font}`;
  ctx.fillStyle = "#7c8ab3";
  trackedText(ctx, "HUMANITY PROFILE", pad + 14, profileY, 5);

  const pg = ctx.createLinearGradient(pad + 12, 0, W - pad - 12, 0);
  pg.addColorStop(0, "#fde68a");
  pg.addColorStop(0.6, "#f9a8d4");
  pg.addColorStop(1, "#a5b4fc");
  ctx.font = `900 ${result.profile.name.length > 18 ? 66 : 84}px ${font}`;
  ctx.fillStyle = pg;
  wrapText(ctx, result.profile.name, pad + 12, profileY + 84, W - pad * 2 - 24, 82, 1);

  ctx.font = `500 30px ${font}`;
  ctx.fillStyle = "#d3dbf5";
  wrapText(ctx, result.profile.tagline, pad + 14, profileY + 216, W - pad * 2 - 28, 42, 1);

  /* footer --------------------------------------------------------------- */
  const fy = H - pad - 40;
  ctx.font = `800 24px ${font}`;
  ctx.fillStyle = "#7ff0ff";
  trackedText(ctx, "PLAY THE BATTLE", pad + 12, fy, 6);

  ctx.font = `600 22px ${font}`;
  ctx.fillStyle = "#6f7da6";
  ctx.textAlign = "right";
  ctx.fillText(`${result.rounds} ROUNDS  ·  ${result.participantsLabel}`, W - pad - 12, fy);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function trackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
): void {
  let cursor = x;
  for (const char of text) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + spacing;
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
): void {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}
