import {
  ActivityLevel,
  ActivitySegment,
} from '../components/ui/BiteWindowCard';
import type {
  BiteWindow,
  HourlyWeather,
  PressureTrend,
  PressurePhase,
  WaterClarityType,
  DailyWeather,
  WaterClarity,
  PrecipitationSummary,
} from '../types/weather';
import { getDecimalHour } from './func';

export const WEATHER_DERIVATION_CONFIG = {
  waterTemperature: {
    recentDays: 7,
    dailyWeights: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3],
    dailyRangeRatio: 0.25,
    dailyRangeHalfDivisor: 2,
    hourlyLag: 2,
    flatAirRangeNormalizedValue: 0.5,
    hourlyResponseFactor: 0.35,
  },
  biteScore: {
    idealTemperature: 57.5,
    baseScore: 6,
    temperatureDistanceMultiplier: 0.6,
    coldWaterMaxTemperature: 55,
    coldWarmingMultiplier: 1.5,
    coldWarmingCap: 4,
    coldCoolingMultiplier: 0.5,
    moderateWaterMinTemperature: 55,
    moderateWaterMaxTemperature: 62,
    moderateWarmingMaxChange: 2,
    moderateWarmingMultiplier: 0.75,
    moderateRapidWarmingBonus: 1.5,
    warmWaterMinTemperature: 62,
    warmCoolingMultiplier: 1.25,
    warmCoolingCap: 3,
    warmWarmingPenaltyMultiplier: 1,
    stressPenaltyStartTemperature: 68,
    stressPenaltyPerDegree: 1.5,
    severeStressTemperature: 70,
    severeStressPenalty: 4,
    temperatureChangeHours: 3,
    minimumScore: 0,
    roundingPrecisionMultiplier: 10,
  },
  biteWindow: {
    minimumGoodScore: 4,
    fallbackHoursBeforePeak: 1,
    fallbackHoursAfterPeak: 1,
    primeScore: 6,
    goodScore: 4,
    hourlyDuration: 1,
  },
  activitySegments: {
    primeScoreRatio: 0.85,
    goodScoreRatio: 0.55,
    fairScoreRatio: 0.3,
  },
  precipitation: {
    recentHours: 24,
    forecastHours: 48,
    dailyHistoryDays: 7,
  },
  rain: {
    eventThreshold: 0.01,
    noRecentRainHours: 999,
  },
  clarity: {
    river: {
      highlyStainedRecentRain: 0.9,
      highlyStainedWeeklyRain: 2.25,
      stainedRecentRain: 0.45,
      stainedWeeklyRain: 1.4,
      slightlyStainedRecentRain: 0.15,
      slightlyStainedWeeklyRain: 0.65,
      recentRainHours: 36,
      recentRainMinimum: 0.05,
    },
    headwater: {
      highlyStainedWithinHours: 4,
      highlyStainedRecentRain: 0.75,
      stainedWithinHours: 8,
      stainedRecentRain: 0.4,
      slightlyStainedWithinHours: 16,
      slightlyStainedRecentRain: 0.15,
      recoveryAfterHours: 16,
      recoveryWeeklyRain: 2.5,
    },
  },
  cloudCoverage: {
    clearMax: 10,
    mostlyClearMax: 30,
    partlyCloudyMax: 60,
    mostlyCloudyMax: 85,
  },
  pressure: {
    fallbackBaseline: 1013,
    baselineDailyHistoryDays: 3,
    threeHourWindow: 3,
    sixHourWindow: 6,
    rapidlyFallingThreeHourChange: -2,
    fallingThreeHourChange: -0.7,
    fallingSixHourChange: -1.5,
    risingThreeHourChange: 0.7,
    risingSixHourChange: 1.5,
    establishedLowDelta: -5,
    stableHighDelta: 5,
    stableHighMaximumSixHourChange: 1,
    biteModifiers: {
      rapidlyFalling: 2.5,
      falling: 1.5,
      rising: 0.5,
      stableHigh: 0,
      stable: 0,
      establishedLow: -2,
    },
  },
} as const;

