// src/functions/fishScore.ts

import type { PressurePhase, WaterClarityType } from '../types/weather';

/*
 * =========================================================
 * TUNING CONSTANTS
 * =========================================================
 */

export const FISH_SCORE_CONFIG = {
  componentScoreRange: {
    minimum: 0,
    maximum: 100,
  },
  weights: {
    pressure: 0.3,
    season: 0.2,
    waterTemperature: 0.2,
    clarity: 0.15,
    cloudCover: 0.1,
  },
  pressureScores: {
    rapidlyFalling: 85,
    falling: 80,
    establishedLow: 35,
    stableHigh: 80,
    rising: 70,
    stable: 75,
  } satisfies Record<PressurePhase, number>,
  seasonScores: {
    spring: 90,
    summer: 70,
    fall: 85,
    winter: 55,
  },
  seasonMonths: {
    spring: { first: 4, last: 6 },
    summer: { first: 7, last: 8 },
    fall: { first: 9, last: 10 },
  },
  waterTemperature: {
    missingValueScore: 50,
    ideal: 57,
    idealMin: 54,
    idealMax: 61,
    coldPenaltyStart: 40,
    warmPenaltyStart: 65,
    stressLimit: 68,
    scoreLossPerDegree: 7,
    coldMultiplier: 0.4,
    warmMultiplier: 0.45,
  },
  clarityScores: {
    clear: 70,
    slightlyStained: 100,
    stained: 75,
    highlyStained: 30,
  } satisfies Record<WaterClarityType, number>,
  cloudScoring: {
    coverMinimum: 0,
    coverMaximum: 100,
    clearComfortMinimum: 60,
    clearBrightMaximum: 20,
    clear: { base: 40, cloudBonus: 60 },
    slightlyStained: { base: 70, cloudBonus: 25 },
    stained: { base: 65, cloudBonus: 10 },
    highlyStained: { base: 55, cloudBonus: 0 },
  },
  scoreCaps: {
    warmWater: 35,
    establishedLow: 55,
  },
  labels: {
    excellent: 8.5,
    good: 7,
    fair: 5,
    poor: 3,
  },
} as const;

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

export interface DailyFishingConditions {
  pressurePhase: PressurePhase;

  /*
   * JavaScript month:
   * 1 = January
   * 12 = December
   */
  month: number;

  waterTemperature: number | null;

  clarity: WaterClarityType;

  cloudCover: number;
}

export interface DailyFishingScore {
  total: number;

  pressure: number;
  season: number;
  waterTemperature: number;
  clarity: number;
  cloudCover: number;

  label: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';

  reasons: string[];
}

/*
 * =========================================================
 * MAIN SCORE
 * =========================================================
 */

export function calculateDailyFishingScore(
  conditions: DailyFishingConditions,
): DailyFishingScore {
  const reasons: string[] = [];

  const pressure = getPressureScore(conditions.pressurePhase, reasons);

  const season = getSeasonScore(conditions.month, reasons);

  const waterTemperature = getWaterTemperatureScore(
    conditions.waterTemperature,
    reasons,
  );

  const clarity = getClarityScore(conditions.clarity, reasons);

  const cloudCover = getCloudScore(
    conditions.cloudCover,
    conditions.clarity,
    reasons,
  );

  let total =
    pressure * FISH_SCORE_CONFIG.weights.pressure +
    season * FISH_SCORE_CONFIG.weights.season +
    waterTemperature * FISH_SCORE_CONFIG.weights.waterTemperature +
    clarity * FISH_SCORE_CONFIG.weights.clarity +
    cloudCover * FISH_SCORE_CONFIG.weights.cloudCover;

  /*
   * Hard caps prevent secondary conditions
   * from overpowering major limiting factors.
   */
  if (
    conditions.waterTemperature &&
    conditions.waterTemperature >= FISH_SCORE_CONFIG.waterTemperature.stressLimit
  ) {
    total = Math.min(total, FISH_SCORE_CONFIG.scoreCaps.warmWater);

    reasons.push('Warm water significantly limits fishing quality');
  }

  if (conditions.pressurePhase === 'establishedLow') {
    total = Math.min(total, FISH_SCORE_CONFIG.scoreCaps.establishedLow);
  }

  const normalizedTotal = roundScore(total / 10);

  return {
    total: normalizedTotal,

    pressure,
    season,
    waterTemperature,
    clarity,
    cloudCover,

    label: getFishingScoreLabel(normalizedTotal),

    reasons,
  };
}

/*
 * =========================================================
 * PRESSURE
 * =========================================================
 */

function getPressureScore(phase: PressurePhase, reasons: string[]): number {
  switch (phase) {
    case 'rapidlyFalling':
      reasons.push(
        'Pressure is falling quickly and may trigger increased activity',
      );
      break;

    case 'falling':
      reasons.push('Approaching low pressure may improve short-term activity');
      break;

    case 'establishedLow':
      reasons.push('Established low pressure may make fishing more difficult');
      break;

    case 'stableHigh':
      reasons.push('Stable high pressure provides consistent conditions');
      break;

    case 'rising':
      reasons.push('Rising pressure has a mostly neutral effect');
      break;

    case 'stable':
      break;
  }

  return FISH_SCORE_CONFIG.pressureScores[phase];
}

