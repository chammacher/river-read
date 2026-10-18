import {
  calculateBiteScore,
  classifyPressurePhase,
  estimateWaterClarity,
  estimateWaterTemperature,
  estimateWaterTemperatureRange,
  findOptimalBiteWindow,
  getCloudCoverage,
  getHoursSinceRain,
  WEATHER_DERIVATION_CONFIG,
} from '../src/functions/weatherFunc';
import type { HourlyWeather } from '../src/types/weather';

describe('weather derivation tuning defaults', () => {
  it('preserves the weighted water-temperature estimate and range', () => {
    const dailyEstimate = estimateWaterTemperature(
      Array(7).fill(50) as number[],
    );
    const range = estimateWaterTemperatureRange(dailyEstimate, 40, 80);

    expect(dailyEstimate).toBeCloseTo(52.5);
    expect(range).toEqual({ min: 47.5, mean: 52.5, max: 57.5 });
    expect(WEATHER_DERIVATION_CONFIG.waterTemperature.recentDays).toBe(7);
  });

  it('keeps the ideal bite-score peak and qualifying window threshold', () => {
    expect(calculateBiteScore(57.5, 0)).toBe(6);
    expect(WEATHER_DERIVATION_CONFIG.biteWindow.minimumGoodScore).toBe(4);

    const daylight = [4, 5, 6].map((biteScore, index) =>
      ({
        time: `2026-10-17T0${index + 8}:00`,
        hour: index + 8,
        airTemperature: 58,
        estimatedWaterTemperature: 57.5,
        precipitation: 0,
        pressure: 1013,
        biteScore,
      }) satisfies HourlyWeather,
    );
    const window = findOptimalBiteWindow(
      daylight,
      '2026-10-17T07:00',
      '2026-10-17T18:00',
    );

    expect(window).toMatchObject({
      startHour: 8,
      endHour: 11,
      peakHour: 10,
      label: 'Good',
    });
  });

  it('uses the active river and headwater clarity cutoffs', () => {
    expect(
      estimateWaterClarity({
        last24Hours: 0.45,
        last7Days: 0,
        hoursSinceRain: 999,
        next48Hours: 0,
      }).river,
    ).toBe('stained');
    expect(
      estimateWaterClarity({
        last24Hours: 0.75,
        last7Days: 0,
        hoursSinceRain: 4,
        next48Hours: 0,
      }).headwater,
    ).toBe('highlyStained');
    expect(WEATHER_DERIVATION_CONFIG.clarity.river.stainedRecentRain).toBe(
      0.45,
    );
  });

  it('preserves rain, pressure, and cloud threshold boundaries', () => {
    expect(getHoursSinceRain([{ precipitation: 0.01 }], 0)).toBe(999);
    expect(getHoursSinceRain([{ precipitation: 0.011 }], 0)).toBe(0);
    expect(classifyPressurePhase(1011, -2, -2, 1013)).toBe('rapidlyFalling');
    expect(getCloudCoverage(10)).toBe('clear');
    expect(getCloudCoverage(11)).toBe('mostlyClear');
  });
});