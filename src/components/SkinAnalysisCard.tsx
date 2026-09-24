import type { SkinAnalysisResult } from '@/types';

type Props = {
  skin: SkinAnalysisResult;
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className="text-[11px] font-mono text-slate-300">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export default function SkinAnalysisCard({ skin }: Props) {
  const toneHex = `#${skin.averageSkinTone.r.toString(16).padStart(2, '0')}${skin.averageSkinTone.g
    .toString(16)
    .padStart(2, '0')}${skin.averageSkinTone.b.toString(16).padStart(2, '0')}`;

  return (
    <div className="wx-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-100">皮肤分析</h3>
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full border border-slate-600"
            style={{ backgroundColor: toneHex }}
          />
          <span className="text-[10px] font-mono text-slate-400">{toneHex}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-300">皮肤综合评分</span>
          <span className="text-base font-bold text-sky-400">{skin.overallScore}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full transition-all duration-700"
            style={{ width: `${skin.overallScore}%` }}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <ScoreBar label="肤色均匀度" value={skin.evenness} color="bg-green-500" />
        <ScoreBar label="肤色亮度" value={skin.brightness} color="bg-sky-500" />
        <ScoreBar label="泛红指数" value={skin.redness} color="bg-rose-500" />
        <ScoreBar label="色斑数量" value={skin.spotsCount} color="bg-amber-500" />
        <ScoreBar label="毛孔可见度" value={skin.poreVisibility} color="bg-purple-500" />
      </div>
    </div>
  );
}
