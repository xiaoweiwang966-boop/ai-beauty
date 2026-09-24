import type { Landmark, RatioMetric } from '@/types';

function dist(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function dist3D(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

const GOLDEN = 1.618;

export function computeRatios(landmarks: Landmark[]): {
  metrics: RatioMetric[];
  overallScore: number;
  faceWidth: number;
  faceLength: number;
  eyeDistance: number;
  jawWidth: number;
  foreheadHeight: number;
} {
  if (landmarks.length < 468) {
    throw new Error('Landmark count insufficient for analysis');
  }

  const lm = landmarks;

  // Key MediaPipe Face Mesh landmark indices
  // Face width: cheekbone points — left 234, right 454
  const leftCheek = lm[234];
  const rightCheek = lm[454];

  // Face length: forehead top (10) to chin bottom (152)
  const foreheadTop = lm[10];
  const chinBottom = lm[152];

  // Nose: top of nose bridge (6) to bottom of nose tip (1)
  const noseTop = lm[6];
  const noseBottom = lm[1];

  // Nose width: left nostril (98) to right nostril (327)
  const noseLeft = lm[98];
  const noseRight = lm[327];

  // Eyes: left eye outer (33) to right eye outer (263)
  const leftEyeOuter = lm[33];
  const rightEyeOuter = lm[263];

  // Eye to eye distance (center to center)
  const leftEyeCenter = lm[159];
  const rightEyeCenter = lm[386];

  // Mouth: left corner (61) to right corner (291)
  const mouthLeft = lm[61];
  const mouthRight = lm[291];

  // Lips: upper lip top (0) to lower lip bottom (17)
  const upperLipTop = lm[0];
  const lowerLipBottom = lm[17];

  // Jaw: left jaw point (172) to right jaw point (397)
  const jawLeft = lm[172];
  const jawRight = lm[397];

  // Forehead: hairline estimate (10) to eyebrow top (105 for left brow top)
  const browLeftTop = lm[105];
  const browRightTop = lm[334];

  // Compute distances (normalized coordinates)
  const faceWidth = dist(leftCheek, rightCheek);
  const faceLength = dist(foreheadTop, chinBottom);
  const noseLength = dist(noseTop, noseBottom);
  const noseWidth = dist(noseLeft, noseRight);
  const eyeDistance = dist(leftEyeOuter, rightEyeOuter);
  const eyeToEyeCenter = dist(leftEyeCenter, rightEyeCenter);
  const mouthWidth = dist(mouthLeft, mouthRight);
  const lipHeight = dist(upperLipTop, lowerLipBottom);
  const jawWidth = dist(jawLeft, jawRight);
  const browWidth = dist(browLeftTop, browRightTop);

  // Forehead height = from forehead top to midpoint of brows
  const browMidY = (browLeftTop.y + browRightTop.y) / 2;
  const foreheadHeight = Math.abs(foreheadTop.y - browMidY);

  // Calculate various golden ratio metrics
  const metrics: RatioMetric[] = [
    {
      name: '面长 / 面宽',
      value: faceLength / faceWidth,
      goldenRatio: GOLDEN,
      deviation: Math.abs(faceLength / faceWidth - GOLDEN) / GOLDEN,
      description: '面部从额头到下巴的长度与颧骨间宽度之比',
    },
    {
      name: '鼻长 / 鼻宽',
      value: noseLength / noseWidth,
      goldenRatio: GOLDEN,
      deviation: Math.abs(noseLength / noseWidth - GOLDEN) / GOLDEN,
      description: '鼻梁长度与鼻翼宽度之比',
    },
    {
      name: '嘴宽 / 鼻宽',
      value: mouthWidth / noseWidth,
      goldenRatio: GOLDEN * 0.93,
      deviation: Math.abs(mouthWidth / noseWidth - GOLDEN * 0.93) / (GOLDEN * 0.93),
      description: '嘴巴宽度与鼻子宽度之比，理想约为1.5',
    },
    {
      name: '两眼间距 / 眼宽',
      value: eyeToEyeCenter / (eyeDistance - eyeToEyeCenter),
      goldenRatio: GOLDEN * 0.62,
      deviation:
        Math.abs(eyeToEyeCenter / (eyeDistance - eyeToEyeCenter) - GOLDEN * 0.62) /
        (GOLDEN * 0.62),
      description: '两眼内角间距与单眼宽度之比',
    },
    {
      name: '额头高 / 面长',
      value: foreheadHeight / faceLength,
      goldenRatio: 1 / 3,
      deviation: Math.abs(foreheadHeight / faceLength - 1 / 3) / (1 / 3),
      description: '额头高度占整脸长度的比例，理想为1/3',
    },
    {
      name: '下颌宽 / 颧骨宽',
      value: jawWidth / faceWidth,
      goldenRatio: 0.7,
      deviation: Math.abs(jawWidth / faceWidth - 0.7) / 0.7,
      description: '下颌宽度与颧骨宽度之比，理想约为0.7',
    },
    {
      name: '眉间距 / 眼距',
      value: browWidth / eyeDistance,
      goldenRatio: GOLDEN * 0.6,
      deviation: Math.abs(browWidth / eyeDistance - GOLDEN * 0.6) / (GOLDEN * 0.6),
      description: '两眉间距与两眼外角距之比',
    },
    {
      name: '唇高 / 嘴宽',
      value: lipHeight / mouthWidth,
      goldenRatio: 1 / 3,
      deviation: Math.abs(lipHeight / mouthWidth - 1 / 3) / (1 / 3),
      description: '嘴唇高度与嘴巴宽度之比，理想为1/3',
    },
  ];

  // Overall score: average of (1 - deviation) * 100, clamped
  const avgDeviation =
    metrics.reduce((sum, m) => sum + m.deviation, 0) / metrics.length;
  const overallScore = Math.round(Math.max(0, Math.min(100, (1 - avgDeviation) * 100)));

  return {
    metrics,
    overallScore,
    faceWidth,
    faceLength,
    eyeDistance,
    jawWidth,
    foreheadHeight,
  };
}
