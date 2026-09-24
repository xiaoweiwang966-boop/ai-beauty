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

type Props = {
  shape: FaceShape;
  description: string;
  analysis: AnalysisResult;
};

export default function FaceShapeCard({ shape, description, analysis }: Props) {
  const gradient = SHAPE_GRADIENTS[shape];

  const dimensions = [
    { label: '面宽', value: analysis.faceWidth, unit: '' },
    { label: '面长', value: analysis.faceLength, unit: '' },
    { label: '眼距', value: analysis.eyeDistance, unit: '' },
    { label: '下颌宽', value: analysis.jawWidth, unit: '' },
    { label: '额头高', value: analysis.foreheadHeight, unit: '' },
  ];

  return (
    <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shrink-0`}
        >
          {SHAPE_ICONS[shape]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">脸型</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            {shape === 'oval' && '鹅蛋脸'}
            {shape === 'round' && '圆脸'}
            {shape === 'square' && '方脸'}
            {shape === 'heart' && '心形脸'}
            {shape === 'long' && '长脸'}
            {shape === 'diamond' && '菱形脸'}
          </h3>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-4 leading-relaxed">{description}</p>

      <div className="grid grid-cols-5 gap-2">
        {dimensions.map((d, i) => (
          <div key={i} className="bg-slate-900/50 rounded-lg p-2 text-center">
            <div className="text-xs text-slate-500 mb-0.5">{d.label}</div>
            <div className="text-xs font-mono text-sky-400">
              {(d.value * 100).toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
