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

export interface CategoryScore {
  category: FlyCategory;
  score: number;
  reasons: string[];
}

export function getFishingSeason(date: Date | string): FishingSeason {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  const month = parsedDate.getMonth() + 1;

  const day = parsedDate.getDate();

  if (month === 12 || month === 1) {
    return 'winter';
  }

  if (month === 2) {
    return day <= 15 ? 'winter' : 'earlySpring';
  }

  if (month === 3) {
    return 'earlySpring';
  }

  if (month === 4) {
    return day <= 15 ? 'earlySpring' : 'lateSpring';
  }

  if (month === 5) {
    return 'lateSpring';
  }

  if (month === 6) {
    return day <= 15 ? 'lateSpring' : 'earlySummer';
  }

  if (month === 7) {
    return 'earlySummer';
  }

  if (month === 8) {
    return day <= 15 ? 'earlySummer' : 'lateSummer';
  }

  if (month === 9) {
    return 'earlyFall';
  }

  if (month === 10) {
    return day <= 15 ? 'earlyFall' : 'lateFall';
  }

  if (month === 11) {
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
        score += 2;
      }

      if (pattern.seasons.includes(conditions.season)) {
        score += 3;
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
    .slice(0, 5);
}

function scorePatternColor(
  color: FlyColor,
  conditions: FlyRecommendationConditions,
): ColorScore {
  const { clarity, precipitationLast24Hours } = conditions;

  const brightColors: FlyColor[] = ['pink', 'orange', 'red', 'chartreuse'];

  const naturalColors: FlyColor[] = [
    'natural',
    'olive',
    'brown',
    'tan',
    'gray',
  ];

  const isBright = brightColors.includes(color);

  const isNatural = naturalColors.includes(color);

  if (clarity === 'clear') {
    if (isBright) {
      return {
        color,
        score: -4,
        reason: 'Bright colors are less natural in clear water',
      };
    }

    if (isNatural) {
      return {
        color,
        score: 3,
        reason: 'Natural colors fit clear-water conditions',
      };
    }
  }

  if (clarity === 'slightlyStained') {
    if (isNatural) {
      return {
        color,
        score: 2,
        reason: 'Natural colors remain effective in light stain',
      };
    }

    if (isBright) {
      return {
        color,
        score: 1,
        reason: 'Added visibility can help in lightly stained water',
      };
    }
  }

  if (clarity === 'stained') {
    if (isBright) {
      return {
        color,
        score: 4,
        reason: 'Bright colors improve visibility in stained water',
      };
    }

    if (color === 'black') {
      return {
        color,
        score: 3,
        reason: 'Black provides strong contrast in stained water',
      };
    }

    if (isNatural) {
      return {
        color,
        score: 0,
        reason: 'Natural colors are less visible in stained water',
      };
    }
  }

  if (clarity === 'highlyStained') {
    if (isBright) {
      return {
        color,
        score: 5,
        reason: 'High-visibility colors are favored in heavily stained water',
      };
    }

    if (color === 'black') {
      return {
        color,
        score: 4,
        reason: 'Black provides a strong silhouette in heavily stained water',
      };
    }

    if (isNatural) {
      return {
        color,
        score: -3,
        reason:
          'Subtle colors may be difficult to see in heavily stained water',
      };
    }
  }

  /*
   * Recent rain can gently favor bright colors
   * before clarity has fully degraded.
   */
  if (precipitationLast24Hours >= 0.3 && isBright) {
    return {
      color,
      score: 2,
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
  maxResults = 3,
  maxGap = 4,
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
    3,
    4,
  );
}

export function scoreScud(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  let score = 2;

  const reasons = [
    'Scuds provide a reliable subsurface food source in suitable waters',
  ];

  /*
   * Stronger Midwest bias.
   */
  if (conditions.region === 'upperMidwest') {
    score += 4;

    reasons.push(
      'Upper Midwest waters commonly make scud patterns especially useful',
    );
  }

  /*
   * Cool water keeps them relevant much
   * like midges.
   */
  if (conditions.waterTemperature <= 52) {
    score += 2;

    reasons.push('Cool water supports consistent subsurface scud activity');
  }

  /*
   * Still useful through moderate
   * temperatures.
   */
  if (conditions.waterTemperature > 52 && conditions.waterTemperature <= 62) {
    score += 1;
  }

  /*
   * Slight stain can make larger
   * subsurface food easier to present
   * effectively.
   */
  if (conditions.clarity === 'slightlyStained') {
    score += 1;
  }

  /*
   * Keep heavily stained water from
   * over-promoting scuds versus worms
   * and streamers.
   */
  if (conditions.clarity === 'highlyStained') {
    score -= 2;
  }

  return {
    category: 'scud',
    score: Math.max(0, score),
    reasons,
  };
}

export function scoreAttractorNymph(
  conditions: FlyRecommendationConditions,
): CategoryScore {
  let score = 3;
  const reasons = ['Attractor nymphs provide a versatile subsurface option'];

  if (conditions.clarity === 'slightlyStained') {
    score += 2;
  }

  if (conditions.clarity === 'stained') {
    score += 1;
  }

  if (conditions.waterTemperature >= 45 && conditions.waterTemperature <= 65) {
    score += 1;
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
  let score = 1;
  const reasons: string[] = [];

  if (conditions.clarity === 'stained') {
    score += 4;

    reasons.push('Stained water favors larger high-contrast presentations');
  }

  if (conditions.clarity === 'slightlyStained') {
    score += 2;
  }

  if (conditions.cloudCover >= 60) {
    score += 2;

    reasons.push('Cloud cover can encourage aggressive streamer activity');
  }

  if (
    conditions.pressurePhase === 'falling' ||
    conditions.pressurePhase === 'rapidlyFalling'
  ) {
    score += 2;

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
  let score = 0;
  const reasons: string[] = [];

  if (conditions.season === 'lateSummer' || conditions.season === 'earlyFall') {
    score += 6;

    reasons.push('Late-summer and early-fall conditions favor terrestrials');
  }

  if (conditions.waterTemperature >= 55 && conditions.waterTemperature <= 65) {
    score += 2;
  }

  if (
    conditions.clarity === 'clear' ||
    conditions.clarity === 'slightlyStained'
  ) {
    score += 1;
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
  let score = 0;
  const reasons: string[] = [];

  if (
    conditions.season === 'lateSpring' ||
    conditions.season === 'earlySummer'
  ) {
    score += 5;

    reasons.push('Late spring and early summer favor stonefly activity');
  }

  if (conditions.waterTemperature >= 48 && conditions.waterTemperature <= 62) {
    score += 2;
  }

  if (conditions.clarity === 'slightlyStained') {
    score += 1;
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
  let score = 0;
  const reasons: string[] = [];

  if (
    conditions.season === 'lateSpring' ||
    conditions.season === 'earlySummer' ||
    conditions.season === 'lateSummer'
  ) {
    score += 5;

    reasons.push('Warm-season conditions favor caddis activity');
  }

  if (conditions.waterTemperature >= 52 && conditions.waterTemperature <= 65) {
    score += 2;
  }

  if (
    conditions.clarity === 'clear' ||
    conditions.clarity === 'slightlyStained'
  ) {
    score += 1;
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
  let score = 0;
  const reasons: string[] = [];

  if (
    conditions.season === 'lateSpring' ||
    conditions.season === 'earlySummer'
  ) {
    score += 6;

    reasons.push('Seasonal timing favors PMD activity');
  }

  if (conditions.waterTemperature >= 50 && conditions.waterTemperature <= 62) {
    score += 2;
  }

  if (conditions.cloudCover >= 30 && conditions.cloudCover <= 80) {
    score += 1;
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
  let score = 2;
  const reasons = ['Midges remain available throughout the year'];

  if (
    conditions.season === 'winter' ||
    conditions.season === 'earlySpring' ||
    conditions.season === 'lateFall'
  ) {
    score += 5;

    reasons.push('Cool-season conditions favor midge activity');
  }

  if (conditions.waterTemperature <= 50) {
    score += 2;

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
  let score = 0;
  const reasons: string[] = [];

  if (
    conditions.season === 'earlySpring' ||
    conditions.season === 'earlyFall' ||
    conditions.season === 'lateFall'
  ) {
    score += 5;

    reasons.push('Seasonal timing favors BWO activity');
  }

  if (conditions.waterTemperature >= 45 && conditions.waterTemperature <= 58) {
    score += 2;

    reasons.push('Cool water temperatures support BWO activity');
  }

  if (conditions.cloudCover >= 60) {
    score += 3;

    reasons.push('Cloud cover can improve mayfly activity');
  }

  return {
    category: 'bwo',
    score,
    reasons,
  };
}

function scoreWorm(conditions: FlyRecommendationConditions) {
  let score = 0;

  const reasons: string[] = [];

  if (conditions.precipitationLast24Hours >= 0.2) {
    score += 5;

    reasons.push('Recent rainfall increases the value of worm patterns');
  }

  if (
    conditions.clarity === 'stained' ||
    conditions.clarity === 'highlyStained'
  ) {
    score += 4;

    reasons.push('Stained water favors high-visibility subsurface patterns');
  }

  if (conditions.clarity === 'slightlyStained') {
    score += 2;
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
      preferredColors: ['pink', 'orange', 'chartreuse', 'red', 'black'],

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
      preferredColors: ['pink', 'orange', 'red', 'black'],

      visibility: 'high',

      reasons: ['Stained water favors visible colors and strong contrast'],
    };
  }

  /*
   * Recent rain can justify adding some
   * brighter options even before the water
   * becomes strongly stained.
   */
  if (precipitationLast24Hours >= 0.3) {
    return {
      preferredColors: ['pink', 'orange', 'natural', 'olive'],

      visibility: 'moderate',

      reasons: [
        'Recent rainfall favors adding brighter, more visible patterns',
      ],
    };
  }

  if (clarity === 'slightlyStained') {
    return {
      preferredColors: ['olive', 'brown', 'tan', 'black', 'natural'],

      visibility: 'moderate',

      reasons: ['Light stain supports natural colors with moderate contrast'],
    };
  }

  return {
    preferredColors: ['natural', 'olive', 'brown', 'tan', 'black'],

    visibility: 'natural',

    reasons: ['Clear water favors subdued, natural colors'],
  };
}