export function estimateWaterTemperature(dailyTemps: number[]): number {
  const recent = dailyTemps.slice(
    -WEATHER_DERIVATION_CONFIG.waterTemperature.recentDays,
  );

  const weights = WEATHER_DERIVATION_CONFIG.waterTemperature.dailyWeights;

  const weightedAverage = recent.reduce(
    (sum, temp, index) => sum + temp * weights[index],
    0,
  );

  return weightedAverage;
}

export function estimateWaterTemperatureRange(
  estimatedMeanWaterTemp: number,
  airTempMin: number,
  airTempMax: number,
) {
  const airRange = airTempMax - airTempMin;

  // Water temperature changes more slowly than air.
  const waterRange =
    airRange * WEATHER_DERIVATION_CONFIG.waterTemperature.dailyRangeRatio;

  return {
    min:
      estimatedMeanWaterTemp -
      waterRange /
        WEATHER_DERIVATION_CONFIG.waterTemperature.dailyRangeHalfDivisor,
    mean: estimatedMeanWaterTemp,
    max:
      estimatedMeanWaterTemp +
      waterRange /
        WEATHER_DERIVATION_CONFIG.waterTemperature.dailyRangeHalfDivisor,
  };
}

export function estimateHourlyWaterTemperatures(
  hourlyAirTemps: number[],
  waterTempMin: number,
  waterTempMax: number,
): number[] {
  if (hourlyAirTemps.length === 0) {
    return [];
  }

  const airMin = Math.min(...hourlyAirTemps);
  const airMax = Math.max(...hourlyAirTemps);

  const airRange = airMax - airMin;
  const waterRange = waterTempMax - waterTempMin;

  let previousWaterTemp = waterTempMin;

  return hourlyAirTemps.map((_, index) => {
    /*
     * Water temperature typically lags behind
     * air temperature.
     *
     * A 2-hour lag gives us a reasonable
     * approximation for now.
     */
    const laggedIndex = Math.max(
      0,
      index - WEATHER_DERIVATION_CONFIG.waterTemperature.hourlyLag,
    );

    const laggedAirTemp = hourlyAirTemps[laggedIndex];

    const normalizedAir =
      airRange === 0
        ? WEATHER_DERIVATION_CONFIG.waterTemperature.flatAirRangeNormalizedValue
        : (laggedAirTemp - airMin) / airRange;

    const targetWaterTemp = waterTempMin + normalizedAir * waterRange;

    /*
     * Smooth the response so water doesn't
     * move as quickly as air temperature.
     */
    const responseFactor =
      WEATHER_DERIVATION_CONFIG.waterTemperature.hourlyResponseFactor;

    previousWaterTemp =
      previousWaterTemp +
      (targetWaterTemp - previousWaterTemp) * responseFactor;

    return previousWaterTemp;
  });
}

