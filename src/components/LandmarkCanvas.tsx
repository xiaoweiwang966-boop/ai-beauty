import { useEffect, useRef } from 'react';
import type { Landmark } from '@/types';

type Props = {
  imageUrl: string;
  landmarks: Landmark[];
  showMesh: boolean;
};

// Key facial contour indices for overlay drawing
const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33];
const RIGHT_EYE = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263];

const LEFT_BROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46, 70];
const RIGHT_BROW = [336, 296, 334, 293, 300, 285, 295, 282, 283, 276, 336];

const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61];
const LIPS_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78];

const NOSE = [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 98, 327, 326, 327];

export default function LandmarkCanvas({ imageUrl, landmarks, showMesh }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
    img.src = imageUrl;

    function drawCanvas() {
      if (!canvas || !imgRef.current) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = imgRef.current.naturalWidth;
      const h = imgRef.current.naturalHeight;
      const maxW = 600;
      const scale = w > maxW ? maxW / w : 1;
      canvas.width = w * scale;
      canvas.height = h * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

      if (landmarks.length === 0) return;

      const px = (lm: Landmark) => lm.x * canvas.width;
      const py = (lm: Landmark) => lm.y * canvas.height;

      // Draw mesh points
      if (showMesh) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        for (const lm of landmarks) {
          ctx.beginPath();
          ctx.arc(px(lm), py(lm), 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw contour lines
      const drawContour = (indices: number[], color: string, lineWidth: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        for (let i = 0; i < indices.length; i++) {
          const lm = landmarks[indices[i]];
          if (!lm) continue;
          if (i === 0) ctx.moveTo(px(lm), py(lm));
          else ctx.lineTo(px(lm), py(lm));
        }
        ctx.stroke();
      };

      drawContour(FACE_OVAL, 'rgba(14, 165, 233, 0.9)', 1.5);
      drawContour(LEFT_EYE, 'rgba(20, 184, 166, 0.9)', 1.2);
      drawContour(RIGHT_EYE, 'rgba(20, 184, 166, 0.9)', 1.2);
      drawContour(LEFT_BROW, 'rgba(245, 158, 11, 0.9)', 1.2);
      drawContour(RIGHT_BROW, 'rgba(245, 158, 11, 0.9)', 1.2);
      drawContour(LIPS_OUTER, 'rgba(239, 68, 68, 0.9)', 1.2);
      drawContour(LIPS_INNER, 'rgba(239, 68, 68, 0.6)', 0.8);
      drawContour(NOSE, 'rgba(168, 85, 247, 0.8)', 1);

      // Draw key measurement points
      const keyPoints = [
        { idx: 234, color: '#0ea5e9', label: 'L颧骨' },
        { idx: 454, color: '#0ea5e9', label: 'R颧骨' },
        { idx: 10, color: '#f59e0b', label: '额顶' },
        { idx: 152, color: '#f59e0b', label: '下巴' },
        { idx: 1, color: '#a855f7', label: '鼻尖' },
      ];

      for (const kp of keyPoints) {
        const lm = landmarks[kp.idx];
        if (!lm) continue;
        ctx.fillStyle = kp.color;
        ctx.beginPath();
        ctx.arc(px(lm), py(lm), 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawCanvas();
  }, [imageUrl, landmarks, showMesh]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-700">
      <canvas ref={canvasRef} className="w-full h-auto block" />
    </div>
  );
}
