import type { ReactNode } from 'react';
import { Home, FileText, User, Minus, Circle, X } from 'lucide-react';
import WeChatStatusBar from './WeChatStatusBar';

export type TabKey = 'home' | 'report' | 'profile';

type Props = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  navTitle: string;
  showBack?: boolean;
  onBack?: () => void;
  children: ReactNode;
  hasNotch?: boolean;
};

const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'report', label: '报告', icon: FileText },
  { key: 'profile', label: '我的', icon: User },
];

export default function WeChatShell({
  activeTab,
  onTabChange,
  navTitle,
  showBack,
  onBack,
  children,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-0 sm:py-6">
      {/* Phone frame */}
      <div className="relative w-full sm:w-[390px] h-screen sm:h-[844px] sm:rounded-[44px] bg-[#0a0f1e] sm:border-[10px] sm:border-slate-950 sm:shadow-2xl overflow-hidden flex flex-col">
        {/* Ambient background glow */}
        <div className="fixed sm:absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.4) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-20 right-0 w-60 h-60 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.4) 0%, transparent 70%)' }}
          />
        </div>

        {/* Status bar */}
        <div className="relative z-10 bg-gradient-to-b from-slate-900 to-transparent">
          <WeChatStatusBar />
        </div>

        {/* WeChat nav bar with capsule */}
        <div className="relative z-10 flex items-center justify-between px-4 h-11 shrink-0">
          <div className="flex items-center gap-2 w-[88px]">
            {showBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-slate-300 text-sm hover:text-white transition-colors"
              >
                <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                  <path d="M8 1L2 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>返回</span>
              </button>
            )}
          </div>
          <h1 className="text-[17px] font-medium text-slate-100 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            {navTitle}
          </h1>
          {/* WeChat capsule button */}
          <div className="flex items-center gap-2 w-[88px] justify-end">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/15 bg-white/5">
              <Minus className="w-3.5 h-3.5 text-white/60" />
              <div className="w-px h-3 bg-white/15" />
              <Circle className="w-2.5 h-2.5 text-white/60 fill-white/20" />
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        {/* Bottom TabBar */}
        <div className="relative z-10 shrink-0 bg-[#0d1220]/95 backdrop-blur-lg border-t border-white/5">
          <div className="flex items-stretch h-[52px] pb-[env(safe-area-inset-bottom)]">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    isActive ? 'text-sky-400' : 'text-slate-500'
                  }`}
                >
                  <tab.icon
                    className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
          {/* Home indicator */}
          <div className="flex justify-center pb-1">
            <div className="w-32 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
