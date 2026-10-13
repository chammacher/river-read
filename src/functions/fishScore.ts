// src/functions/fishScore.ts

import type {
  PressurePhase,
  WaterClarityType,
} from '../types/weather';

/*
 * =========================================================
 * TUNING CONSTANTS
 * =========================================================
 */

const SCORE_WEIGHTS = {
  pressure: 0.3,
  season: 0.2,
  waterTemperature: 0.2,
  clarity: 0.15,
  cloudCover: 0.1,
};

const PRESSURE_SCORES: Record<PressurePhase, number> = {
  rapidlyFalling: 85,
  falling: 80,
  establishedLow: 35,
  stableHigh: 75,
  rising: 70,
  stable: 65,
};

const SEASON_SCORES = {
  spring: 85,
  summer: 70,
  fall: 90,
  winter: 55,
};

const WATER_TEMP = {
  ideal: 57,

  idealMin: 54,
  idealMax: 61,

  coldPenaltyStart: 40,

  warmPenaltyStart: 65,
  stressLimit: 68,

  scoreLossPerDegree: 7,

  coldMultiplier: 0.4,
  warmMultiplier: 0.45,
};

const CLARITY_SCORES: Record<WaterClarityType, number> = {
  clear: 75,
  slightlyStained: 100,
  stained: 60,
  highlyStained: 30,
};

const CLOUD_SCORING = {
  clear: {
    base: 40,
    cloudBonus: 60,
  },

  slightlyStained: {
    base: 70,
    cloudBonus: 25,
  },

  stained: {
    base: 65,
    cloudBonus: 10,
  },

  highlyStained: {
    base: 55,
    cloudBonus: 0,
  },
};

const SCORE_CAPS = {
  warmWater: 35,
  establishedLow: 55,
};

const SCORE_LABELS = {
  excellent: 8.5,
  good: 7,
  fair: 5,
  poor: 3,
};

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

  label:
    | 'Excellent'
    | 'Good'
    | 'Fair'
    | 'Poor'
    | 'Very Poor';

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

  const pressure = getPressureScore(
    conditions.pressurePhase,
    reasons,
  );

  const season = getSeasonScore(
    conditions.month,
    reasons,
  );

  const waterTemperature =
    getWaterTemperatureScore(
      conditions.waterTemperature,
      reasons,
    );

  const clarity = getClarityScore(
    conditions.clarity,
    reasons,
  );

  const cloudCover = getCloudScore(
    conditions.cloudCover,
    conditions.clarity,
    reasons,
  );

  let total =
    pressure * SCORE_WEIGHTS.pressure +
    season * SCORE_WEIGHTS.season +
    waterTemperature *
      SCORE_WEIGHTS.waterTemperature +
    clarity * SCORE_WEIGHTS.clarity +
    cloudCover * SCORE_WEIGHTS.cloudCover;

  /*
   * Hard caps prevent secondary conditions
   * from overpowering major limiting factors.
   */
  if (conditions.waterTemperature &&
    conditions.waterTemperature >=
    WATER_TEMP.stressLimit
  ) {
    total = Math.min(
      total,
      SCORE_CAPS.warmWater,
    );

    reasons.push(
      'Warm water significantly limits fishing quality',
    );
  }

  if (
    conditions.pressurePhase ===
    'establishedLow'
  ) {
    total = Math.min(
      total,
      SCORE_CAPS.establishedLow,
    );
  }

  const normalizedTotal =
    roundScore(total / 10);

  return {
    total: normalizedTotal,

    pressure,
    season,
    waterTemperature,
    clarity,
    cloudCover,

    label:
      getFishingScoreLabel(
        normalizedTotal,
      ),

    reasons,
  };
}

/*
 * =========================================================
 * PRESSURE
 * =========================================================
 */

function getPressureScore(
  phase: PressurePhase,
  reasons: string[],
): number {
  switch (phase) {
    case 'rapidlyFalling':
      reasons.push(
        'Pressure is falling quickly and may trigger increased activity',
      );
      break;

    case 'falling':
      reasons.push(
        'Approaching low pressure may improve short-term activity',
      );
      break;

    case 'establishedLow':
      reasons.push(
        'Established low pressure may make fishing more difficult',
      );
      break;

    case 'stableHigh':
      reasons.push(
        'Stable high pressure provides consistent conditions',
      );
      break;

    case 'rising':
      reasons.push(
        'Rising pressure has a mostly neutral effect',
      );
      break;

    case 'stable':
      break;
  }

  return PRESSURE_SCORES[phase];
}

