export type Landmark = {
  x: number;
  y: number;
  z: number;
};

export type RatioMetric = {
  name: string;
  value: number;
  goldenRatio: number;
  deviation: number;
  description: string;
};

export type FaceShape =
  | 'oval'
  | 'round'
  | 'square'
  | 'heart'
  | 'long'
  | 'diamond';

export type SkinAnalysisResult = {
  averageSkinTone: { r: number; g: number; b: number };
  brightness: number;
  redness: number;
  evenness: number;
  spotsCount: number;
  darkSpotCount: number;
  poreVisibility: number;
  overallScore: number;
};

export type AnalysisResult = {
  landmarks: Landmark[];
  metrics: RatioMetric[];
  overallScore: number;
  faceShape: FaceShape;
  faceShapeDescription: string;
  faceWidth: number;
  faceLength: number;
  eyeDistance: number;
  jawWidth: number;
  foreheadHeight: number;
};

export type Recommendation = {
  category: '发型' | '护肤' | '妆容';
  title: string;
  description: string;
  icon: string;
};

export type ScanResult = {
  analysis: AnalysisResult;
  skin: SkinAnalysisResult;
  recommendations: Recommendation[];
  imageUrl: string;
};

export type AppState = 'idle' | 'loading' | 'scanning' | 'done' | 'error';
