import { deriveTownWeather } from '../src/functions/deriveTownWeather';
import { mergeRawTownWeather } from '../src/functions/weatherData';
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

function createSource(): RawTownWeather {
  const daily = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 9, 10 + index))
      .toISOString()
      .slice(0, 10);

    return {
      date,
      temperatureMax: 70,
      temperatureMin: 50,
      temperatureMean: 60,
      precipitation: date === '2026-10-16' ? 0.2 : 0,
      weatherCode: 1,
      cloudCoverMean: 20,
      pressureMean: 1013,
      sunrise: `${date}T06:17`,
      sunset: `${date}T18:02`,
    };
  });
  const hourly = Array.from({ length: 120 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 9, 15, 12 + index))
      .toISOString()
      .slice(0, 16);

    return {
      time: date,
      temperature: 60,
      precipitation:
        date === '2026-10-16T13:00' || date === '2026-10-18T13:00'
          ? 0.1
          : 0,
      pressure: 1013,
    };
  });

  return {
    timezone: 'America/New_York',
    current: {
      time: '2026-10-17T12:30',
      temperature: 60,
      apparentTemperature: 60,
      humidity: 50,
      precipitation: 0,
      cloudCover: 20,
      pressure: 1013,
      windSpeed: 5,
      weatherCode: 1,
    },
    hourly,
    daily,
  };
}

describe('deriveTownWeather', () => {
  it('uses the local-date daily row and full hourly source series', () => {
    const weather = deriveTownWeather(
      createSource(),
      town,
      new Date('2026-10-17T12:30:00'),
    );

    expect(weather.current.sunrise).toBe('2026-10-17T06:17');
    expect(weather.current.last24Hours).toBeCloseTo(0.1);
    expect(weather.current.last7Days).toBeCloseTo(0.2);
    expect(weather.current.next48Hours).toBeCloseTo(0.1);
    expect(weather.hourly).toHaveLength(24);
    expect(weather.current.clarity).toEqual({
      river: 'slightlyStained',
      headwater: 'clear',
    });
    expect(weather.current.score.total).toBe(7.4);
    expect(weather.current.flyRecommendations).toHaveLength(5);
  });

  it('replaces matching hourly rows, appends new rows, and prunes old history', () => {
    const previous = createSource();
    const currentHour = previous.hourly[previous.hourly.length - 1];
    const updates: RawTownWeather = {
      ...previous,
      current: {
        ...previous.current,
        temperature: 61,
      },
      hourly: [
        { ...currentHour, temperature: 62 },
        {
          ...currentHour,
          time: '2026-10-20T12:00',
          temperature: 63,
        },
      ],
      daily: [
        {
          ...previous.daily[previous.daily.length - 1],
          date: '2026-10-18',
        },
      ],
    };

    const merged = mergeRawTownWeather(previous, updates);
    const replacedHour = merged.hourly.find(hour => hour.time === currentHour.time);

    expect(merged.current.temperature).toBe(61);
    expect(replacedHour?.temperature).toBe(62);
    expect(merged.hourly.filter(hour => hour.time === currentHour.time)).toHaveLength(1);
    expect(merged.hourly.some(hour => hour.time === '2026-10-20T12:00')).toBe(true);
    expect(merged.daily[0].date).toBe('2026-10-11');
    expect(merged.daily[merged.daily.length - 1].date).toBe('2026-10-18');
  });
});