export function calculateBiteScore(
  waterTemp: number,
  threeHourChange: number,
): number {
  let score = 0;

  /*
   * Temperature score
   *
   * Peak around 57–58°F, tapering gradually
   * as temperature moves away from that range.
   */
  const config = WEATHER_DERIVATION_CONFIG.biteScore;
  const idealTemp = config.idealTemperature;
  const distanceFromIdeal = Math.abs(waterTemp - idealTemp);

  score += Math.max(
    0,
    config.baseScore - distanceFromIdeal * config.temperatureDistanceMultiplier,
  );

  /*
   * Temperature trend
   *
   * Cold water benefits from warming.
   */
  if (waterTemp < config.coldWaterMaxTemperature) {
    if (threeHourChange > 0) {
      score += Math.min(
        threeHourChange * config.coldWarmingMultiplier,
        config.coldWarmingCap,
      );
    } else {
      score += threeHourChange * config.coldCoolingMultiplier;
    }
  }

  /*
   * Moderate water:
   * Small changes are useful, but we don't
   * want rapid warming to overpower the
   * already-good temperature.
   */
  if (
    waterTemp >= config.moderateWaterMinTemperature &&
    waterTemp <= config.moderateWaterMaxTemperature
  ) {
    if (
      threeHourChange > 0 &&
      threeHourChange <= config.moderateWarmingMaxChange
    ) {
      score += threeHourChange * config.moderateWarmingMultiplier;
    }

    if (threeHourChange > config.moderateWarmingMaxChange) {
      score += config.moderateRapidWarmingBonus;
    }
  }

  /*
   * Warm water benefits from cooling.
   */
  if (waterTemp > config.warmWaterMinTemperature) {
    if (threeHourChange < 0) {
      score += Math.min(
        Math.abs(threeHourChange) * config.warmCoolingMultiplier,
        config.warmCoolingCap,
      );
    }

    if (threeHourChange > 0) {
      score -= threeHourChange * config.warmWarmingPenaltyMultiplier;
    }
  }

  /*
   * Increasing penalties as temperatures
   * approach stressful levels.
   */
  if (waterTemp >= config.stressPenaltyStartTemperature) {
    score -=
      (waterTemp - config.stressPenaltyStartTemperature) *
      config.stressPenaltyPerDegree;
  }

  if (waterTemp >= config.severeStressTemperature) {
    score -= config.severeStressPenalty;
  }
  const precision =
    WEATHER_DERIVATION_CONFIG.biteScore.roundingPrecisionMultiplier;
  return Math.max(
    WEATHER_DERIVATION_CONFIG.biteScore.minimumScore,
    Math.round(score * precision) / precision,
  );
}

export function findOptimalBiteWindow(
  hours: HourlyWeather[],
  sunrise: string,
  sunset: string,
): BiteWindow | null {
  const sunriseHour = getDecimalHour(sunrise);

  const sunsetHour = getDecimalHour(sunset);
  if (hours.length === 0) {
    return null;
  }

  const daylightHours = hours.filter(hour => {
    return hour.hour >= sunriseHour && hour.hour < sunsetHour;
  });

  if (daylightHours.length === 0) {
    return null;
  }

  const minimumGoodScore =
    WEATHER_DERIVATION_CONFIG.biteWindow.minimumGoodScore;

  let bestStart = -1;
  let bestEnd = -1;
  let bestAverage = -Infinity;

  let currentStart = -1;

  for (let i = 0; i <= daylightHours.length; i++) {
    const qualifies =
      i < daylightHours.length &&
      daylightHours[i].biteScore >= minimumGoodScore;

    if (qualifies && currentStart === -1) {
      currentStart = i;
    }

    const windowEnded = !qualifies && currentStart !== -1;

    if (windowEnded) {
      const end = i - 1;

      const windowHours = daylightHours.slice(currentStart, end + 1);

      const average =
        windowHours.reduce((sum, hour) => sum + hour.biteScore, 0) /
        windowHours.length;

      /*
       * Prefer the better window.
       * If scores tie, prefer the longer one.
       */
      const currentLength = end - currentStart;

      const bestLength = bestEnd - bestStart;

      if (
        average > bestAverage ||
        (average === bestAverage && currentLength > bestLength)
      ) {
        bestStart = currentStart;
        bestEnd = end;
        bestAverage = average;
      }

      currentStart = -1;
    }
  }

  /*
   * If nothing met the threshold, fall back
   * to the highest-scoring hour.
   */
  if (bestStart === -1) {
    let bestIndex = 0;

    daylightHours.forEach((hour, index) => {
      if (hour.biteScore > daylightHours[bestIndex].biteScore) {
        bestIndex = index;
      }
    });

    bestStart = Math.max(
      0,
      bestIndex - WEATHER_DERIVATION_CONFIG.biteWindow.fallbackHoursBeforePeak,
    );

    bestEnd = Math.min(
      daylightHours.length - 1,
      bestIndex + WEATHER_DERIVATION_CONFIG.biteWindow.fallbackHoursAfterPeak,
    );

    bestAverage =
      daylightHours
        .slice(bestStart, bestEnd + 1)
        .reduce((sum, hour) => sum + hour.biteScore, 0) /
      (bestEnd - bestStart + 1);
  }

  let peakIndex = bestStart;

  for (let i = bestStart; i <= bestEnd; i++) {
    if (daylightHours[i].biteScore > daylightHours[peakIndex].biteScore) {
      peakIndex = i;
    }
  }

  const startHour = Math.max(daylightHours[bestStart].hour, sunriseHour);
  const endHour = Math.min(
    daylightHours[bestEnd].hour +
      WEATHER_DERIVATION_CONFIG.biteWindow.hourlyDuration,
    sunsetHour,
  );

  const peakHour = daylightHours[peakIndex].hour;
  return {
    startTime: daylightHours[bestStart].time,

    endTime: daylightHours[bestEnd].time,

    peakTime: daylightHours[peakIndex].time,

    startHour,
    endHour,
    peakHour,

    startPercent:
      ((startHour - sunriseHour) / (sunsetHour - sunriseHour)) * 100,

    endPercent: ((endHour - sunriseHour) / (sunsetHour - sunriseHour)) * 100,

    score: bestAverage,

    label:
      bestAverage >= WEATHER_DERIVATION_CONFIG.biteWindow.primeScore
        ? 'Prime'
        : bestAverage >= WEATHER_DERIVATION_CONFIG.biteWindow.goodScore
          ? 'Good'
          : 'Fair',
  };
}

