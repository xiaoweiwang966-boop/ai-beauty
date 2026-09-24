import type { FaceShape, AnalysisResult } from '@/types';

const SHAPE_ICONS: Record<FaceShape, string> = {
  oval: '🥚',
  round: '⭕',
  square: '⬛',
  heart: '💛',
  long: '📐',
  diamond: '💎',
};

const SHAPE_GRADIENTS: Record<FaceShape, string> = {
  oval: 'from-sky-500 to-teal-500',
  round: 'from-teal-500 to-green-500',
  square: 'from-amber-500 to-orange-500',
  heart: 'from-rose-500 to-pink-500',
  long: 'from-indigo-500 to-sky-500',
  diamond: 'from-cyan-500 to-blue-500',
};

const SHAPE_LABELS: Record<FaceShape, string> = {
  oval: '鹅蛋脸',
  round: '圆脸',
  square: '方脸',
  heart: '心形脸',
  long: '长脸',
  diamond: '菱形脸',
};

type Props = {
  shape: FaceShape;
  description: string;
  analysis: AnalysisResult;
};

export default function FaceShapeCard({ shape, description, analysis }: Props) {
  const gradient = SHAPE_GRADIENTS[shape];

  const dimensions = [
    { label: '面宽', value: analysis.faceWidth },
    { label: '面长', value: analysis.faceLength },
    { label: '眼距', value: analysis.eyeDistance },
    { label: '下颌', value: analysis.jawWidth },
    { label: '额头', value: analysis.foreheadHeight },
  ];

  return (
    <div className="wx-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shrink-0`}
        >
          {SHAPE_ICONS[shape]}
        </div>
        <div className="flex-1">
          <span className="text-[10px] text-slate-500">脸型分析</span>
          <h3 className="text-base font-bold text-slate-100">
            {SHAPE_LABELS[shape]}
          </h3>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{description}</p>

      <div className="grid grid-cols-5 gap-1.5">
        {dimensions.map((d, i) => (
          <div key={i} className="bg-slate-900/40 rounded-lg py-1.5 text-center">
            <div className="text-[10px] text-slate-500">{d.label}</div>
            <div className="text-[10px] font-mono text-sky-400">
              {(d.value * 100).toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
