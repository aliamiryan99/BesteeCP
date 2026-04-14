// Level Thresholds
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  1000,   // Level 2
  2500,   // Level 3
  5000,   // Level 4
  8500,   // Level 5
  13000,  // Level 6
  18500,  // Level 7
  25000,  // Level 8
  32500,  // Level 9
  41000   // Level 10
];

export const MAX_LEVEL = 10;

export function getLevelInfo(xp: number = 0) {
  let level = 1;
  let nextThreshold = LEVEL_THRESHOLDS[1];
  let currentThreshold = LEVEL_THRESHOLDS[0];

  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      currentThreshold = LEVEL_THRESHOLDS[i];
      nextThreshold = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i]; // Cap at max
    } else {
      nextThreshold = LEVEL_THRESHOLDS[i];
      break;
    }
  }

  const isMaxLevel = level >= MAX_LEVEL;
  const xpInCurrentLevel = xp - currentThreshold;
  const xpRequiredForNext = isMaxLevel ? 0 : nextThreshold - currentThreshold;
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForNext) * 100));

  return {
    level: Math.min(level, MAX_LEVEL),
    currentXp: xp,
    nextThreshold,
    currentThreshold,
    xpInCurrentLevel,
    xpRequiredForNext,
    progressPercent,
    isMaxLevel,
  };
}
