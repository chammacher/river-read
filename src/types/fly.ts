import type {
  PressurePhase,
  WaterClarityType,
} from './weather';

export type FishingRegion =
  | 'rockies'
  | 'pacificNorthwest'
  | 'upperMidwest'
  | 'northeast'
  | 'appalachia';

export type FishingSeason =
  | 'winter'
  | 'earlySpring'
  | 'lateSpring'
  | 'earlySummer'
  | 'lateSummer'
  | 'earlyFall'
  | 'lateFall';

export type FlyCategory =
  | 'midge'
  | 'scud'
  | 'bwo'
  | 'pmd'
  | 'caddis'
  | 'stonefly'
  | 'terrestrial'
  | 'attractorNymph'
  | 'worm'
  | 'streamer';

export type FlyType =
  | 'dry'
  | 'emerger'
  | 'nymph'
  | 'streamer';

export interface ColorScore {
  color: FlyColor;
  score: number;
  reason: string;
}

export type FlyColor =
  | 'natural'
  | 'olive'
  | 'black'
  | 'brown'
  | 'gray'
  | 'tan'
  | 'white'
  | 'pink'
  | 'orange'
  | 'red'
  | 'chartreuse';

export interface FlyPattern {
  id: string;
  name: string;

  category: FlyCategory;
  type: FlyType;

  sizes: string[];

  regions: FishingRegion[];
  seasons: FishingSeason[];

  colors: FlyColor[];

  description: string;
}

export interface FlyRecommendationConditions {
  region: FishingRegion;
  season: FishingSeason;

  waterTemperature: number | null;

  clarity: WaterClarityType;

  cloudCover: number;

  pressurePhase: PressurePhase;

  precipitationLast24Hours: number;
}

export interface ColorRecommendation {
  preferredColors: FlyColor[];

  visibility:
    | 'natural'
    | 'moderate'
    | 'high';

  reasons: string[];
}

export interface FlyRecommendation {
  pattern: FlyPattern;

  score: number;

  suggestedColor: FlyColor;

  reasons: string[];
}