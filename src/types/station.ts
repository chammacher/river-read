export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  country?: string;
  state?: string;
  region: string;
  county: string;
  reach?: string;
  status: string;
  elevation: number;
  hatch?: string;
}

export interface StationDetails extends Station {
  // add weather details here
  recommendation: string;
  waterTempRecommendation: string;
  waterTempSpread: string;
}
