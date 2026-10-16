// src/storage/weatherStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CachedTownWeather } from '../types/weather';

const WEATHER_STORAGE_KEY = 'cached-weather';

export async function saveWeatherCache(
  weatherMap: Map<string, CachedTownWeather>,
): Promise<void> {
  const entries = Array.from(weatherMap.entries());

  await AsyncStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(entries));
}

export async function loadWeatherCache(): Promise<
  Map<string, CachedTownWeather>
> {
  const value = await AsyncStorage.getItem(WEATHER_STORAGE_KEY);

  if (!value) {
    return new Map();
  }

  const entries = JSON.parse(value) as [string, CachedTownWeather][];

  return new Map(entries);
}
