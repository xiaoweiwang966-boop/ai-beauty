import { useEffect, useState } from 'react';

export default function WeChatStatusBar() {
  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between px-5 py-2 text-white text-sm font-medium select-none">
      <span className="tracking-wide">{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="white" fillOpacity="0.9" />
          <rect x="5" y="5" width="3" height="7" rx="0.5" fill="white" fillOpacity="0.9" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="0.5" fill="white" fillOpacity="0.9" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill="white" fillOpacity="0.9" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 2C5.2 2 2.6 3 0.6 4.8L2 6.2C3.6 4.8 5.7 4 8 4C10.3 4 12.4 4.8 14 6.2L15.4 4.8C13.4 3 10.8 2 8 2Z" fill="white" fillOpacity="0.9" />
          <path d="M8 6C6.3 6 4.7 6.6 3.5 7.7L4.9 9.1C5.7 8.4 6.8 8 8 8C9.2 8 10.3 8.4 11.1 9.1L12.5 7.7C11.3 6.6 9.7 6 8 6Z" fill="white" fillOpacity="0.9" />
          <circle cx="8" cy="11" r="1" fill="white" fillOpacity="0.9" />
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-0.5">
          <div className="relative w-6 h-3 rounded-[3px] border border-white/40 flex items-center px-[1px]">
            <div className="h-full w-[80%] bg-white/90 rounded-[1px]" />
          </div>
          <div className="w-0.5 h-1.5 bg-white/40 rounded-r-sm" />
        </div>
      </div>
    </div>
  );
}

function formatTime(): string {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
