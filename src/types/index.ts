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

export type TabKey = 'home' | 'report' | 'profile';

export const FACE_SHAPE_LABELS: Record<FaceShape, string> = {
  oval: '鹅蛋脸',
  round: '圆脸',
  square: '方脸',
  heart: '心形脸',
  long: '长脸',
  diamond: '菱形脸',
};
