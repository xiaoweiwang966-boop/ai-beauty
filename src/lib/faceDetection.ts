import {
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';
import type { Landmark } from '@/types';

let landmarker: FaceLandmarker | null = null;

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (landmarker) return landmarker;

  const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate: 'GPU',
    },
    outputFaceBlendshapes: true,
    runningMode: 'IMAGE',
    numFaces: 1,
  });

  return landmarker;
}

export type DetectionResult = {
  landmarks: Landmark[];
  blendshapes: { categoryName: string; score: number }[];
};

export async function detectFace(
  imageElement: HTMLImageElement
): Promise<DetectionResult | null> {
  const detector = await getFaceLandmarker();
  const result = detector.detect(imageElement);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    return null;
  }

  const rawLandmarks = result.faceLandmarks[0];
  const landmarks: Landmark[] = rawLandmarks.map((lm) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z ?? 0,
  }));

  const blendshapes = result.faceBlendshapes?.[0]?.categories ?? [];

  return { landmarks, blendshapes };
}

export async function detectFromCanvas(
  canvas: HTMLCanvasElement
): Promise<DetectionResult | null> {
  const detector = await getFaceLandmarker();
  const result = detector.detect(canvas);

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    return null;
  }

  const rawLandmarks = result.faceLandmarks[0];
  const landmarks: Landmark[] = rawLandmarks.map((lm) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z ?? 0,
  }));

  const blendshapes = result.faceBlendshapes?.[0]?.categories ?? [];

  return { landmarks, blendshapes };
}