/*
 * =========================================================
 * SEASON
 * =========================================================
 */

function getSeasonScore(
  month: number,
  reasons: string[],
): number {
  /*
   * Spring
   */
  if (month >= 4 && month <= 6) {
    reasons.push(
      'Spring conditions are generally favorable',
    );

    return SEASON_SCORES.spring;
  }

  /*
   * Summer
   */
  if (month >= 7 && month <= 8) {
    reasons.push(
      'Summer conditions depend heavily on water temperature',
    );

    return SEASON_SCORES.summer;
  }

  /*
   * Fall
   */
  if (
    month >= 9 &&
    month <= 10
  ) {
    reasons.push(
      'Fall conditions are generally favorable',
    );

    return SEASON_SCORES.fall;
  }

  /*
   * Winter / late fall
   */
  reasons.push(
    'Cold-season conditions may reduce activity',
  );

  return SEASON_SCORES.winter;
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
    return 50;
  }
  const distanceFromIdeal =
    Math.abs(
      waterTemp -
        WATER_TEMP.ideal,
    );

  let score =
    100 -
    distanceFromIdeal *
      WATER_TEMP.scoreLossPerDegree;

  score = clamp(
    score,
    0,
    100,
  );

  if (
    waterTemp >=
    WATER_TEMP.stressLimit
  ) {
    score = 0;
  } else if (
    waterTemp >=
    WATER_TEMP.warmPenaltyStart
  ) {
    score *=
      WATER_TEMP.warmMultiplier;
  } else if (
    waterTemp <=
    WATER_TEMP.coldPenaltyStart
  ) {
    score *=
      WATER_TEMP.coldMultiplier;
  }

  if (
    waterTemp >=
      WATER_TEMP.idealMin &&
    waterTemp <=
      WATER_TEMP.idealMax
  ) {
    reasons.push(
      'Water temperature is in a strong trout feeding range',
    );
  }

  return roundScore(score);
}

/*
 * =========================================================
 * WATER CLARITY
 * =========================================================
 */

function getClarityScore(
  clarity: WaterClarityType,
  reasons: string[],
): number {
  switch (clarity) {
    case 'slightlyStained':
      reasons.push(
        'Light stain provides good visibility with reduced fish wariness',
      );
      break;

    case 'clear':
      reasons.push(
        'Clear water may make fish more cautious',
      );
      break;

    case 'stained':
      reasons.push(
        'Reduced visibility may limit feeding efficiency',
      );
      break;

    case 'highlyStained':
      reasons.push(
        'Heavy stain significantly reduces visibility',
      );
      break;
  }

  return CLARITY_SCORES[
    clarity
  ];
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
  const normalizedCloudCover =
    clamp(
      cloudCover,
      0,
      100,
    ) / 100;

  const config =
    CLOUD_SCORING[clarity];

  const score =
    config.base +
    normalizedCloudCover *
      config.cloudBonus;

  if (
    clarity === 'clear' &&
    cloudCover >= 60
  ) {
    reasons.push(
      'Cloud cover improves fish comfort in clear water',
    );
  }

  if (
    clarity === 'clear' &&
    cloudCover <= 20
  ) {
    reasons.push(
      'Bright conditions may make fish more cautious in clear water',
    );
  }

  return roundScore(
    clamp(
      score,
      0,
      100,
    ),
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
  if (
    score >=
    SCORE_LABELS.excellent
  ) {
    return 'Excellent';
  }

  if (
    score >= SCORE_LABELS.good
  ) {
    return 'Good';
  }

  if (
    score >= SCORE_LABELS.fair
  ) {
    return 'Fair';
  }

  if (
    score >= SCORE_LABELS.poor
  ) {
    return 'Poor';
  }

  return 'Very Poor';
}

/*
 * =========================================================
 * GENERIC HELPERS
 * =========================================================
 */

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    max,
    Math.max(min, value),
  );
}

function roundScore(
  value: number,
): number {
  return (
    Math.round(
      value * 10,
    ) / 10
  );
}