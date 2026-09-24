import type { RatioMetric } from '@/types';

type Props = {
  metrics: RatioMetric[];
  overallScore: number;
};

export default function RatioMetrics({ metrics, overallScore }: Props) {
  return (
    <div className="wx-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-slate-100">黄金比例分析</h3>
          <p className="text-[10px] text-slate-500">8项面部比例 vs 1.618</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-sky-400">{overallScore}</div>
          <div className="text-[10px] text-slate-500">综合评分</div>
        </div>
      </div>

      <div className="space-y-2">
        {metrics.map((m, i) => {
          const closeness = Math.max(0, 1 - m.deviation);
          const barColor =
            closeness > 0.85
              ? 'bg-green-500'
              : closeness > 0.65
              ? 'bg-yellow-500'
              : 'bg-red-500';
          return (
            <div key={i} className="bg-slate-900/40 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-200">{m.name}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {m.value.toFixed(2)} <span className="text-slate-600">/ {m.goldenRatio.toFixed(2)}</span>
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${closeness * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
