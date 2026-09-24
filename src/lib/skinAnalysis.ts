import type { Landmark, SkinAnalysisResult } from '@/types';

function distance(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function analyzeSkin(
  imageData: ImageData,
  landmarks: Landmark[],
  imgWidth: number,
  imgHeight: number
): SkinAnalysisResult {
  const data = imageData.data;

  // Define face region using landmarks — use cheek area for skin sampling
  // Left cheek: 205, Right cheek: 425, Forehead: 10, Chin: 152
  const cheekLeft = landmarks[205];
  const cheekRight = landmarks[425];
  const forehead = landmarks[10];
  const chin = landmarks[152];

  const minX = Math.max(0, Math.floor(Math.min(cheekLeft.x, cheekRight.x, forehead.x) * imgWidth) - 20);
  const maxX = Math.min(imgWidth, Math.ceil(Math.max(cheekLeft.x, cheekRight.x, forehead.x) * imgWidth) + 20);
  const minY = Math.max(0, Math.floor(Math.min(forehead.y, cheekLeft.y, cheekRight.y) * imgHeight) - 20);
  const maxY = Math.min(imgHeight, Math.ceil(Math.max(chin.y, cheekLeft.y, cheekRight.y) * imgHeight) + 20);

  const pixels: { r: number; g: number; b: number }[] = [];
  let totalR = 0,
    totalG = 0,
    totalB = 0;
  let pixelCount = 0;

  // Sample skin pixels — detect skin tone using simple heuristic
  const skinPixels: { r: number; g: number; b: number; x: number; y: number }[] = [];

  for (let y = minY; y < maxY; y += 2) {
    for (let x = minX; x < maxX; x += 2) {
      const idx = (y * imgWidth + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Skin detection heuristic
      const isSkin =
        r > 60 &&
        g > 30 &&
        b > 15 &&
        r > g &&
        r > b &&
        r - g > 8 &&
        r - b > 8 &&
        Math.max(r, g, b) - Math.min(r, g, b) > 10;

      if (isSkin) {
        skinPixels.push({ r, g, b, x, y });
        totalR += r;
        totalG += g;
        totalB += b;
        pixelCount++;
        pixels.push({ r, g, b });
      }
    }
  }

  if (pixelCount === 0) {
    return {
      averageSkinTone: { r: 200, g: 170, b: 150 },
      brightness: 50,
      redness: 30,
      evenness: 70,
      spotsCount: 0,
      darkSpotCount: 0,
      poreVisibility: 30,
      overallScore: 60,
    };
  }

  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;

  // Brightness: average luminance
  const brightness = Math.round(((avgR * 0.299 + avgG * 0.587 + avgB * 0.114) / 255) * 100);

  // Redness: ratio of red channel to green channel
  const redness = Math.round(((avgR - avgG) / Math.max(1, avgR + avgG)) * 100);

  // Evenness: standard deviation of luminance across skin pixels
  let lumSum = 0;
  const luminances = pixels.map((p) => p.r * 0.299 + p.g * 0.587 + p.b * 0.114);
  const avgLum = luminances.reduce((s, l) => s + l, 0) / luminances.length;
  const variance =
    luminances.reduce((s, l) => s + (l - avgLum) ** 2, 0) / luminances.length;
  const stdDev = Math.sqrt(variance);
  const evenness = Math.round(Math.max(0, Math.min(100, 100 - stdDev * 2)));

  // Spot detection: pixels significantly darker or different from average
  let spotsCount = 0;
  let darkSpotCount = 0;
  for (const p of skinPixels) {
    const lum = p.r * 0.299 + p.g * 0.587 + p.b * 0.114;
    if (lum < avgLum - 35) {
      spotsCount++;
      if (lum < avgLum - 55) {
        darkSpotCount++;
      }
    }
  }
  // Normalize spot count relative to pixel count
  const spotRatio = spotsCount / pixelCount;
  const normalizedSpots = Math.round(Math.min(100, spotRatio * 800));
  const normalizedDarkSpots = Math.round(Math.min(100, (darkSpotCount / pixelCount) * 1200));

  // Pore visibility: high-frequency texture variation
  let textureSum = 0;
  let textureCount = 0;
  for (let i = 0; i < skinPixels.length - 4; i += 4) {
    const p1 = skinPixels[i];
    const p2 = skinPixels[i + 3];
    const lum1 = p1.r * 0.299 + p1.g * 0.587 + p1.b * 0.114;
    const lum2 = p2.r * 0.299 + p2.g * 0.587 + p2.b * 0.114;
    textureSum += Math.abs(lum1 - lum2);
    textureCount++;
  }
  const avgTexture = textureCount > 0 ? textureSum / textureCount : 0;
  const poreVisibility = Math.round(Math.min(100, avgTexture * 1.5));

  // Overall skin score
  const evennessScore = evenness;
  const spotScore = Math.max(0, 100 - normalizedSpots);
  const textureScore = Math.max(0, 100 - poreVisibility);
  const brightnessScore =
    brightness > 40 && brightness < 80 ? 100 : Math.max(0, 100 - Math.abs(brightness - 60));

  const overallScore = Math.round(
    (evennessScore * 0.3 + spotScore * 0.3 + textureScore * 0.2 + brightnessScore * 0.2)
  );

  return {
    averageSkinTone: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) },
    brightness,
    redness,
    evenness,
    spotsCount: normalizedSpots,
    darkSpotCount: normalizedDarkSpots,
    poreVisibility,
    overallScore,
  };
}