function getActivityLevel(
  biteScore: number,
  minScore: number,
  maxScore: number,
): ActivityLevel {
  if (maxScore === minScore) {
    return 'fair';
  }

  const normalizedScore = (biteScore - minScore) / (maxScore - minScore);
  if (
    normalizedScore >=
    WEATHER_DERIVATION_CONFIG.activitySegments.primeScoreRatio
  ) {
    return 'prime';
  }

  if (
    normalizedScore >=
    WEATHER_DERIVATION_CONFIG.activitySegments.goodScoreRatio
  ) {
    return 'good';
  }

  if (
    normalizedScore >=
    WEATHER_DERIVATION_CONFIG.activitySegments.fairScoreRatio
  ) {
    return 'fair';
  }

  return 'poor';
}

export function buildActivitySegments(
  hourly: HourlyWeather[],
  sunrise: string,
  sunset: string,
): ActivitySegment[] {
  /*
   * Only show the fishing/daylight portion
   * of the day for now.
   */
  const DAY_START = getDecimalHour(sunrise);
  const DAY_END = getDecimalHour(sunset);
  const daylightHours = hourly.filter(
    hour => hour.hour >= DAY_START && hour.hour < DAY_END,
  );
  if (daylightHours.length === 0) {
    return [];
  }

  const scores = daylightHours.map(hour => hour.biteScore);

  const minScore = Math.min(...scores);

  const maxScore = Math.max(...scores);

  const segments: ActivitySegment[] = [];

  let startHour = daylightHours[0].hour;

  let currentLevel = getActivityLevel(
    daylightHours[0].biteScore,
    minScore,
    maxScore,
  );

  for (let i = 1; i <= daylightHours.length; i++) {
    const current = daylightHours[i];

    const nextLevel = current
      ? getActivityLevel(current.biteScore, minScore, maxScore)
      : null;
    if (nextLevel !== currentLevel) {
      const endHour = current?.hour ?? DAY_END;

      segments.push({
        level: currentLevel,
        startHour,
        endHour,

        widthPercent: ((endHour - startHour) / (DAY_END - DAY_START)) * 100,
      });

      if (current) {
        startHour = current.hour;

        currentLevel = nextLevel!;
      }
    }
  }
  return segments;
}

