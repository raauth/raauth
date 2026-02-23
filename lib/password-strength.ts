import { zxcvbn, zxcvbnOptions, type Score } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

type PasswordStrengthTone = {
  label: "Muito fraca" | "Fraca" | "Razoável" | "Boa" | "Forte";
  progressClassName: string;
  textClassName: string;
};

export type PasswordStrengthSummary = {
  score: Score;
  label: PasswordStrengthTone["label"];
  progressPercent: number;
  progressClassName: string;
  textClassName: string;
  warning: string | null;
  suggestions: string[];
  crackTimeDisplay: string;
};

const PASSWORD_STRENGTH_TONE: Record<Score, PasswordStrengthTone> = {
  0: {
    label: "Muito fraca",
    progressClassName: "bg-red-500",
    textClassName: "text-red-500",
  },
  1: {
    label: "Fraca",
    progressClassName: "bg-orange-500",
    textClassName: "text-orange-500",
  },
  2: {
    label: "Razoável",
    progressClassName: "bg-yellow-500",
    textClassName: "text-yellow-500",
  },
  3: {
    label: "Boa",
    progressClassName: "bg-lime-500",
    textClassName: "text-lime-500",
  },
  4: {
    label: "Forte",
    progressClassName: "bg-emerald-500",
    textClassName: "text-emerald-500",
  },
};

let hasConfiguredZxcvbn = false;

function ensureZxcvbnConfigured() {
  if (hasConfiguredZxcvbn) {
    return;
  }

  zxcvbnOptions.setOptions({
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    translations: zxcvbnEnPackage.translations,
    useLevenshteinDistance: true,
  });

  hasConfiguredZxcvbn = true;
}

function toScore(value: number): Score {
  if (value <= 0) {
    return 0;
  }

  if (value >= 4) {
    return 4;
  }

  return value as Score;
}

export function resolvePasswordStrengthTone(score: number): PasswordStrengthTone {
  return PASSWORD_STRENGTH_TONE[toScore(score)];
}

export function evaluatePasswordStrength(
  password: string,
  userInputs: (string | number)[] = [],
): PasswordStrengthSummary | null {
  if (!password.trim()) {
    return null;
  }

  ensureZxcvbnConfigured();

  const filteredUserInputs = userInputs.filter((value) => {
    if (typeof value === "number") {
      return true;
    }

    return value.trim().length > 0;
  });

  const result = zxcvbn(password, filteredUserInputs);
  const score = toScore(result.score);
  const tone = resolvePasswordStrengthTone(score);

  return {
    score,
    label: tone.label,
    progressPercent: ((score + 1) / 5) * 100,
    progressClassName: tone.progressClassName,
    textClassName: tone.textClassName,
    warning: result.feedback.warning || null,
    suggestions: result.feedback.suggestions,
    crackTimeDisplay: result.crackTimesDisplay.offlineSlowHashing1e4PerSecond,
  };
}
