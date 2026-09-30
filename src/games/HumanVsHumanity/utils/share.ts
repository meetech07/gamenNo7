import type { HvhGameResult } from "../types";

/* ------------------------------------------------------------------ storage */

export const DEFAULT_STORAGE_KEY = "hvh.best.v1";

export function readBest(key: string): number {
  if (!key || typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(key);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function writeBest(key: string, score: number): void {
  if (!key || typeof window === "undefined") return;
  try {
    const prev = readBest(key);
    if (score > prev) window.localStorage.setItem(key, String(score));
  } catch {
    /* storage unavailable - the game still works, it just forgets. */
  }
}

/* -------------------------------------------------------------------- share */

export type ShareOutcome = "shared" | "copied" | "failed";

export interface ShareInput {
  title: string;
  text: string;
  cardDataUrl?: string;
}

/** Web Share API first, clipboard fallback second. Never claims success falsely. */
export async function shareResult(input: ShareInput): Promise<ShareOutcome> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      const file = input.cardDataUrl ? dataUrlToFile(input.cardDataUrl, "humanity-card.png") : null;
      if (file && typeof navigator.canShare === "function") {
        const payload: { title: string; text: string; files: File[] } = {
          title: input.title,
          text: input.text,
          files: [file],
        };
        if (navigator.canShare(payload)) {
          await navigator.share(payload);
          return "shared";
        }
      }
      await navigator.share({ title: input.title, text: input.text });
      return "shared";
    } catch (err) {
      if (isAbort(err)) return "failed";
    }
  }
  return copyText(input.text);
}

export async function copyText(text: string): Promise<ShareOutcome> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    if (typeof document === "undefined") return "failed";
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.pointerEvents = "none";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand && document.execCommand("copy");
    document.body.removeChild(ta);
    return ok ? "copied" : "failed";
  } catch {
    return "failed";
  }
}

function isAbort(err: unknown): boolean {
  return !!err && typeof err === "object" && (err as { name?: string }).name === "AbortError";
}

function dataUrlToFile(dataUrl: string, name: string): File | null {
  try {
    const [head, body] = dataUrl.split(",");
    const mimeMatch = /:(.*?);/.exec(head);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bin = atob(body);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], name, { type: mime });
  } catch {
    return null;
  }
}

export function canShareFiles(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    typeof File !== "undefined"
  );
}

export function triggerDownload(dataUrl: string, filename: string): void {
  if (typeof document === "undefined") return;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function shareTitle(result: HvhGameResult): string {
  return `Human vs Humanity — ${result.score} · ${result.profile.name}`;
}
