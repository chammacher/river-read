import {
  FLY_RECOMMENDATION_CONFIG,
  getColorRecommendation,
  getFishingSeason,
  getTopOptions,
  recommendFlyPatterns,
  scoreBWO,
  scoreScud,
} from '../src/functions/flyRecommendations';
import type { FlyRecommendationConditions } from '../src/types/fly';

const conditions: FlyRecommendationConditions = {
  region: 'upperMidwest',
  season: 'earlyFall',
  waterTemperature: 52,
  clarity: 'slightlyStained',
  cloudCover: 60,
  pressurePhase: 'stable',
  precipitationLast24Hours: 0.3,
};

describe('fly recommendation tuning defaults', () => {
  it('preserves category scores and their active condition thresholds', () => {
    expect(scoreScud(conditions).score).toBe(9);
    expect(scoreBWO(conditions).score).toBe(10);
    expect(FLY_RECOMMENDATION_CONFIG.categories.scud.coolWaterMaximum).toBe(
      52,
    );
  });

  it('preserves season transition days and color recommendations', () => {
    expect(getFishingSeason('2026-04-15T12:00:00')).toBe('earlySpring');
    expect(getFishingSeason('2026-04-16T12:00:00')).toBe('lateSpring');
    expect(getColorRecommendation(conditions).preferredColors).toEqual([
      'pink',
      'orange',
      'natural',
      'olive',
    ]);
  });

  it('uses the configured default gap for top color options', () => {
    const options = [
      { color: 'natural' as const, score: 10, reason: 'top' },
      { color: 'olive' as const, score: 6, reason: 'within gap' },
      { color: 'tan' as const, score: 1, reason: 'outside gap' },
    ];

    expect(getTopOptions(options).map(option => option.color)).toEqual([
      'natural',
      'olive',
    ]);
    expect(FLY_RECOMMENDATION_CONFIG.colors.topOptions.maximumScoreGap).toBe(4);
  });

  it('limits recommendations to the configured result count', () => {
    expect(recommendFlyPatterns(conditions)).toHaveLength(
      FLY_RECOMMENDATION_CONFIG.recommendation.maximumPatterns,
    );
  });
});