import type { HvhMetrics, HvhProfile } from "../types";

/**
 * Humanity Profiles.
 *
 * Assignment is fully deterministic: the classifier below runs the measured
 * metrics (alignment, individuality, adaptability, consistency, risk) through
 * an ordered rule list and returns the first match. No randomness, ever.
 */

export const PROFILES: HvhProfile[] = [
  {
    id: "crowd-compass",
    name: "THE CROWD COMPASS",
    tagline: "You navigate by what everyone else is already doing.",
    description:
      "You read the room and you trust it. Most rounds you land where the largest group landed, and you did it without hesitation. In games like this, that is a real strength — being wrong in the same direction as most people is a survivable way to be wrong.",
    strength: "You rarely overthink a decision you have already seen the shape of.",
    watchout: "When the crowd is wrong, you have no early warning.",
  },
  {
    id: "static-majority",
    name: "THE STATIC MAJORITY",
    tagline: "Same signal, every single round.",
    description:
      "You answered as if the questions were the same question. Your style did not move, and that is exactly why your consistency score is high. You know your own setting, which is rarer than people think.",
    strength: "Nobody can rattle you. You play the same way under any pressure.",
    watchout: "A single wrong read stays wrong for the whole game.",
  },
  {
    id: "split-reader",
    name: "THE SPLIT READER",
    tagline: "You feel exactly where a crowd breaks apart.",
    description:
      "You kept landing on choices that sat right next to the plurality, close enough that the margin was noise. You are unusually comfortable in the gap between two opinions, and the game rarely punished you for it.",
    strength: "You can survive in a game that has no safe answer.",
    watchout: "Almost staying with the crowd is not the same as deciding with it.",
  },
  {
    id: "independent-signal",
    name: "THE INDEPENDENT SIGNAL",
    tagline: "You don't automatically follow the crowd. You also don't reject it just to be different.",
    description:
      "You didn't reach for the rare option every single time — you reached for the one you actually wanted, and the crowd just happened to be elsewhere. Occasionally you surprised everyone, including yourself.",
    strength: "Your decisions come from you first, which is very hard to fake.",
    watchout: "Independence pays best when there is something to be independent about.",
  },
  {
    id: "open-question",
    name: "THE OPEN QUESTION",
    tagline: "You answered every dilemma with a question back.",
    description:
      "Half your options were refusals, hedges, or a fourth door nobody else opened. You kept the game open instead of closing it down, and the data kept disagreeing with you in interesting ways.",
    strength: "You resist pressure to pick when picking would be dishonest.",
    watchout: "Sometimes a decision only exists once you commit to it.",
  },
  {
    id: "quiet-middle",
    name: "THE QUIET MIDDLE",
    tagline: "Never loud. Never wrong. Never memorable.",
    description:
      "You didn't chase the crowd and you didn't run from it. Your answers sat in the middle of every distribution, which kept you safe and kept you unremarkable. The game rewards extremes more than it admits.",
    strength: "Very hard to eliminate from a group.",
    watchout: "A safe game is not the same as a won game.",
  },
  {
    id: "context-switch",
    name: "THE CONTEXT SWITCH",
    tagline: "You answer the question you were asked, every time.",
    description:
      "Your style visibly changed depending on the kind of scenario in front of you — cautious on risk, generous on social, greedy on practical. That is not randomness. That is reading the room you are actually in.",
    strength: "You adapt to the problem instead of replaying a favourite answer.",
    watchout: "Switching costs you when the first instinct was right.",
  },
  {
    id: "unmovable-line",
    name: "THE UNMOVABLE LINE",
    tagline: "You found your setting early and you never moved it.",
    description:
      "You answered the way you answer, and you answered it the same way in every category. High consistency, low drift. The crowd moved; you did not, and you stayed completely comfortable there.",
    strength: "You cannot be outplayed by a shifting majority.",
    watchout: "The game can move on without you.",
  },
  {
    id: "rare-tide-picker",
    name: "THE RARE-TIDE PICKER",
    tagline: "You read the tail of the distribution and leaned in.",
    description:
      "You kept choosing the option the crowd had not noticed yet, and you did it with the spread in front of you. Not defiance — timing.",
    strength: "You find value where the majority has not looked yet.",
    watchout: "The tail is still a minority, however good it feels.",
  },
  {
    id: "steady-hand",
    name: "THE STEADY HAND",
    tagline: "No spikes, no fades. Just a clean line.",
    description:
      "Nothing dramatic happened in your game. Your choices held their shape, your scores held their shape, and you finished exactly as consistent as you started.",
    strength: "You are extremely hard to read and to push.",
    watchout: "You left the biggest scores on the table.",
  },
  {
    id: "bridge-builder",
    name: "THE BRIDGE BUILDER",
    tagline: "Popular enough to fit in. Rare enough to matter.",
    description:
      "You somehow kept landing on choices that were both widely chosen and distinctly yours. Alignment and individuality at the same time is a narrow corridor, and you walked it.",
    strength: "You move through a crowd without disappearing into it.",
    watchout: "The corridor closes when the game gets louder.",
  },
  {
    id: "late-switcher",
    name: "THE LATE SWITCHER",
    tagline: "Same opening, different ending.",
    description:
      "You started the game in one style and finished in another, and the data noticed. Your adaptability is high, your consistency is not — which usually means you were still learning the shape of the game when it ended.",
    strength: "You can change your mind without it costing you much.",
    watchout: "Most of your learning happened after the score was already locked.",
  },
  {
    id: "fluid-strategist",
    name: "THE FLUID STRATEGIST",
    tagline: "You changed with the scenario and held the line when it mattered.",
    description:
      "Your style moved with the category of the question, and it moved back again. That combination — flexible but not erratic — is the hardest profile in the game to fake.",
    strength: "You read difficulty instead of guessing at it.",
    watchout: "Flexibility needs a fallback, and you do not always keep one.",
  },
  {
    id: "deep-end",
    name: "THE DEEP END",
    tagline: "You took the least popular option more than once.",
    description:
      "You went past the second choice, past the third, straight to the one with the shortest bar — and you did it knowing the exact number. That is not a mistake. That is a position.",
    strength: "You are willing to be the only one in the room.",
    watchout: "Being right is easier to claim than to prove.",
  },
  {
    id: "draft-hunter",
    name: "THE DRAFT HUNTER",
    tagline: "You picked from the bottom half and scored like a favourite.",
    description:
      "You took the unglamorous options, the ones nobody drafts, and still produced a strong result. The game rewarded you anyway.",
    strength: "You find value where the crowd stopped looking.",
    watchout: "Low picks can hide a low-quality decision behind a brave look.",
  },
  {
    id: "mirror-player",
    name: "THE MIRROR PLAYER",
    tagline: "You played the room, not the question.",
    description:
      "Your choices tracked the crowd more closely than your own preferences, round after round. It is an efficient way to win a social game. It is also very visible.",
    strength: "You are always in the group that matters.",
    watchout: "You stopped being a player and became a statistic.",
  },
  {
    id: "unpredictable-signal",
    name: "THE UNPREDICTABLE SIGNAL",
    tagline: "Nobody can model you, including you.",
    description:
      "Your pattern changed with the category, your alignment and your individuality both swung, and your consistency score reflects a genuinely unstable style. In a live economy of decisions, that is either an asset or a liability.",
    strength: "You are genuinely hard to predict and hard to manipulate.",
    watchout: "Unpredictable is not the same as unreadable by you.",
  },
  {
    id: "swing-voter",
    name: "THE SWING VOTER",
    tagline: "You went where the argument was strongest.",
    description:
      "You moved between the crowd and the tail as the distribution moved under you. Most of your swings happened when the top two were almost level, which is the only time swinging is actually cheap.",
    strength: "You capitalise on the moments a decision is genuinely open.",
    watchout: "Being undecided in a tie is not the same as choosing well.",
  },
  {
    id: "middle-ground-architect",
    name: "THE MIDDLE-GROUND ARCHITECT",
    tagline: "You built your game on the second option.",
    description:
      "Not the safest choice, not the boldest — the one with the second-longest bar. You treated every dilemma as a negotiation and kept winning it.",
    strength: "You are almost never the most extreme person in the room.",
    watchout: "Second place is comfortable and rarely memorable.",
  },
];

