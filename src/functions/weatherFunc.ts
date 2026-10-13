import { ActivityLevel, ActivitySegment } from '../components/ui/BiteWindowCard';
import type { BiteWindow, HourlyWeather, PressureTrend, PressurePhase, WaterClarityType, DailyWeather, WaterClarity, PrecipitationSummary } from '../types/weather';
import { getDecimalHour } from './func';

export function estimateWaterTemperature(dailyTemps: number[]): number | null {
  if (!dailyTemps || dailyTemps.length < 7) {
    return null;
  }

  const recent = dailyTemps.slice(-7);

  const weights = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3];

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
  const waterRange = airRange * 0.25;

  return {
    min: estimatedMeanWaterTemp - waterRange / 2,
    mean: estimatedMeanWaterTemp,
    max: estimatedMeanWaterTemp + waterRange / 2,
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
    const laggedIndex = Math.max(0, index - 2);

    const laggedAirTemp = hourlyAirTemps[laggedIndex];

    const normalizedAir =
      airRange === 0 ? 0.5 : (laggedAirTemp - airMin) / airRange;

    const targetWaterTemp = waterTempMin + normalizedAir * waterRange;

    /*
     * Smooth the response so water doesn't
     * move as quickly as air temperature.
     */
    const responseFactor = 0.35;

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
  const idealTemp = 57.5;
  const distanceFromIdeal = Math.abs(
    waterTemp - idealTemp,
  );

  score += Math.max(
    0,
    6 - distanceFromIdeal * 0.6,
  );

  /*
   * Temperature trend
   *
   * Cold water benefits from warming.
   */
  if (waterTemp < 55) {
    if (threeHourChange > 0) {
      score += Math.min(
        threeHourChange * 1.5,
        4,
      );
    } else {
      score += threeHourChange * 0.5;
    }
  }

  /*
   * Moderate water:
   * Small changes are useful, but we don't
   * want rapid warming to overpower the
   * already-good temperature.
   */
  if (
    waterTemp >= 55 &&
    waterTemp <= 62
  ) {
    if (
      threeHourChange > 0 &&
      threeHourChange <= 2
    ) {
      score += threeHourChange * 0.75;
    }

    if (threeHourChange > 2) {
      score += 1.5;
    }
  }

  /*
   * Warm water benefits from cooling.
   */
  if (waterTemp > 62) {
    if (threeHourChange < 0) {
      score += Math.min(
        Math.abs(threeHourChange) * 1.25,
        3,
      );
    }

    if (threeHourChange > 0) {
      score -= threeHourChange;
    }
  }

  /*
   * Increasing penalties as temperatures
   * approach stressful levels.
   */
  if (waterTemp >= 68) {
    score -= (waterTemp - 68) * 1.5;
  }

  if (waterTemp >= 70) {
    score -= 4;
  }
  return Math.max(
    0,
    Math.round(score * 10) / 10,
  );
}

