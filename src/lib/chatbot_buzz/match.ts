import { intents, Intent } from "./intents";

function stemToken(token: string): string {
  // super simple stemmer, good enough for our use case
  if (token.endsWith("ing") && token.length > 4) {
    return token.slice(0, -3); // reporting -> report
  }
  if (token.endsWith("ed") && token.length > 3) {
    return token.slice(0, -2); // reported -> report
  }
  if (token.endsWith("s") && token.length > 3) {
    return token.slice(0, -1); // items -> item
  }
  return token;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(stemToken)
    .join(" ");
}

function toTokenSet(text: string): Set<string> {
  return new Set(
    text
      .split(" ")
      .map((t) => t.trim())
      .filter(Boolean)
  );
}

function scorePattern(messageTokens: Set<string>, pattern: string): number {
  const patternTokens = toTokenSet(normalize(pattern));
  if (patternTokens.size === 0) return 0;

  let matches = 0;
  for (const token of patternTokens) {
    if (messageTokens.has(token)) {
      matches += 1;
    }
  }
  return matches / patternTokens.size;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface ChatbotResult {
  reply: string;
  intent?: string;
  confidence: number;
}

export function getChatbotReply(message: string): ChatbotResult {
  const cleaned = normalize(message);
  const messageTokens = toTokenSet(cleaned);

  let bestIntent: Intent | null = null;
  let bestScore = 0;

  for (const intent of intents) {
    if (intent.patterns.length === 0) continue;

    let intentBest = 0;
    for (const pattern of intent.patterns) {
      const s = scorePattern(messageTokens, pattern);
      if (s > intentBest) {
        intentBest = s;
      }
    }

    if (intentBest > bestScore) {
      bestScore = intentBest;
      bestIntent = intent;
    }
  }

  // slightly higher threshold so very vague stuff falls back to default
  const threshold = 0.3;

  if (!bestIntent || bestScore < threshold) {
    const fallback =
      intents.find((i) => i.tag === "default") ?? intents[intents.length - 1];

    return {
      reply: pickRandom(fallback.responses),
      intent: fallback.tag,
      confidence: bestScore
    };
  }

  return {
    reply: pickRandom(bestIntent.responses),
    intent: bestIntent.tag,
    confidence: bestScore
  };
}