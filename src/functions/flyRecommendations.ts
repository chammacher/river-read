import type {
  ColorRecommendation,
  ColorScore,
  FishingRegion,
  FishingSeason,
  FlyCategory,
  FlyColor,
  FlyPattern,
  FlyRecommendation,
  FlyRecommendationConditions,
} from '../types/fly';

import { flyPatterns } from '../data/flyPatterns';

export const FLY_RECOMMENDATION_CONFIG = {
  fishingSeason: {
    transitionDay: 15,
    months: {
      winter: [12, 1],
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
    },
  },
  recommendation: {
    regionBonus: 2,
    seasonBonus: 3,
    maximumPatterns: 5,
    missingWaterTemperature: 55,
  },
  colors: {
    brightColors: ['pink', 'orange', 'red', 'chartreuse'],
    naturalColors: ['natural', 'olive', 'brown', 'tan', 'gray'],
    topOptions: {
      maximumResults: 3,
      maximumScoreGap: 4,
    },
    score: {
      clear: { bright: -4, natural: 3 },
      slightlyStained: { natural: 2, bright: 1 },
      stained: { bright: 4, black: 3, natural: 0 },
      highlyStained: { bright: 5, black: 4, natural: -3 },
      recentRainThreshold: 0.3,
      recentRainBrightBonus: 2,
      highContrastColor: 'black',
    },
    preferredColors: {
      highlyStained: ['pink', 'orange', 'chartreuse', 'red', 'black'],
      stained: ['pink', 'orange', 'red', 'black'],
      recentRain: ['pink', 'orange', 'natural', 'olive'],
      slightlyStained: ['olive', 'brown', 'tan', 'black', 'natural'],
      clear: ['natural', 'olive', 'brown', 'tan', 'black'],
    },
  },
  categories: {
    minimumScore: 0,
    scud: {
      baseScore: 2,
      upperMidwestBonus: 4,
      coolWaterMaximum: 52,
      coolWaterBonus: 2,
      moderateWaterMinimum: 52,
      moderateWaterMaximum: 62,
      moderateWaterBonus: 1,
      slightlyStainedBonus: 1,
      highlyStainedPenalty: 2,
    },
    attractorNymph: {
      baseScore: 3,
      slightlyStainedBonus: 2,
      stainedBonus: 1,
      suitableWaterMinimum: 45,
      suitableWaterMaximum: 65,
      suitableWaterBonus: 1,
    },
    streamer: {
      baseScore: 1,
      stainedBonus: 4,
      slightlyStainedBonus: 2,
      cloudCoverMinimum: 60,
      cloudCoverBonus: 2,
      fallingPressureBonus: 2,
    },
    terrestrial: {
      baseScore: 0,
      favorableSeasons: ['lateSummer', 'earlyFall'],
      favorableSeasonBonus: 6,
      suitableWaterMinimum: 55,
      suitableWaterMaximum: 65,
      suitableWaterBonus: 2,
      clearWaterBonus: 1,
    },
    stonefly: {
      baseScore: 0,
      favorableSeasons: ['lateSpring', 'earlySummer'],
      favorableSeasonBonus: 5,
      suitableWaterMinimum: 48,
      suitableWaterMaximum: 62,
      suitableWaterBonus: 2,
      slightlyStainedBonus: 1,
    },
    caddis: {
      baseScore: 0,
      favorableSeasons: ['lateSpring', 'earlySummer', 'lateSummer'],
      favorableSeasonBonus: 5,
      suitableWaterMinimum: 52,
      suitableWaterMaximum: 65,
      suitableWaterBonus: 2,
      clearWaterBonus: 1,
    },
    pmd: {
      baseScore: 0,
      favorableSeasons: ['lateSpring', 'earlySummer'],
      favorableSeasonBonus: 6,
      suitableWaterMinimum: 50,
      suitableWaterMaximum: 62,
      suitableWaterBonus: 2,
      cloudCoverMinimum: 30,
      cloudCoverMaximum: 80,
      cloudCoverBonus: 1,
    },
    midge: {
      baseScore: 2,
      favorableSeasons: ['winter', 'earlySpring', 'lateFall'],
      favorableSeasonBonus: 5,
      coolWaterMaximum: 50,
      coolWaterBonus: 2,
    },
    bwo: {
      baseScore: 0,
      favorableSeasons: ['earlySpring', 'earlyFall', 'lateFall'],
      favorableSeasonBonus: 5,
      suitableWaterMinimum: 45,
      suitableWaterMaximum: 58,
      suitableWaterBonus: 2,
      cloudCoverMinimum: 60,
      cloudCoverBonus: 3,
    },
    worm: {
      baseScore: 0,
      rainyDayMinimum: 0.2,
      recentRainBonus: 5,
      stainedWaterBonus: 4,
      slightlyStainedBonus: 2,
    },
  },
} as const;

