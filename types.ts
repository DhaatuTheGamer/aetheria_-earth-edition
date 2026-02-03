
export interface PlanetLore {
  name: string;
  description: string;
  age: string;
  civilizationType: string;
  atmosphereComposition: string[];
  population: string;
  habitabilityScore: number;
}

export type DataLayer = 'visual' | 'thermal' | 'population' | 'vegetation';
export type SunType = 'yellow' | 'red' | 'blue';

export interface PlanetParameters {
  seed: number;
  rotationSpeed: number;
  tilt: number;
  
  // Customizer / Terraforming
  waterColor: string;
  landColor: string; // Not used in texture mode but kept for fallback
  atmosphereColor: string;
  cloudDensity: number; // 0 to 1
  snowLevel: number; // 0 (none) to 1 (iceball)
  waterMurkiness: number; // 0 (clear) to 1 (swamp)
  sunType: SunType;
  
  // Civilization & Visuals
  cityLightColor: string;
  cityLightIntensity: number; // 0 to 2.0
  
  // Dynamic Textures (Blob URLs)
  textureMapUrl?: string;
  cloudMapUrl?: string;

  // Visual Mode
  dataLayer: DataLayer;
  showSatellites: boolean;
}

export interface POIData {
  title: string;
  description: string;
  coordinates: { x: number, y: number };
}

export interface ChallengeTarget {
  active: boolean;
  description: string;
  targetStats: {
    habitabilityScore?: number;
    atmosphereColor?: string;
    cloudDensity?: number; // Target range +/- 0.1
    temperature?: 'frozen' | 'temperate' | 'hot'; 
  };
  success: boolean;
}

export interface SimulationState {
  lore: PlanetLore;
  params: PlanetParameters;
  isLoading: boolean;
  loadingMessage: string;
  photoMode: boolean;
  isProbeLanding: boolean;
  selectedPOI: POIData | null;
  challenge: ChallengeTarget;
  audioEnabled: boolean;
}