/**
 * Deterministic profile classifier.
 * Runs an ordered rule list; the first rule that matches wins.
 */
export function classifyProfile(
  metrics: HvhMetrics,
  facts: {
    perfectSplits: number;
    rareChoices: number;
    crowdMatches: number;
    totalRounds: number;
    declines: number;
    lateSwitch: boolean;
  },
): HvhProfile {
  const a = metrics.alignment;
  const i = metrics.individuality;
  const ad = metrics.adaptability;
  const c = metrics.consistency;
  const r = metrics.risk;

  const matches = (profileId: string): HvhProfile => {
    const found = PROFILES.find((p) => p.id === profileId);
    /* istanbul ignore next - ids are static and always present */
    if (!found) throw new Error("Unknown profile: " + profileId);
    return found;
  };

  const declineHeavy = facts.declines >= Math.max(2, Math.ceil(facts.totalRounds * 0.4));

  const rules: Array<[boolean, string]> = [
    // Distinctive behaviours first, then the corridors, then the middle zone.
    [declineHeavy && a <= 72, "open-question"],
    [a <= 42 && i >= 68 && r >= 70, "deep-end"],
    [a <= 48 && i >= 62, "independent-signal"],
    [i >= 70 && c >= 68, "draft-hunter"],
    [a >= 70 && i <= 38, "crowd-compass"],
    [a >= 68 && i <= 45 && c >= 58, "static-majority"],
    [a >= 64 && i >= 55, "bridge-builder"],
    [a <= 46 && i <= 46, "quiet-middle"],
    [a >= 62 && ad >= 60, "context-switch"],
    [a >= 62 && ad < 40, "swing-voter"],
    [ad >= 70 && c <= 48, "unpredictable-signal"],
    [c >= 72 && ad <= 45, "unmovable-line"],
    [c >= 66 && ad <= 55 && r <= 60, "steady-hand"],
    [ad >= 66 && c >= 62, "fluid-strategist"],
    [facts.lateSwitch && c <= 62, "late-switcher"],
    [c >= 60 && a >= 52 && i >= 52, "split-reader"],
    [a >= 50 && a <= 68 && i >= 48 && i <= 66, "middle-ground-architect"],
    [i >= 55 && r >= 55, "rare-tide-picker"],
    [facts.perfectSplits >= 1 && facts.rareChoices === 0 && facts.crowdMatches >= 3, "mirror-player"],
    [a >= 50, "crowd-compass"],
    [i >= 50, "rare-tide-picker"],
    [ad >= 55, "context-switch"],
    [c >= 55, "steady-hand"],
    [facts.crowdMatches >= 1, "swing-voter"],
    [true, "quiet-middle"],
  ];

  for (const [ok, id] of rules) {
    if (ok) return matches(id);
  }
  return matches("quiet-middle");
}
