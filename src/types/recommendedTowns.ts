import { RecommendedTown } from '../types/town';

export const recommendedTowns: RecommendedTown[] = [
  {
    id: 'heber-city-ut',
    name: 'Heber City',
    state: 'UT',
    region: 'Wasatch Range',
    waters: 'Provo River System (Lower & Middle)',
    score: 9.2,
    status: 'PRIME',
    icon: 'kayaking',
  },
  {
    id: 'island-park-id',
    name: 'Island Park',
    state: 'ID',
    region: 'Caldera Basin',
    waters: "Henry's Fork & Harriman Ranch",
    score: 8.8,
    status: 'EXCELLENT',
    icon: 'phishing',
  },
  {
    id: 'jackson-wy',
    name: 'Jackson',
    state: 'WY',
    region: 'Teton Valley',
    waters: 'Snake River Corridor & Gros Ventre',
    score: 9.0,
    status: 'HATCHING',
    icon: 'landscape',
  },
];
