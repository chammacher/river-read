import { fetchTownWeather } from '../src/api/weather';
import type { Station } from '../src/types/station';
import type { RawTownWeather } from '../src/types/weather';

const town: Station = {
  id: 'town-1',
  name: 'River Town',
  latitude: 42,
  longitude: -75,
  countryCode: 'US',
  state: 'New York',
  region: 'Northeast',
  county: 'Example',
  status: 'active',
  elevation: 500,
};

function createResponse(
  currentTime: string,
  hourlyTimes: string[] = [],
  dailyDates: string[] = [],
  timezone = 'America/New_York',
): Response {
  const response = {
    timezone,
    current: {
      time: currentTime,
      temperature_2m: 60,
      apparent_temperature: 60,
      relative_humidity_2m: 50,
      precipitation: 0.1,
      cloud_cover: 20,
      pressure_msl: 1013,
      wind_speed_10m: 5,
      weather_code: 1,
    },
    hourly: {
      time: hourlyTimes,
      temperature_2m: hourlyTimes.map(() => 60),
      precipitation: hourlyTimes.map(() => 0.1),
      pressure_msl: hourlyTimes.map(() => 1013),
    },
    daily: {
      time: dailyDates,
      temperature_2m_max: dailyDates.map(() => 70),
      temperature_2m_min: dailyDates.map(() => 50),
      temperature_2m_mean: dailyDates.map(() => 60),
      precipitation_sum: dailyDates.map(() => 0.2),
      weather_code: dailyDates.map(() => 1),
      cloud_cover_mean: dailyDates.map(() => 20),
      pressure_msl_mean: dailyDates.map(() => 1013),
      sunrise: dailyDates.map(date => `${date}T06:00`),
      sunset: dailyDates.map(date => `${date}T18:00`),
    },
  };

  return {
    ok: true,
    json: async () => response,
  } as Response;
}

function createCachedSource(): RawTownWeather {
  return {
    timezone: 'America/New_York',
    current: {
      time: '2026-10-17T12:00',
      temperature: 59,
      apparentTemperature: 59,
      humidity: 50,
      precipitation: 0,
      cloudCover: 20,
      pressure: 1013,
      windSpeed: 5,
      weatherCode: 1,
    },
    hourly: [
      {
        time: '2026-10-19T11:00',
        temperature: 60,
        precipitation: 0,
        pressure: 1013,
      },
    ],
    daily: [
      {
        date: '2026-10-22',
        temperatureMax: 70,
        temperatureMin: 50,
        temperatureMean: 60,
        precipitation: 0,
        weatherCode: 1,
        cloudCoverMean: 20,
        pressureMean: 1013,
        sunrise: '2026-10-22T06:00',
        sunset: '2026-10-22T18:00',
      },
    ],
  };
}

describe('fetchTownWeather', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('bootstraps each town with bounded hourly data and daily history', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        createResponse('2026-10-17T12:30', ['2026-10-17T12:00'], [
          '2026-10-17',
        ]),
      )
      .mockResolvedValueOnce(
        createResponse(
          '2026-10-17T09:30',
          ['2026-10-17T09:00'],
          ['2026-10-17'],
          'America/Chicago',
        ),
      );

    const secondTown = { ...town, id: 'town-2', longitude: -90 };
    const weather = await fetchTownWeather([town, secondTown]);
    const firstRequest = new URL(String(jest.mocked(fetch).mock.calls[0][0]));

    expect(weather.get('town-1')?.current.temperature).toBe(60);
    expect(weather.get('town-2')?.timezone).toBe('America/Chicago');
    expect(firstRequest.searchParams.get('past_days')).toBe('7');
    expect(firstRequest.searchParams.get('forecast_days')).toBe('7');
    expect(firstRequest.searchParams.get('past_hours')).toBe('24');
    expect(firstRequest.searchParams.get('forecast_hours')).toBe('48');
  });

  it('requests only timestamps beyond saved cursors and the latest observed hour', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        createResponse(
          '2026-10-17T12:30',
          ['2026-10-17T11:00', '2026-10-17T12:00', '2026-10-17T13:00'],
        ),
      )
      .mockResolvedValueOnce(
        createResponse('2026-10-17T12:30', ['2026-10-19T12:00'], [
          '2026-10-23',
        ]),
      );

    const weather = await fetchTownWeather(
      [town],
      new Map([[town.id, createCachedSource()]]),
    );
    const [latestRequest, deltaRequest] = fetch.mock.calls.map(
      ([url]) => new URL(String(url)),
    );

    expect(weather.get(town.id)?.current.temperature).toBe(60);
    expect(weather.get(town.id)?.hourly.map(hour => hour.time)).toEqual([
      '2026-10-17T12:00',
      '2026-10-19T12:00',
    ]);
    expect(deltaRequest.searchParams.get('start_hour')).toBe(
      '2026-10-19T12:00',
    );
    expect(deltaRequest.searchParams.get('start_date')).toBe('2026-10-23');
    expect(deltaRequest.searchParams.has('past_days')).toBe(false);
    expect(latestRequest.searchParams.get('past_hours')).toBe('2');
  });
});