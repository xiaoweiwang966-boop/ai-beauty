import type { RatioMetric } from '@/types';

type Props = {
  metrics: RatioMetric[];
  overallScore: number;
};

export default function RatioMetrics({ metrics, overallScore }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-medium text-slate-100">黄金比例分析</h3>
          <p className="text-xs text-slate-400">基于468个面部关键点的真实比例计算</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-sky-400">{overallScore}</div>
          <div className="text-xs text-slate-500">综合评分</div>
        </div>
      </div>

      <div className="space-y-2.5">
        {metrics.map((m, i) => {
          const closeness = Math.max(0, 1 - m.deviation);
          const barColor =
            closeness > 0.85
              ? 'bg-green-500'
              : closeness > 0.65
              ? 'bg-yellow-500'
              : 'bg-red-500';
          return (
            <div
              key={i}
              className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 hover:border-slate-600 transition-colors"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-200">{m.name}</span>
                <span className="text-xs font-mono text-slate-400">
                  {m.value.toFixed(3)} <span className="text-slate-600">/ {m.goldenRatio.toFixed(3)}</span>
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${closeness * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{m.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