/*
 * =========================================================
 * SEASON
 * =========================================================
 */

function getSeasonScore(month: number, reasons: string[]): number {
  const seasons = FISH_SCORE_CONFIG.seasonMonths;

  if (month >= seasons.spring.first && month <= seasons.spring.last) {
    reasons.push('Spring conditions are generally favorable');
    return FISH_SCORE_CONFIG.seasonScores.spring;
  }

  if (month >= seasons.summer.first && month <= seasons.summer.last) {
    reasons.push('Summer conditions depend heavily on water temperature');
    return FISH_SCORE_CONFIG.seasonScores.summer;
  }

  if (month >= seasons.fall.first && month <= seasons.fall.last) {
    reasons.push('Fall conditions are generally favorable');
    return FISH_SCORE_CONFIG.seasonScores.fall;
  }

  reasons.push('Cold-season conditions may reduce activity');

  return FISH_SCORE_CONFIG.seasonScores.winter;
}

/*
 * =========================================================
 * WATER TEMPERATURE
 * =========================================================
 */

function getWaterTemperatureScore(
  waterTemp: number | null,
  reasons: string[],
): number {
  if (!waterTemp) {
    return FISH_SCORE_CONFIG.waterTemperature.missingValueScore;
  }
  const distanceFromIdeal = Math.abs(
    waterTemp - FISH_SCORE_CONFIG.waterTemperature.ideal,
  );

  const scoreRange = FISH_SCORE_CONFIG.componentScoreRange;
  let score =
    scoreRange.maximum -
    distanceFromIdeal * FISH_SCORE_CONFIG.waterTemperature.scoreLossPerDegree;

  score = clamp(score, scoreRange.minimum, scoreRange.maximum);

  if (waterTemp >= FISH_SCORE_CONFIG.waterTemperature.stressLimit) {
    score = 0;
  } else if (
    waterTemp >= FISH_SCORE_CONFIG.waterTemperature.warmPenaltyStart
  ) {
    score *= FISH_SCORE_CONFIG.waterTemperature.warmMultiplier;
  } else if (
    waterTemp <= FISH_SCORE_CONFIG.waterTemperature.coldPenaltyStart
  ) {
    score *= FISH_SCORE_CONFIG.waterTemperature.coldMultiplier;
  }

  if (
    waterTemp >= FISH_SCORE_CONFIG.waterTemperature.idealMin &&
    waterTemp <= FISH_SCORE_CONFIG.waterTemperature.idealMax
  ) {
    reasons.push('Water temperature is in a strong trout feeding range');
  }

  return roundScore(score);
}

/*
 * =========================================================
 * WATER CLARITY
 * =========================================================
 */

function getClarityScore(clarity: WaterClarityType, reasons: string[]): number {
  switch (clarity) {
    case 'slightlyStained':
      reasons.push(
        'Light stain provides good visibility with reduced fish wariness',
      );
      break;

    case 'clear':
      reasons.push('Clear water may make fish more cautious');
      break;

    case 'stained':
      reasons.push('Reduced visibility may limit feeding efficiency');
      break;

    case 'highlyStained':
      reasons.push('Heavy stain significantly reduces visibility');
      break;
  }

  return FISH_SCORE_CONFIG.clarityScores[clarity];
}

/*
 * =========================================================
 * CLOUD COVER
 * =========================================================
 */

function getCloudScore(
  cloudCover: number,
  clarity: WaterClarityType,
  reasons: string[],
): number {
  const cloudConfig = FISH_SCORE_CONFIG.cloudScoring;
  const scoreRange = FISH_SCORE_CONFIG.componentScoreRange;
  const normalizedCloudCover =
    clamp(cloudCover, cloudConfig.coverMinimum, cloudConfig.coverMaximum) /
    cloudConfig.coverMaximum;

  const config = cloudConfig[clarity];

  const score = config.base + normalizedCloudCover * config.cloudBonus;

  if (
    clarity === 'clear' &&
    cloudCover >= cloudConfig.clearComfortMinimum
  ) {
    reasons.push('Cloud cover improves fish comfort in clear water');
  }

  if (
    clarity === 'clear' &&
    cloudCover <= cloudConfig.clearBrightMaximum
  ) {
    reasons.push(
      'Bright conditions may make fish more cautious in clear water',
    );
  }

  return roundScore(
    clamp(score, scoreRange.minimum, scoreRange.maximum),
  );
}

/*
 * =========================================================
 * DISPLAY HELPERS
 * =========================================================
 */

export function getFishingScoreLabel(
  score: number,
): DailyFishingScore['label'] {
  if (score >= FISH_SCORE_CONFIG.labels.excellent) {
    return 'Excellent';
  }

  if (score >= FISH_SCORE_CONFIG.labels.good) {
    return 'Good';
  }

  if (score >= FISH_SCORE_CONFIG.labels.fair) {
    return 'Fair';
  }

  if (score >= FISH_SCORE_CONFIG.labels.poor) {
    return 'Poor';
  }

  return 'Very Poor';
}

/*
 * =========================================================
 * GENERIC HELPERS
 * =========================================================
 */

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}