export function findOptimalBiteWindow(
  hours: HourlyWeather[],
  sunrise: string,
  sunset: string
): BiteWindow | null {
    const sunriseHour =
        getDecimalHour(sunrise);

      const sunsetHour =
        getDecimalHour(sunset);
  if (hours.length === 0) {
    return null;
  }

const daylightHours =
    hours.filter(hour => {
      return (
        hour.hour >= sunriseHour &&
        hour.hour < sunsetHour
      );
    });

  if (daylightHours.length === 0) {
    return null;
  }

  const minimumGoodScore = 4;

  let bestStart = -1;
  let bestEnd = -1;
  let bestAverage = -Infinity;

  let currentStart = -1;

  for (let i = 0; i <= daylightHours.length; i++) {
    const qualifies =
      i < daylightHours.length && daylightHours[i].biteScore >= minimumGoodScore;

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

    bestStart = Math.max(0, bestIndex - 1);

    bestEnd = Math.min(daylightHours.length - 1, bestIndex + 1);

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

  const startHour = Math.max(
    daylightHours[bestStart].hour,
    sunriseHour,
  );
  const endHour = Math.min(
    daylightHours[bestEnd].hour + 1,
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
        ((startHour - sunriseHour) /
          (sunsetHour - sunriseHour)) *
        100,

      endPercent:
        ((endHour - sunriseHour) /
          (sunsetHour - sunriseHour)) *
        100,

    score: bestAverage,

    label: bestAverage >= 6 ? 'Prime' : bestAverage >= 4 ? 'Good' : 'Fair',
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

  const normalizedScore =
    (biteScore - minScore) /
    (maxScore - minScore);
  if (normalizedScore >= 0.85) {
    return 'prime';
  }

  if (normalizedScore >= 0.55) {
    return 'good';
  }

  if (normalizedScore >= 0.3) {
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

  const scores =
      daylightHours.map(
        hour => hour.biteScore,
      );

    const minScore =
      Math.min(...scores);

    const maxScore =
      Math.max(...scores);

  const segments: ActivitySegment[] = [];

  let startHour = daylightHours[0].hour;

  let currentLevel = getActivityLevel(daylightHours[0].biteScore, minScore, maxScore);

  for (let i = 1; i <= daylightHours.length; i++) {
    const current = daylightHours[i];

    const nextLevel = current ? getActivityLevel(current.biteScore, minScore, maxScore) : null;
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
  hourly: HourlyWeather[],
  daily: DailyWeather[],
  currentTime: string,
): PrecipitationSummary {
  const currentIndex =
    hourly.findIndex(
      hour =>
        hour.time === currentTime,
    );
  /*
   * Open-Meteo current time may not always
   * exactly match an hourly timestamp.
   */
  const nearestIndex =
    currentIndex >= 0
      ? currentIndex
      : hourly.findIndex(
          hour =>
            hour.time >= currentTime,
        );

  const index =
    nearestIndex >= 0
      ? nearestIndex
      : 0;

  const last24Hours =
    hourly
      .slice(
        Math.max(0, index - 23),
        index + 1,
      )
      .reduce(
        (sum, hour) =>
          sum +
          hour.precipitation,
        0,
      );

  const next48Hours =
    hourly
      .slice(
        index + 1,
        index + 49,
      )
      .reduce(
        (sum, hour) =>
          sum +
          hour.precipitation,
        0,
      );

  const today =
    currentTime.split('T')[0];

  const last7Days =
    daily
      .filter(
        day =>
          day.date <= today,
      )
      .slice(-7)
      .reduce(
        (sum, day) =>
          sum +
          day.precipitation,
        0,
      );

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
      river:
        estimateRiverClarity(
          precipitation,
        ),

      headwater:
        estimateHeadwaterClarity(
          precipitation,
        ),
    };
}

export const clarityThresholds = {
  highlyStained: {
    last24Hours: 1,
    last7Days: 2.5,
  },

  stained: {
    last24Hours: 0.5,
    last7Days: 1.5,
  },

  slightlyStained: {
    last24Hours: 0.2,
    last7Days: 0.75,
  },
};

export function getHoursSinceRain(
  hourly: HourlyWeather[],
  currentIndex: number,
): number | null {
  for (
    let i = currentIndex;
    i >= 0;
    i--
  ) {
    if (
      hourly[i].precipitation > 0.01
    ) {
      return currentIndex - i;
    }
  }

  return null;
}

function estimateHeadwaterClarity(
  precipitation: PrecipitationSummary,
): WaterClarityType {
  const {
    last24Hours,
    last7Days,
    hoursSinceRain,
  } = precipitation;

  if (
    hoursSinceRain !== null &&
    hoursSinceRain <= 4 &&
    last24Hours >= 0.75
  ) {
    return 'highlyStained';
  }

  if (
    hoursSinceRain !== null &&
    hoursSinceRain <= 8 &&
    last24Hours >= 0.4
  ) {
    return 'stained';
  }

  if (
    hoursSinceRain !== null &&
    hoursSinceRain <= 16 &&
    last24Hours >= 0.15
  ) {
    return 'slightlyStained';
  }

  /*
   * Headwater/spring recovery:
   * once the rain has been over for a while,
   * don't keep penalizing clarity heavily.
   */
  if (
    hoursSinceRain !== null &&
    hoursSinceRain > 16
  ) {
    if (last7Days >= 2.5) {
      return 'slightlyStained';
    }

    return 'clear';
  }

  return 'clear';
}

function estimateRiverClarity(
  precipitation: PrecipitationSummary,
): WaterClarityType {
  const {
    last24Hours,
    last7Days,
    hoursSinceRain,
  } = precipitation;

  if (
    last24Hours >= 0.9 ||
    last7Days >= 2.25
  ) {
    return 'highlyStained';
  }

  if (
    last24Hours >= 0.45 ||
    last7Days >= 1.4
  ) {
    return 'stained';
  }

  if (
    last24Hours >= 0.15 ||
    last7Days >= 0.65 ||
    (
      hoursSinceRain !== null &&
      hoursSinceRain <= 36 &&
      last24Hours > 0.05
    )
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

export function getCloudCoverage(
  cloudCover: number,
): CloudCoverage {
  if (cloudCover <= 10) {
    return 'clear';
  }

  if (cloudCover <= 30) {
    return 'mostlyClear';
  }

  if (cloudCover <= 60) {
    return 'partlyCloudy';
  }

  if (cloudCover <= 85) {
    return 'mostlyCloudy';
  }

  return 'overcast';
}

export const cloudCoveragePhrase: Record<
  CloudCoverage,
  string
> = {
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
      average: 1013,
      min: 1013,
      max: 1013,
    };
  }

  const average =
    dailyPressureMeans.reduce(
      (sum, value) => sum + value,
      0,
    ) / dailyPressureMeans.length;

  return {
    average,
    min: Math.min(...dailyPressureMeans),
    max: Math.max(...dailyPressureMeans),
  };
}

export function getPressureTrend(
  hourly: HourlyWeather[],
  index: number,
  baselinePressure: number,
): PressureTrend {
  const current =
    hourly[index].pressure;

  const threeHourIndex =
    Math.max(0, index - 3);

  const sixHourIndex =
    Math.max(0, index - 6);

  const change3Hour =
    current -
    hourly[threeHourIndex].pressure;

  const change6Hour =
    current -
    hourly[sixHourIndex].pressure;

  return {
    current,

    baseline:
      baselinePressure,

    relativeToBaseline:
      current -
      baselinePressure,

    change3Hour,
    change6Hour,

    phase:
      classifyPressurePhase(
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
  const relativeToBaseline =
    currentPressure -
    baselinePressure;

  if (change3Hour <= -2) {
    return 'rapidlyFalling';
  }

  if (
    change3Hour <= -0.7 ||
    change6Hour <= -1.5
  ) {
    return 'falling';
  }

  if (
    change3Hour >= 0.7 ||
    change6Hour >= 1.5
  ) {
    return 'rising';
  }

  /*
   * Current pressure is meaningfully below
   * the recent local baseline.
   */
  if (relativeToBaseline <= -5) {
    return 'establishedLow';
  }

  /*
   * Current pressure is meaningfully above
   * the recent local baseline and stable.
   */
  if (
    relativeToBaseline >= 5 &&
    Math.abs(change6Hour) < 1
  ) {
    return 'stableHigh';
  }

  return 'stable';
}

export function getPressureBiteModifier(
  phase: PressurePhase,
): number {
  switch (phase) {
    case 'rapidlyFalling':
      return 2.5;

    case 'falling':
      return 1.5;

    case 'rising':
      return 0.5;

    case 'stableHigh':
      return 0;

    case 'stable':
      return 0;

    case 'establishedLow':
      return -2;
  }
}