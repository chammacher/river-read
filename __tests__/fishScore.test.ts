import {
  calculateDailyFishingScore,
  FISH_SCORE_CONFIG,
  getFishingScoreLabel,
} from '../src/functions/fishScore';

describe('fish score tuning defaults', () => {
  it('preserves the representative score and reasons', () => {
    const score = calculateDailyFishingScore({
      pressurePhase: 'rapidlyFalling',
      month: 5,
      waterTemperature: 57,
      clarity: 'slightlyStained',
      cloudCover: 60,
    });

    expect(score).toMatchObject({
      total: 8.7,
      pressure: 85,
      season: 90,
      waterTemperature: 100,
      clarity: 100,
      cloudCover: 85,
      label: 'Excellent',
    });
    expect(score.reasons).toContain(
      'Water temperature is in a strong trout feeding range',
    );
  });

  it('exposes label cutoffs without changing their boundary behavior', () => {
    expect(FISH_SCORE_CONFIG.labels.excellent).toBe(8.5);
    expect(getFishingScoreLabel(8.5)).toBe('Excellent');
    expect(getFishingScoreLabel(8.49)).toBe('Good');
  });

  it('preserves season score boundaries', () => {
    const scoreForMonth = (month: number) =>
      calculateDailyFishingScore({
        pressurePhase: 'stable',
        month,
        waterTemperature: 57,
        clarity: 'clear',
        cloudCover: 50,
      }).season;

    expect(scoreForMonth(3)).toBe(FISH_SCORE_CONFIG.seasonScores.winter);
    expect(scoreForMonth(4)).toBe(FISH_SCORE_CONFIG.seasonScores.spring);
    expect(scoreForMonth(6)).toBe(FISH_SCORE_CONFIG.seasonScores.spring);
    expect(scoreForMonth(7)).toBe(FISH_SCORE_CONFIG.seasonScores.summer);
    expect(scoreForMonth(9)).toBe(FISH_SCORE_CONFIG.seasonScores.fall);
    expect(scoreForMonth(11)).toBe(FISH_SCORE_CONFIG.seasonScores.winter);
  });
});