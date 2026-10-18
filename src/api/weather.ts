// src/api/weather.ts

import type { Station } from '../types/station';
import type {
  RawCurrentWeather,
  RawDailyWeather,
  RawHourlyWeather,
  RawTownWeather,
  RawTownWeatherMap,
} from '../types/weather';

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
  timezone: string;
  current?: OpenMeteoCurrent;
  daily?: OpenMeteoDaily;
  hourly?: OpenMeteoHourly;
}

interface NormalizedWeatherResponse {
  timezone: string;
  current?: RawCurrentWeather;
  hourly: RawHourlyWeather[];
  daily: RawDailyWeather[];
}

const CURRENT_VARIABLES = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'cloud_cover',
  'pressure_msl',
  'wind_speed_10m',
  'weather_code',
].join(',');

const HOURLY_VARIABLES = [
  'temperature_2m',
  'precipitation',
  'pressure_msl',
].join(',');

const DAILY_VARIABLES = [
  'temperature_2m_max',
  'temperature_2m_min',
  'temperature_2m_mean',
  'precipitation_sum',
  'weather_code',
  'cloud_cover_mean',
  'pressure_msl_mean',
  'sunrise',
  'sunset',
].join(',');

export async function fetchTownWeather(
  towns: Station[],
  cachedWeather: ReadonlyMap<string, RawTownWeather> = new Map(),
): Promise<RawTownWeatherMap> {
  if (towns.length === 0) {
    return new Map();
  }

  const weatherEntries = await Promise.all(
    towns.map(async town => {
      const cached = cachedWeather.get(town.id);
      const weather = cached
        ? await fetchIncrementalWeather(town, cached)
        : await fetchBootstrapWeather(town);

      return [town.id, weather] as const;
    }),
  );

  return new Map(weatherEntries);
}

async function fetchBootstrapWeather(town: Station): Promise<RawTownWeather> {
  const params = createBaseParams(town);
  params.set('current', CURRENT_VARIABLES);
  params.set('hourly', HOURLY_VARIABLES);
  params.set('daily', DAILY_VARIABLES);
  params.set('past_days', '7');
  params.set('forecast_days', '7');
  params.set('past_hours', '24');
  params.set('forecast_hours', '48');

  const response = normalizeResponse(await fetchOpenMeteo(params));

  if (!response.current) {
    throw new Error('Weather response did not include current conditions');
  }

  return {
    ...response,
    current: response.current,
  };
}

async function fetchIncrementalWeather(
  town: Station,
  cached: RawTownWeather,
): Promise<RawTownWeather> {
  const latestParams = createBaseParams(town);
  latestParams.set('current', CURRENT_VARIABLES);
  latestParams.set('hourly', HOURLY_VARIABLES);
  latestParams.set('past_hours', '2');
  latestParams.set('forecast_hours', '1');

  const latest = normalizeResponse(await fetchOpenMeteo(latestParams));
  if (!latest.current) {
    throw new Error('Weather response did not include current conditions');
  }
  const currentHour = latest.current.time.slice(0, 13);
  const latestObservedHour = latest.hourly
    .filter(hour => hour.time.slice(0, 13) <= currentHour)
    .slice(-1);

  const currentDate = latest.current.time.slice(0, 10);
  const latestCachedHour = cached.hourly.at(-1)?.time;
  const nextHour = latestCachedHour
    ? shiftLocalHour(latestCachedHour, 1)
    : undefined;
  const lastCachedDate = cached.daily.at(-1)?.date;
  const nextDate = lastCachedDate ? shiftLocalDate(lastCachedDate, 1) : undefined;
  const hourlyEnd = shiftLocalHour(latest.current.time, 48);
  const dailyEnd = shiftLocalDate(currentDate, 6);
  const hasNewHourly = Boolean(nextHour && nextHour <= hourlyEnd);
  const hasNewDaily = Boolean(nextDate && nextDate <= dailyEnd);
  let hourly: RawHourlyWeather[] = [];
  let daily: RawDailyWeather[] = [];
  let timezone = latest.timezone;

  if (hasNewHourly || hasNewDaily) {
    const params = createBaseParams(town);

    if (hasNewHourly && nextHour) {
      params.set('hourly', HOURLY_VARIABLES);
      params.set('start_hour', nextHour);
      params.set('end_hour', hourlyEnd);
    }

    if (hasNewDaily && nextDate) {
      params.set('daily', DAILY_VARIABLES);
      params.set('start_date', nextDate);
      params.set('end_date', dailyEnd);
    }

    const additions = normalizeResponse(await fetchOpenMeteo(params));
    hourly = additions.hourly;
    daily = additions.daily;
    timezone = additions.timezone;
  }

  return {
    timezone,
    current: latest.current,
    hourly: latestObservedHour.concat(hourly),
    daily,
  };
}

function createBaseParams(town: Station): URLSearchParams {
  return new URLSearchParams({
    latitude: String(town.latitude),
    longitude: String(town.longitude),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'auto',
  });
}

async function fetchOpenMeteo(
  params: URLSearchParams,
): Promise<OpenMeteoResponse> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }

  return response.json();
}

function normalizeResponse(
  response: OpenMeteoResponse,
): NormalizedWeatherResponse {
  const currentData = response.current;
  const hourlyData = response.hourly;
  const dailyData = response.daily;
  const current: RawCurrentWeather | undefined = currentData
    ? {
        time: currentData.time,
        temperature: currentData.temperature_2m,
        apparentTemperature: currentData.apparent_temperature,
        humidity: currentData.relative_humidity_2m,
        precipitation: currentData.precipitation,
        cloudCover: currentData.cloud_cover,
        pressure: currentData.pressure_msl,
        windSpeed: currentData.wind_speed_10m,
        weatherCode: currentData.weather_code,
      }
    : undefined;
  const hourly = hourlyData?.time.map((time, index) => ({
    time,
    temperature: hourlyData.temperature_2m[index],
    precipitation: hourlyData.precipitation[index],
    pressure: hourlyData.pressure_msl[index],
  })) ?? [];
  const daily = dailyData?.time.map((date, index) => ({
    date,
    temperatureMax: dailyData.temperature_2m_max[index],
    temperatureMin: dailyData.temperature_2m_min[index],
    temperatureMean: dailyData.temperature_2m_mean[index],
    precipitation: dailyData.precipitation_sum[index],
    weatherCode: dailyData.weather_code[index],
    cloudCoverMean: dailyData.cloud_cover_mean[index],
    pressureMean: dailyData.pressure_msl_mean[index],
    sunrise: dailyData.sunrise[index],
    sunset: dailyData.sunset[index],
  })) ?? [];

  return {
    timezone: response.timezone,
    current,
    hourly,
    daily,
  };
}

function shiftLocalHour(time: string, hours: number): string {
  const [date, hour] = time.slice(0, 13).split('T');
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day, Number(hour) + hours));

  return `${shifted.toISOString().slice(0, 13)}:00`;
}

function shiftLocalDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));

  return shifted.toISOString().slice(0, 10);
}