export function calculatePrecipitationSummary(
  hourly: Pick<HourlyWeather, 'time' | 'precipitation'>[],
  daily: Pick<DailyWeather, 'date' | 'precipitation'>[],
  currentTime: string,
): PrecipitationSummary {
  const currentIndex = hourly.findIndex(hour => hour.time > currentTime);
  const index = currentIndex < 0 ? hourly.length - 1 : Math.max(0, currentIndex - 1);

  const recentHours = WEATHER_DERIVATION_CONFIG.precipitation.recentHours;
  const forecastHours = WEATHER_DERIVATION_CONFIG.precipitation.forecastHours;
  const dailyHistoryDays =
    WEATHER_DERIVATION_CONFIG.precipitation.dailyHistoryDays;

  const last24Hours = hourly
    .slice(Math.max(0, index - recentHours + 1), index + 1)
    .reduce((sum, hour) => sum + hour.precipitation, 0);

  const next48Hours = hourly
    .slice(index + 1, index + 1 + forecastHours)
    .reduce((sum, hour) => sum + hour.precipitation, 0);

  const today = currentTime.split('T')[0];

  const last7Days = daily
    .filter(day => day.date <= today)
    .slice(-dailyHistoryDays)
    .reduce((sum, day) => sum + day.precipitation, 0);

  return {
    last24Hours,
    last7Days,
    next48Hours,
    hoursSinceRain: 0,
  };
}

export function estimateWaterClarity(
  precipitation: PrecipitationSummary,
): WaterClarity {
  return {
    river: estimateRiverClarity(precipitation),

    headwater: estimateHeadwaterClarity(precipitation),
  };
}

export function getHoursSinceRain(
  hourly: Pick<HourlyWeather, 'precipitation'>[],
  currentIndex: number,
): number {
  for (let i = currentIndex; i >= 0; i--) {
    if (
      hourly[i].precipitation >
      WEATHER_DERIVATION_CONFIG.rain.eventThreshold
    ) {
      return currentIndex - i;
    }
  }

  return WEATHER_DERIVATION_CONFIG.rain.noRecentRainHours;
}

function estimateHeadwaterClarity(
  precipitation: PrecipitationSummary,
): WaterClarityType {
  const config = WEATHER_DERIVATION_CONFIG.clarity.headwater;
  const { last24Hours, last7Days, hoursSinceRain } = precipitation;

  if (
    hoursSinceRain !== null &&
    hoursSinceRain <= config.highlyStainedWithinHours &&
    last24Hours >= config.highlyStainedRecentRain
  ) {
    return 'highlyStained';
  }

  if (
    hoursSinceRain !== null &&
    hoursSinceRain <= config.stainedWithinHours &&
    last24Hours >= config.stainedRecentRain
  ) {
    return 'stained';
  }

  if (
    hoursSinceRain !== null &&
    hoursSinceRain <= config.slightlyStainedWithinHours &&
    last24Hours >= config.slightlyStainedRecentRain
  ) {
    return 'slightlyStained';
  }

  /*
   * Headwater/spring recovery:
   * once the rain has been over for a while,
   * don't keep penalizing clarity heavily.
   */
  if (hoursSinceRain !== null && hoursSinceRain > config.recoveryAfterHours) {
    if (last7Days >= config.recoveryWeeklyRain) {
      return 'slightlyStained';
    }

    return 'clear';
  }

  return 'clear';
}

function estimateRiverClarity(
  precipitation: PrecipitationSummary,
): WaterClarityType {
  const config = WEATHER_DERIVATION_CONFIG.clarity.river;
  const { last24Hours, last7Days, hoursSinceRain } = precipitation;

  if (
    last24Hours >= config.highlyStainedRecentRain ||
    last7Days >= config.highlyStainedWeeklyRain
  ) {
    return 'highlyStained';
  }

  if (
    last24Hours >= config.stainedRecentRain ||
    last7Days >= config.stainedWeeklyRain
  ) {
    return 'stained';
  }

  if (
    last24Hours >= config.slightlyStainedRecentRain ||
    last7Days >= config.slightlyStainedWeeklyRain ||
    (hoursSinceRain !== null &&
      hoursSinceRain <= config.recentRainHours &&
      last24Hours > config.recentRainMinimum)
  ) {
    return 'slightlyStained';
  }

  return 'clear';
}

export type CloudCoverage =
  | 'clear'
  | 'mostlyClear'
  | 'partlyCloudy'
  | 'mostlyCloudy'
  | 'overcast';