export interface CategoryScore {
  category: FlyCategory;
  score: number;
  reasons: string[];
}

export function getFishingSeason(date: Date | string): FishingSeason {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  const month = parsedDate.getMonth() + 1;

  const day = parsedDate.getDate();
  const config = FLY_RECOMMENDATION_CONFIG.fishingSeason;

  if (config.months.winter.some(seasonMonth => seasonMonth === month)) {
    return 'winter';
  }

  if (month === config.months.february) {
    return day <= config.transitionDay ? 'winter' : 'earlySpring';
  }

  if (month === config.months.march) {
    return 'earlySpring';
  }

  if (month === config.months.april) {
    return day <= config.transitionDay ? 'earlySpring' : 'lateSpring';
  }

  if (month === config.months.may) {
    return 'lateSpring';
  }

  if (month === config.months.june) {
    return day <= config.transitionDay ? 'lateSpring' : 'earlySummer';
  }

  if (month === config.months.july) {
    return 'earlySummer';
  }

  if (month === config.months.august) {
    return day <= config.transitionDay ? 'earlySummer' : 'lateSummer';
  }

  if (month === config.months.september) {
    return 'earlyFall';
  }

  if (month === config.months.october) {
    return day <= config.transitionDay ? 'earlyFall' : 'lateFall';
  }

  if (month === config.months.november) {
    return 'lateFall';
  }

  return 'winter';
}

export function getFishingRegion(stateCode: string): FishingRegion {
  const rockies = ['MT', 'WY', 'CO', 'ID', 'UT'];

  const pacificNorthwest = ['WA', 'OR'];

  const upperMidwest = ['WI', 'MN', 'MI', 'IA'];

  const appalachia = ['WV', 'VA', 'TN', 'NC', 'GA'];

  if (rockies.includes(stateCode)) {
    return 'rockies';
  }

  if (pacificNorthwest.includes(stateCode)) {
    return 'pacificNorthwest';
  }

  if (upperMidwest.includes(stateCode)) {
    return 'upperMidwest';
  }

  if (appalachia.includes(stateCode)) {
    return 'appalachia';
  }

  return 'northeast';
}

export function scoreFlyCategories(
  conditions: FlyRecommendationConditions,
): CategoryScore[] {
  return [
    scoreBWO(conditions),
    scoreMidge(conditions),
    scoreScud(conditions),
    scorePMD(conditions),
    scoreCaddis(conditions),
    scoreStonefly(conditions),
    scoreTerrestrial(conditions),
    scoreWorm(conditions),
    scoreStreamer(conditions),
    scoreAttractorNymph(conditions),
  ].sort((a, b) => b.score - a.score);
}

