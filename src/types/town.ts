import type { Station } from './station';

export interface RecommendedTown extends Station {
  region: string;
}
