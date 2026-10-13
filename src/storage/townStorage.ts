// src/storage/townStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Station } from '../types/station';

const TOWNS_STORAGE_KEY = 'selected-towns';

export async function saveTowns(towns: Town[]): Promise<void> {
  await AsyncStorage.setItem(TOWNS_STORAGE_KEY, JSON.stringify(towns));
}

export async function loadTowns(): Promise<Town[]> {
  const value = await AsyncStorage.getItem(TOWNS_STORAGE_KEY);

  if (!value) {
    return [];
  }

  return JSON.parse(value) as Town[];
}

export async function clearStoredTowns(): Promise<void> {
  await AsyncStorage.removeItem(TOWNS_STORAGE_KEY);
}
