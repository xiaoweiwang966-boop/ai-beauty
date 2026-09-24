import type { Recommendation } from '@/types';
import { Scissors, Sparkles, Palette } from 'lucide-react';

const ICON_MAP: Record<string, typeof Scissors> = {
  scissors: Scissors,
  sparkles: Sparkles,
  palette: Palette,
};

const CATEGORY_COLORS: Record<string, string> = {
  '发型': 'from-sky-500 to-blue-500',
  '护肤': 'from-teal-500 to-green-500',
  '妆容': 'from-amber-500 to-orange-500',
};

type Props = {
  recommendations: Recommendation[];
};

export default function RecommendationsCard({ recommendations }: Props) {
  return (
    <div className="wx-card p-4">
      <h3 className="text-sm font-medium text-slate-100 mb-3">个性化推荐</h3>
      <div className="space-y-2.5">
        {recommendations.map((rec, i) => {
          const Icon = ICON_MAP[rec.icon] ?? Sparkles;
          const gradient = CATEGORY_COLORS[rec.category] ?? 'from-slate-500 to-slate-600';
          return (
            <div
              key={i}
              className="bg-slate-900/40 rounded-xl p-3 transition-all active:scale-[0.98]"
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {rec.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-100 mb-0.5">{rec.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{rec.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