export function getCloudCoverage(cloudCover: number): CloudCoverage {
  if (cloudCover <= WEATHER_DERIVATION_CONFIG.cloudCoverage.clearMax) {
    return 'clear';
  }

  if (cloudCover <= WEATHER_DERIVATION_CONFIG.cloudCoverage.mostlyClearMax) {
    return 'mostlyClear';
  }

  if (
    cloudCover <= WEATHER_DERIVATION_CONFIG.cloudCoverage.partlyCloudyMax
  ) {
    return 'partlyCloudy';
  }

  if (
    cloudCover <= WEATHER_DERIVATION_CONFIG.cloudCoverage.mostlyCloudyMax
  ) {
    return 'mostlyCloudy';
  }

  return 'overcast';
}

export const cloudCoveragePhrase: Record<CloudCoverage, string> = {
  clear: 'Clear Skies',
  mostlyClear: 'Mostly Clear',
  partlyCloudy: 'Broken Cloud Cover',
  mostlyCloudy: 'Heavy Cloud Cover',
  overcast: 'Full Overcast',
};

export const clarityPhrase = {
  highlyStained: 'Low Visibility',
  stained: 'Limited Visibility',
  slightlyStained: 'Moderate Visibility',
  clear: 'Gin Clear Sightline',
};

export interface PressureBaseline {
  average: number;
  min: number;
  max: number;
}

export function getPressureBaseline(
  dailyPressureMeans: number[],
): PressureBaseline {
  if (dailyPressureMeans.length === 0) {
    return {
      average: WEATHER_DERIVATION_CONFIG.pressure.fallbackBaseline,
      min: WEATHER_DERIVATION_CONFIG.pressure.fallbackBaseline,
      max: WEATHER_DERIVATION_CONFIG.pressure.fallbackBaseline,
    };
  }

  const average =
    dailyPressureMeans.reduce((sum, value) => sum + value, 0) /
    dailyPressureMeans.length;

  return {
    average,
    min: Math.min(...dailyPressureMeans),
    max: Math.max(...dailyPressureMeans),
  };
}

export function getPressureTrend(
  hourly: Pick<HourlyWeather, 'pressure'>[],
  index: number,
  baselinePressure: number,
): PressureTrend {
  const current = hourly[index].pressure;

  const threeHourIndex = Math.max(
    0,
    index - WEATHER_DERIVATION_CONFIG.pressure.threeHourWindow,
  );

  const sixHourIndex = Math.max(
    0,
    index - WEATHER_DERIVATION_CONFIG.pressure.sixHourWindow,
  );

  const change3Hour = current - hourly[threeHourIndex].pressure;

  const change6Hour = current - hourly[sixHourIndex].pressure;

  return {
    current,

    baseline: baselinePressure,

    relativeToBaseline: current - baselinePressure,

    change3Hour,
    change6Hour,

    phase: classifyPressurePhase(
      current,
      change3Hour,
      change6Hour,
      baselinePressure,
    ),
  };
}

export function classifyPressurePhase(
  currentPressure: number,
  change3Hour: number,
  change6Hour: number,
  baselinePressure: number,
): PressurePhase {
  const config = WEATHER_DERIVATION_CONFIG.pressure;
  const relativeToBaseline = currentPressure - baselinePressure;

  if (change3Hour <= config.rapidlyFallingThreeHourChange) {
    return 'rapidlyFalling';
  }

  if (
    change3Hour <= config.fallingThreeHourChange ||
    change6Hour <= config.fallingSixHourChange
  ) {
    return 'falling';
  }

  if (
    change3Hour >= config.risingThreeHourChange ||
    change6Hour >= config.risingSixHourChange
  ) {
    return 'rising';
  }

  /*
   * Current pressure is meaningfully below
   * the recent local baseline.
   */
  if (relativeToBaseline <= config.establishedLowDelta) {
    return 'establishedLow';
  }

  /*
   * Current pressure is meaningfully above
   * the recent local baseline and stable.
   */
  if (
    relativeToBaseline >= config.stableHighDelta &&
    Math.abs(change6Hour) < config.stableHighMaximumSixHourChange
  ) {
    return 'stableHigh';
  }

  return 'stable';
}

export function getPressureBiteModifier(phase: PressurePhase): number {
  return WEATHER_DERIVATION_CONFIG.pressure.biteModifiers[phase];
}
