import type { Landmark, FaceShape } from '@/types';

function dist(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - a.x) ** 2 + (a.y - b.y) ** 2);
}

function distance(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const SHAPE_DESCRIPTIONS: Record<FaceShape, string> = {
  oval: '鹅蛋脸 — 面部轮廓柔和，颧骨略宽于额头和下颌，是公认的理想脸型',
  round: '圆脸 — 面部长宽比接近1:1，线条柔和圆润，给人亲切可爱的感觉',
  square: '方脸 — 下颌线条分明，额头和颧骨宽度接近，给人坚毅自信的印象',
  heart: '心形脸 — 额头较宽，向下逐渐收窄至尖下巴，甜美精致',
  long: '长脸 — 面部长度明显大于宽度，轮廓修长，气质优雅',
  diamond: '菱形脸 — 颧骨最宽，额头和下颌较窄，立体感强',
};

export function classifyFaceShape(landmarks: Landmark[]): {
  shape: FaceShape;
  description: string;
} {
  if (landmarks.length < 468) {
    return { shape: 'oval', description: SHAPE_DESCRIPTIONS.oval };
  }

  const lm = landmarks;

  // Key measurements
  const faceWidth = distance(lm[234], lm[454]); // cheekbone width
  const faceLength = distance(lm[10], lm[152]); // forehead to chin
  const jawWidth = distance(lm[172], lm[397]); // jaw width
  const foreheadWidth = distance(lm[54], lm[284]); // forehead width (temples)

  const lengthWidthRatio = faceLength / faceWidth;
  const jawToCheekRatio = jawWidth / faceWidth;
  const foreheadToCheekRatio = foreheadWidth / faceWidth;

  // Chin pointiness: distance from chin tip (152) to jaw line midpoint
  const jawLeft = lm[172];
  const jawRight = lm[397];
  const jawMidX = (jawLeft.x + jawRight.x) / 2;
  const jawMidY = (jawLeft.y + jawRight.y) / 2;
  const chinTip = lm[152];
  const chinPointiness = distance(
    { x: chinTip.x, y: chinTip.y, z: 0 },
    { x: jawMidX, y: jawMidY, z: 0 }
  ) / faceWidth;

  let shape: FaceShape;

  if (lengthWidthRatio > 1.5) {
    shape = 'long';
  } else if (lengthWidthRatio < 1.15) {
    // Round or square — check jaw sharpness
    if (jawToCheekRatio > 0.85) {
      shape = 'square';
    } else {
      shape = 'round';
    }
  } else if (jawToCheekRatio < 0.65 && chinPointiness < 0.12) {
    // Narrow jaw with pointed chin
    if (foreheadToCheekRatio > 0.85) {
      shape = 'heart';
    } else {
      shape = 'diamond';
    }
  } else if (jawToCheekRatio > 0.8 && foreheadToCheekRatio > 0.9) {
    // Broad jaw and forehead
    shape = 'square';
  } else if (foreheadToCheekRatio > 0.9 && jawToCheekRatio < 0.7) {
    // Wide forehead, narrow jaw
    shape = 'heart';
  } else if (jawToCheekRatio < 0.7 && foreheadToCheekRatio < 0.8) {
    // Narrow forehead and jaw, wide cheekbones
    shape = 'diamond';
  } else {
    // Default well-proportioned
    shape = 'oval';
  }

  return { shape, description: SHAPE_DESCRIPTIONS[shape] };
}
