import type { Station } from '../types/station';
import { stateCodes } from '../types/states';
import type { RawTownWeather, TownWeather } from '../types/weather';
import { calculateDailyFishingScore } from './fishScore';
import {
  FLY_RECOMMENDATION_CONFIG,
  getFishingRegion,
  getFishingSeason,
  recommendFlyPatterns,
} from './flyRecommendations';
import {
  calculateBiteScore,
  calculatePrecipitationSummary,
  estimateHourlyWaterTemperatures,
  estimateWaterClarity,
  estimateWaterTemperature,
  estimateWaterTemperatureRange,
  findOptimalBiteWindow,
  getHoursSinceRain,
  getPressureBaseline,
  getPressureTrend,
  WEATHER_DERIVATION_CONFIG,
} from './weatherFunc';

export function deriveTownWeather(
  source: RawTownWeather,
  town: Station,
  referenceTime = new Date(),
): TownWeather {
  const daily = [...source.daily].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
  const hourlySource = [...source.hourly].sort((left, right) =>
    left.time.localeCompare(right.time),
  );
  const today = source.current.time.slice(0, 10);
  const todayDaily = daily.find(day => day.date === today);

  if (!todayDaily) {
    throw new Error(`Weather response has no daily data for ${today}`);
  }

  if (hourlySource.length === 0) {
    throw new Error('Weather response has no hourly data');
  }

  const currentIndex = findCurrentHourIndex(
    hourlySource,
    source.current.time,
  );
  const recentAirTemps = daily.map(day => day.temperatureMean);
  const estimatedWaterTemp = estimateWaterTemperature(recentAirTemps);
  const waterTemps = estimateWaterTemperatureRange(
    estimatedWaterTemp,
    todayDaily.temperatureMin,
    todayDaily.temperatureMax,
  );

  const precipitation = calculatePrecipitationSummary(
    hourlySource,
    daily,
    source.current.time,
  );
  const hoursSinceRain = getHoursSinceRain(hourlySource, currentIndex);
  const waterClarity = estimateWaterClarity({
    ...precipitation,
    hoursSinceRain,
  });

  const previousPressureDays = daily
    .filter(day => day.date < today)
    .slice(-WEATHER_DERIVATION_CONFIG.pressure.baselineDailyHistoryDays)
    .map(day => day.pressureMean);
  const pressureBaseline = getPressureBaseline(previousPressureDays);
  const pressureTrend = getPressureTrend(
    hourlySource,
    currentIndex,
    pressureBaseline.average,
  );

  const todayHourlySource = hourlySource.filter(
    hour => hour.time.slice(0, 10) === today,
  );
  const hourlyAirTemps = todayHourlySource.map(hour => hour.temperature);
  const hourlyWaterTemps = estimateHourlyWaterTemperatures(
    hourlyAirTemps,
    waterTemps.min,
    waterTemps.max,
  );
  const hourly = todayHourlySource.map((hour, index) => {
    const previousIndex = Math.max(
      0,
      index - WEATHER_DERIVATION_CONFIG.biteScore.temperatureChangeHours,
    );
    const waterTemp = hourlyWaterTemps[index];

    return {
      time: hour.time,
      hour: Number(hour.time.slice(11, 13)),
      airTemperature: hour.temperature,
      precipitation: hour.precipitation,
      pressure: hour.pressure,
      estimatedWaterTemperature: waterTemp,
      biteScore: calculateBiteScore(
        waterTemp,
        waterTemp - hourlyWaterTemps[previousIndex],
      ),
    };
  });

  const biteWindow = findOptimalBiteWindow(
    hourly,
    todayDaily.sunrise,
    todayDaily.sunset,
  );
  const fishingScore = calculateDailyFishingScore({
    pressurePhase: pressureTrend.phase,
    month: referenceTime.getMonth() + 1,
    waterTemperature: estimatedWaterTemp,
    clarity: waterClarity.river,
    cloudCover: source.current.cloudCover,
  });
  const flyRecommendations = recommendFlyPatterns({
    region: getFishingRegion(stateCodes[town.state]),
    season: getFishingSeason(today),
    waterTemperature:
      estimatedWaterTemp ||
      FLY_RECOMMENDATION_CONFIG.recommendation.missingWaterTemperature,
    clarity: waterClarity.river,
    cloudCover: source.current.cloudCover,
    pressurePhase: pressureTrend.phase,
    precipitationLast24Hours: precipitation.last24Hours,
  });

  return {
    current: {
      time: source.current.time,
      sunrise: todayDaily.sunrise,
      sunset: todayDaily.sunset,
      temperature: source.current.temperature,
      apparentTemperature: source.current.apparentTemperature,
      humidity: source.current.humidity,
      precipitation: source.current.precipitation,
      cloudCover: source.current.cloudCover,
      windSpeed: source.current.windSpeed,
      weatherCode: source.current.weatherCode,
      waterTemp: estimatedWaterTemp,
      waterTempMin: waterTemps.min,
      waterTempMax: waterTemps.max,
      biteWindow,
      last24Hours: precipitation.last24Hours,
      last7Days: precipitation.last7Days,
      next48Hours: precipitation.next48Hours,
      clarity: waterClarity,
      pressure: pressureTrend,
      score: fishingScore,
      flyRecommendations,
    },
    hourly,
    daily,
  };
}

function findCurrentHourIndex(
  hourly: RawTownWeather['hourly'],
  currentTime: string,
): number {
  let index = hourly.findIndex(hour => hour.time > currentTime);

  if (index < 0) {
    return hourly.length - 1;
  }

  return Math.max(0, index - 1);
}