export function recommendFlyPatterns(
  conditions: FlyRecommendationConditions,
): FlyRecommendation[] {
  const categoryScores = scoreFlyCategories(conditions);

  const categoryMap = new Map(
    categoryScores.map(category => [category.category, category]),
  );

  return flyPatterns
    .map(pattern => {
      const category = categoryMap.get(pattern.category);

      let score = category?.score ?? 0;

      const reasons = [...(category?.reasons ?? [])];

      if (pattern.regions.includes(conditions.region)) {
        score += FLY_RECOMMENDATION_CONFIG.recommendation.regionBonus;
      }

      if (pattern.seasons.includes(conditions.season)) {
        score += FLY_RECOMMENDATION_CONFIG.recommendation.seasonBonus;
      }

      const colorRecommendation = getBestPatternColor(pattern, conditions);

      score += colorRecommendation[0].score;

      reasons.push(colorRecommendation[0].reason);

      return {
        pattern,
        score,

        suggestedColor: colorRecommendation.map(c => c.color),

        reasons,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, FLY_RECOMMENDATION_CONFIG.recommendation.maximumPatterns);
}

function scorePatternColor(
  color: FlyColor,
  conditions: FlyRecommendationConditions,
): ColorScore {
  const { clarity, precipitationLast24Hours } = conditions;

  const colorConfig = FLY_RECOMMENDATION_CONFIG.colors;
  const scoreConfig = colorConfig.score;
  const isBright = colorConfig.brightColors.some(value => value === color);
  const isNatural = colorConfig.naturalColors.some(value => value === color);

  if (clarity === 'clear') {
    if (isBright) {
      return {
        color,
        score: scoreConfig.clear.bright,
        reason: 'Bright colors are less natural in clear water',
      };
    }

    if (isNatural) {
      return {
        color,
        score: scoreConfig.clear.natural,
        reason: 'Natural colors fit clear-water conditions',
      };
    }
  }

  if (clarity === 'slightlyStained') {
    if (isNatural) {
      return {
        color,
        score: scoreConfig.slightlyStained.natural,
        reason: 'Natural colors remain effective in light stain',
      };
    }

    if (isBright) {
      return {
        color,
        score: scoreConfig.slightlyStained.bright,
        reason: 'Added visibility can help in lightly stained water',
      };
    }
  }

  if (clarity === 'stained') {
    if (isBright) {
      return {
        color,
        score: scoreConfig.stained.bright,
        reason: 'Bright colors improve visibility in stained water',
      };
    }

    if (color === scoreConfig.highContrastColor) {
      return {
        color,
        score: scoreConfig.stained.black,
        reason: 'Black provides strong contrast in stained water',
      };
    }

    if (isNatural) {
      return {
        color,
        score: scoreConfig.stained.natural,
        reason: 'Natural colors are less visible in stained water',
      };
    }
  }

  if (clarity === 'highlyStained') {
    if (isBright) {
      return {
        color,
        score: scoreConfig.highlyStained.bright,
        reason: 'High-visibility colors are favored in heavily stained water',
      };
    }

    if (color === scoreConfig.highContrastColor) {
      return {
        color,
        score: scoreConfig.highlyStained.black,
        reason: 'Black provides a strong silhouette in heavily stained water',
      };
    }

    if (isNatural) {
      return {
        color,
        score: scoreConfig.highlyStained.natural,
        reason:
          'Subtle colors may be difficult to see in heavily stained water',
      };
    }
  }

  /*
   * Recent rain can gently favor bright colors
   * before clarity has fully degraded.
   */
  if (
    precipitationLast24Hours >= scoreConfig.recentRainThreshold &&
    isBright
  ) {
    return {
      color,
      score: scoreConfig.recentRainBrightBonus,
      reason: 'Recent rainfall favors a higher-visibility color',
    };
  }

  return {
    color,
    score: 0,
    reason: 'Color has a neutral effect under current conditions',
  };
}

export function getTopOptions(
  options: ColorScore[],
  maxResults = FLY_RECOMMENDATION_CONFIG.colors.topOptions.maximumResults,
  maxGap = FLY_RECOMMENDATION_CONFIG.colors.topOptions.maximumScoreGap,
): ColorScore[] {
  const sorted = [...options].sort(
    (a, b) => b.score - a.score,
  );

  if (sorted.length === 0) {
    return [];
  }

  const results: ColorScore[] = [sorted[0]];

  for (
    let i = 1;
    i < sorted.length &&
    results.length < maxResults;
    i++
  ) {
    const previous =
      sorted[i - 1];

    const current =
      sorted[i];

    const gap =
      previous.score -
      current.score;

    if (gap > maxGap) {
      break;
    }

    results.push(current);
  }

  return results;
}

function getBestPatternColor(
  pattern: FlyPattern,
  conditions: FlyRecommendationConditions,
): ColorScore[] {
  const scores = pattern.colors.map(color =>
    scorePatternColor(color, conditions),
  );

  return getTopOptions(
    scores,
    FLY_RECOMMENDATION_CONFIG.colors.topOptions.maximumResults,
    FLY_RECOMMENDATION_CONFIG.colors.topOptions.maximumScoreGap,
  );
}

export function scoreScud(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  const config = FLY_RECOMMENDATION_CONFIG.categories.scud;
  let score = config.baseScore;

  const reasons = [
    'Scuds provide a reliable subsurface food source in suitable waters',
  ];

  /*
   * Stronger Midwest bias.
   */
  if (conditions.region === 'upperMidwest') {
    score += config.upperMidwestBonus;

    reasons.push(
      'Upper Midwest waters commonly make scud patterns especially useful',
    );
  }

  /*
   * Cool water keeps them relevant much
   * like midges.
   */
  if (conditions.waterTemperature <= config.coolWaterMaximum) {
    score += config.coolWaterBonus;

    reasons.push('Cool water supports consistent subsurface scud activity');
  }

  /*
   * Still useful through moderate
   * temperatures.
   */
  if (
    conditions.waterTemperature > config.moderateWaterMinimum &&
    conditions.waterTemperature <= config.moderateWaterMaximum
  ) {
    score += config.moderateWaterBonus;
  }

  /*
   * Slight stain can make larger
   * subsurface food easier to present
   * effectively.
   */
  if (conditions.clarity === 'slightlyStained') {
    score += config.slightlyStainedBonus;
  }

  /*
   * Keep heavily stained water from
   * over-promoting scuds versus worms
   * and streamers.
   */
  if (conditions.clarity === 'highlyStained') {
    score -= config.highlyStainedPenalty;
  }

  return {
    category: 'scud',
    score: Math.max(FLY_RECOMMENDATION_CONFIG.categories.minimumScore, score),
    reasons,
  };
}

export function scoreAttractorNymph(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  const config = FLY_RECOMMENDATION_CONFIG.categories.attractorNymph;
  let score = config.baseScore;
  const reasons = ['Attractor nymphs provide a versatile subsurface option'];

  if (conditions.clarity === 'slightlyStained') {
    score += config.slightlyStainedBonus;
  }

  if (conditions.clarity === 'stained') {
    score += config.stainedBonus;
  }

  if (
    conditions.waterTemperature >= config.suitableWaterMinimum &&
    conditions.waterTemperature <= config.suitableWaterMaximum
  ) {
    score += config.suitableWaterBonus;
  }

  return {
    category: 'attractorNymph',
    score,
    reasons,
  };
}

export function scoreStreamer(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  const config = FLY_RECOMMENDATION_CONFIG.categories.streamer;
  let score = config.baseScore;
  const reasons: string[] = [];

  if (conditions.clarity === 'stained') {
    score += config.stainedBonus;

    reasons.push('Stained water favors larger high-contrast presentations');
  }

  if (conditions.clarity === 'slightlyStained') {
    score += config.slightlyStainedBonus;
  }

  if (conditions.cloudCover >= config.cloudCoverMinimum) {
    score += config.cloudCoverBonus;

    reasons.push('Cloud cover can encourage aggressive streamer activity');
  }

  if (
    conditions.pressurePhase === 'falling' ||
    conditions.pressurePhase === 'rapidlyFalling'
  ) {
    score += config.fallingPressureBonus;

    reasons.push('Falling pressure may increase aggressive feeding');
  }

  return {
    category: 'streamer',
    score,
    reasons,
  };
}

export function scoreTerrestrial(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  const config = FLY_RECOMMENDATION_CONFIG.categories.terrestrial;
  let score = config.baseScore;
  const reasons: string[] = [];

  if (
    config.favorableSeasons.some(season => season === conditions.season)
  ) {
    score += config.favorableSeasonBonus;

    reasons.push('Late-summer and early-fall conditions favor terrestrials');
  }

  if (
    conditions.waterTemperature >= config.suitableWaterMinimum &&
    conditions.waterTemperature <= config.suitableWaterMaximum
  ) {
    score += config.suitableWaterBonus;
  }

  if (
    conditions.clarity === 'clear' ||
    conditions.clarity === 'slightlyStained'
  ) {
    score += config.clearWaterBonus;
  }

  return {
    category: 'terrestrial',
    score,
    reasons,
  };
}

export function scoreStonefly(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  const config = FLY_RECOMMENDATION_CONFIG.categories.stonefly;
  let score = config.baseScore;
  const reasons: string[] = [];

  if (config.favorableSeasons.some(season => season === conditions.season)) {
    score += config.favorableSeasonBonus;

    reasons.push('Late spring and early summer favor stonefly activity');
  }

  if (
    conditions.waterTemperature >= config.suitableWaterMinimum &&
    conditions.waterTemperature <= config.suitableWaterMaximum
  ) {
    score += config.suitableWaterBonus;
  }

  if (conditions.clarity === 'slightlyStained') {
    score += config.slightlyStainedBonus;
  }

  return {
    category: 'stonefly',
    score,
    reasons,
  };
}

export function scoreCaddis(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  const config = FLY_RECOMMENDATION_CONFIG.categories.caddis;
  let score = config.baseScore;
  const reasons: string[] = [];

  if (config.favorableSeasons.some(season => season === conditions.season)) {
    score += config.favorableSeasonBonus;

    reasons.push('Warm-season conditions favor caddis activity');
  }

  if (
    conditions.waterTemperature >= config.suitableWaterMinimum &&
    conditions.waterTemperature <= config.suitableWaterMaximum
  ) {
    score += config.suitableWaterBonus;
  }

  if (
    conditions.clarity === 'clear' ||
    conditions.clarity === 'slightlyStained'
  ) {
    score += config.clearWaterBonus;
  }

  return {
    category: 'caddis',
    score,
    reasons,
  };
}

export function scorePMD(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  const config = FLY_RECOMMENDATION_CONFIG.categories.pmd;
  let score = config.baseScore;
  const reasons: string[] = [];

  if (config.favorableSeasons.some(season => season === conditions.season)) {
    score += config.favorableSeasonBonus;

    reasons.push('Seasonal timing favors PMD activity');
  }

  if (
    conditions.waterTemperature >= config.suitableWaterMinimum &&
    conditions.waterTemperature <= config.suitableWaterMaximum
  ) {
    score += config.suitableWaterBonus;
  }

  if (
    conditions.cloudCover >= config.cloudCoverMinimum &&
    conditions.cloudCover <= config.cloudCoverMaximum
  ) {
    score += config.cloudCoverBonus;
  }

  return {
    category: 'pmd',
    score,
    reasons,
  };
}

export function scoreMidge(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  const config = FLY_RECOMMENDATION_CONFIG.categories.midge;
  let score = config.baseScore;
  const reasons = ['Midges remain available throughout the year'];

  if (config.favorableSeasons.some(season => season === conditions.season)) {
    score += config.favorableSeasonBonus;

    reasons.push('Cool-season conditions favor midge activity');
  }

  if (conditions.waterTemperature <= config.coolWaterMaximum) {
    score += config.coolWaterBonus;

    reasons.push('Cold water increases the value of midge patterns');
  }

  return {
    category: 'midge',
    score,
    reasons,
  };
}

export function scoreBWO(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  const config = FLY_RECOMMENDATION_CONFIG.categories.bwo;
  let score = config.baseScore;
  const reasons: string[] = [];

  if (config.favorableSeasons.some(season => season === conditions.season)) {
    score += config.favorableSeasonBonus;

    reasons.push('Seasonal timing favors BWO activity');
  }

  if (
    conditions.waterTemperature >= config.suitableWaterMinimum &&
    conditions.waterTemperature <= config.suitableWaterMaximum
  ) {
    score += config.suitableWaterBonus;

    reasons.push('Cool water temperatures support BWO activity');
  }

  if (conditions.cloudCover >= config.cloudCoverMinimum) {
    score += config.cloudCoverBonus;

    reasons.push('Cloud cover can improve mayfly activity');
  }

  return {
    category: 'bwo',
    score,
    reasons,
  };
}

function scoreWorm(conditions: FlyRecommendationConditions) {
  const config = FLY_RECOMMENDATION_CONFIG.categories.worm;
  let score = config.baseScore;

  const reasons: string[] = [];

  if (conditions.precipitationLast24Hours >= config.rainyDayMinimum) {
    score += config.recentRainBonus;

    reasons.push('Recent rainfall increases the value of worm patterns');
  }

  if (
    conditions.clarity === 'stained' ||
    conditions.clarity === 'highlyStained'
  ) {
    score += config.stainedWaterBonus;

    reasons.push('Stained water favors high-visibility subsurface patterns');
  }

  if (conditions.clarity === 'slightlyStained') {
    score += config.slightlyStainedBonus;
  }

  return {
    category: 'worm' as const,
    score,
    reasons,
  };
}

export function getColorRecommendation(
  conditions: FlyRecommendationConditions,
): ColorRecommendation {
  const { clarity, precipitationLast24Hours } = conditions;

  /*
   * Muddy / heavily stained water:
   * favor maximum visibility and contrast.
   */
  if (clarity === 'highlyStained') {
    return {
      preferredColors: [
        ...FLY_RECOMMENDATION_CONFIG.colors.preferredColors.highlyStained,
      ],

      visibility: 'high',

      reasons: ['Heavy stain favors bright or high-contrast patterns'],
    };
  }

  /*
   * Stained water:
   * brighter colors and worm patterns
   * become more useful.
   */
  if (clarity === 'stained') {
    return {
      preferredColors: [...FLY_RECOMMENDATION_CONFIG.colors.preferredColors.stained],

      visibility: 'high',

      reasons: ['Stained water favors visible colors and strong contrast'],
    };
  }

  /*
   * Recent rain can justify adding some
   * brighter options even before the water
   * becomes strongly stained.
   */
  if (
    precipitationLast24Hours >=
    FLY_RECOMMENDATION_CONFIG.colors.score.recentRainThreshold
  ) {
    return {
      preferredColors: [
        ...FLY_RECOMMENDATION_CONFIG.colors.preferredColors.recentRain,
      ],

      visibility: 'moderate',

      reasons: [
        'Recent rainfall favors adding brighter, more visible patterns',
      ],
    };
  }

  if (clarity === 'slightlyStained') {
    return {
      preferredColors: [
        ...FLY_RECOMMENDATION_CONFIG.colors.preferredColors.slightlyStained,
      ],

      visibility: 'moderate',

      reasons: ['Light stain supports natural colors with moderate contrast'],
    };
  }

  return {
    preferredColors: [...FLY_RECOMMENDATION_CONFIG.colors.preferredColors.clear],

    visibility: 'natural',

    reasons: ['Clear water favors subdued, natural colors'],
  };
}
