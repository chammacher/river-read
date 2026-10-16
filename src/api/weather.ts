// src/api/weather.ts

import type { Station } from '../types/station';
import type {
  TownWeather,
  TownWeatherMap,
} from '../types/weather';
import { stateCodes } from '../types/states';

import {
  estimateWaterTemperature,
  estimateWaterTemperatureRange,
  estimateHourlyWaterTemperatures,
  calculateBiteScore,
  findOptimalBiteWindow,
  calculatePrecipitationSummary,
  estimateWaterClarity,
  getHoursSinceRain,
  getPressureBaseline,
  getPressureTrend,
} from '../functions/weatherFunc';
import { calculateDailyFishingScore } from '../functions/fishScore';
import { FlyRecommendationConditions } from '../types/fly';
import {
  getFishingRegion,
  getFishingSeason,
  recommendFlyPatterns,
} from '../functions/flyRecommendations';

interface OpenMeteoCurrent {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation: number;
  cloud_cover: number;
  pressure_msl: number;
  wind_speed_10m: number;
  weather_code: number;
}

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  temperature_2m_mean: number[];
  precipitation_sum: number[];
  weather_code: number[];
  cloud_cover_mean: number[];
  pressure_msl_mean: number[];
  sunrise: string[];
  sunset: string[];
}

interface OpenMeteoHourly {
  time: string[];
  precipitation: number[];
  temperature_2m: number[];
  pressure_msl: number[];
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  daily: OpenMeteoDaily;
  hourly: OpenMeteoHourly;
}

export async function fetchTownWeather(
  towns: Station[],
): Promise<TownWeatherMap> {
  if (towns.length === 0) {
    return new Map();
  }

  const latitudes = towns.map(town => town.latitude).join(',');

  const longitudes = towns.map(town => town.longitude).join(',');

  const params = new URLSearchParams({
    latitude: latitudes,
    longitude: longitudes,

    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'weather_code',
    ].join(','),

    hourly: ['temperature_2m', 'precipitation', 'pressure_msl'].join(','),

    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'temperature_2m_mean',
      'precipitation_sum',
      'weather_code',
      'cloud_cover_mean',
      'pressure_msl_mean',
      'sunrise',
      'sunset',
    ].join(','),

    past_days: '7',
    forecast_days: '7',

    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'auto',
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }

  const data: OpenMeteoResponse | OpenMeteoResponse[] = await response.json();

  /*
   * Open-Meteo returns an object for one location
   * and an array for multiple locations.
   */
  const results = Array.isArray(data) ? data : [data];
  const weatherMap = new Map<string, TownWeather>();

  results.forEach((result, index) => {
    const town = towns[index];

    if (!town) {
      return;
    }
    const now = result.current.time.split('T');
    const today = now[0];
    const hour: number = Number(now[1].split(':')[0]);
    const daily = result.daily.time.map((date, dayIndex) => ({
      date,

      temperatureMax: result.daily.temperature_2m_max[dayIndex],

      temperatureMin: result.daily.temperature_2m_min[dayIndex],

      temperatureMean: result.daily.temperature_2m_mean[dayIndex],

      precipitation: result.daily.precipitation_sum[dayIndex],

      weatherCode: result.daily.weather_code[dayIndex],

      cloudCoverMean: result.daily.cloud_cover_mean[dayIndex],

      pressureMean: result.daily.pressure_msl_mean[dayIndex],

      sunrise: result.daily.sunrise[dayIndex],

      sunset: result.daily.sunset[dayIndex],
    }));

    // run calculations here to generate a score and deeper metrics
    const recentAirTemps = daily.slice(-7).map(day => day.temperatureMean);
    const estimatedWaterTemp = estimateWaterTemperature(recentAirTemps);
    // water temp spread
    const waterTemps = estimateWaterTemperatureRange(
      estimatedWaterTemp,
      daily[daily.length / 2].temperatureMin,
      daily[daily.length / 2].temperatureMax,
    );

    // bite window range
    const todayHourlyIndexes: { time: string; hourlyIndex: number }[] =
      result.hourly.time
        .map((time, hourlyIndex) => ({
          time,
          hourlyIndex,
        }))
        .filter(({ time }) => time.startsWith(today));
    const hourlyAirTemps = todayHourlyIndexes.map(
      ({ hourlyIndex }) => result.hourly.temperature_2m[hourlyIndex],
    );

    const hourlyRain = todayHourlyIndexes.map(
      ({ hourlyIndex }) => result.hourly.precipitation[hourlyIndex],
    );
    const hourlyPressure = todayHourlyIndexes.map(
      ({ hourlyIndex }) => result.hourly.pressure_msl[hourlyIndex],
    );
    const hourlyWaterTemps = estimateHourlyWaterTemperatures(
      hourlyAirTemps,
      waterTemps.min,
      waterTemps.max,
    );

    const previousPressureDays = daily
      .filter(day => day.date < today)
      .slice(-3)
      .map(day => day.pressureMean);
    const pressureBaseline = getPressureBaseline(previousPressureDays);

    const hourly = todayHourlyIndexes.map(({ time }, hourlyIndex) => {
      const waterTemp = hourlyWaterTemps[hourlyIndex];

      const previousIndex = Math.max(0, hourlyIndex - 3);

      const threeHourChange = waterTemp - hourlyWaterTemps[previousIndex];

      const hourlyHour: number = Number(time.substring(11, 13));
      return {
        time,
        hour: hourlyHour,

        airTemperature: hourlyAirTemps[hourlyIndex],
        precipitation: hourlyRain[hourlyIndex],
        pressure: hourlyPressure[hourlyIndex],
        estimatedWaterTemperature: waterTemp,

        biteScore: calculateBiteScore(waterTemp, threeHourChange),
      };
    });

    const precipitation = calculatePrecipitationSummary(
      hourly,
      daily,
      result.current.time,
    );
    const hoursSinceRain = getHoursSinceRain(hourly, hour);
    const waterClarity = estimateWaterClarity({
      ...precipitation,
      hoursSinceRain,
    });

    const pressureTrend = getPressureTrend(hourly, index, pressureBaseline.average);

    const biteWindow = findOptimalBiteWindow(
      hourly,
      daily[daily.length / 2].sunrise,
      daily[daily.length / 2].sunset,
    );
    // fish score
    const fishingScore = calculateDailyFishingScore({
      pressurePhase: pressureTrend.phase,

      month: new Date().getMonth() + 1,

      waterTemperature: estimatedWaterTemp,

      clarity: waterClarity.river,

      cloudCover: result.current.cloud_cover,
    });
    const flyConditions: FlyRecommendationConditions = {
      region: getFishingRegion(stateCodes[town.state]),

      season: getFishingSeason(today),

      waterTemperature: estimatedWaterTemp || 55,

      clarity: waterClarity.river,

      cloudCover: result.current.cloud_cover,

      pressurePhase: pressureTrend.phase,

      precipitationLast24Hours: precipitation.last24Hours,
    };
    const flyRecommendations = recommendFlyPatterns(flyConditions);
    weatherMap.set(town.id, {
      current: {
        time: result.current.time,
        sunrise: daily[daily.length / 2].sunrise,
        sunset: daily[daily.length / 2].sunset,
        temperature: result.current.temperature_2m,
        apparentTemperature: result.current.apparent_temperature,
        humidity: result.current.relative_humidity_2m,
        precipitation: result.current.precipitation,
        cloudCover: result.current.cloud_cover,
        windSpeed: result.current.wind_speed_10m,
        weatherCode: result.current.weather_code,
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
    });
  });

  return weatherMap;
}
