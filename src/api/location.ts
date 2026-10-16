// src/api/location.ts

import type { Station } from '../types/station';

export interface OpenMeteoGeocodingResponse {
  results?: LocationSearchResult[];
}

export interface LocationSearchResult {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    country_code: string;
    admin1: string;
    admin2: string;
    country: string;
    elevation: number;
    timezone: string;
}

export async function searchLocations(query: string): Promise<Station[]> {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    name: trimmed,
    count: '8',
    language: 'en',
    format: 'json',
    countryCode: 'US',
  });

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Location search failed: ${response.status}`);
  }

  const data: OpenMeteoGeocodingResponse = await response.json();
  return (data.results ?? []).map(location => ({
    id: location.id,
    name: location.name,
    latitude: location.latitude,
    longitude: location.longitude,
    countryCode: location.country_code,
    state: location.admin1,
    country: location.country,
    elevation: location.elevation,
    timezone: location.timezone,
    county: location.admin2,
    region: location.admin1,
    score: 9.2,
    status: 'Prime',
    waterTemp: 62,
    hatch: 'PMD & Caddis',
  }));
}
