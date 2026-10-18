// src/types/weather.ts

import { DailyFishingScore } from '../functions/fishScore';
import { FlyRecommendation } from './fly';

export interface CachedTownWeather {
  data: TownWeather;
  lastUpdated: string;
  source?: RawTownWeather;
}

export interface RawCurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  weatherCode: number;
}

export interface RawHourlyWeather {
  time: string;
  temperature: number;
  precipitation: number;
  pressure: number;
}

export interface RawDailyWeather {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  temperatureMean: number;
  precipitation: number;
  weatherCode: number;
  cloudCoverMean: number;
  pressureMean: number;
  sunrise: string;
  sunset: string;
}

export interface RawTownWeather {
  timezone: string;
  current: RawCurrentWeather;
  hourly: RawHourlyWeather[];
  daily: RawDailyWeather[];
}

export type RawTownWeatherMap = Map<string, RawTownWeather>;

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  cloudCover: number;
  windSpeed: number;
  weatherCode: number;
  time: string;
  sunrise: string;
  sunset: string;
  score: DailyFishingScore;
  flyRecommendations: FlyRecommendation[];
}

export interface HourlyWeather {
  time: string;
  hour: number;

  airTemperature: number;
  estimatedWaterTemperature: number;
  precipitation: number;
  pressure: number;

  biteScore: number;
}
export type PressurePhase =
  | 'stableHigh'
  | 'falling'
  | 'rapidlyFalling'
  | 'establishedLow'
  | 'rising'
  | 'stable';
export interface PressureTrend {
  current: number;
  baseline: number;
  relativeToBaseline: number;

  change3Hour: number;
  change6Hour: number;

  phase: PressurePhase;
}

export interface PrecipitationSummary {
  last24Hours: number;
  last7Days: number;
  hoursSinceRain: number;
  next48Hours: number;
}

export interface BiteWindow {
  startTime: string;
  endTime: string;
  peakTime: string;

  startHour: number;
  endHour: number;
  peakHour: number;

  startPercent: number;
  endPercent: number;

  score: number;

  label: 'Prime' | 'Good' | 'Fair';
}

export interface CurrentWeatherDerivation extends CurrentWeather {

  waterTemp: number;
  waterTempMin: number;
  waterTempMax: number;
  clarity: WaterClarity;
  pressure: PressureTrend;
  last24Hours: number;
  last7Days: number;
  next48Hours: number;

  biteWindow: BiteWindow | null;
}

export interface WaterClarity {
  river: WaterClarityType;
  headwater: WaterClarityType;
}

export interface DailyWeather {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  temperatureMean: number;
  precipitation: number;
  weatherCode: number;
  cloudCoverMean: number;
  pressureMean: number;
}

export interface TownWeather {
  current: CurrentWeatherDerivation;
  daily: RawDailyWeather[];
  hourly: HourlyWeather[];
}

export type TownWeatherMap = Map<string, TownWeather>;

export type WaterClarityType =
  | 'clear'
  | 'slightlyStained'
  | 'stained'
  | 'highlyStained';
