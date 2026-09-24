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
    <div className="space-y-3">
      <h3 className="text-base font-medium text-slate-100 mb-3">个性化推荐</h3>
      {recommendations.map((rec, i) => {
        const Icon = ICON_MAP[rec.icon] ?? Sparkles;
        const gradient = CATEGORY_COLORS[rec.category] ?? 'from-slate-500 to-slate-600';
        return (
          <div
            key={i}
            className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all hover:translate-x-1"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    {rec.category}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-slate-100 mb-1">{rec.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
