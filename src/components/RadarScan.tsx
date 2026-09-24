type Props = {
  size?: number;
};

// Predefined blip positions on the radar (relative 0-1 coords within the circle)
const BLIPS = [
  { x: 0.32, y: 0.28, delay: '0s' },
  { x: 0.68, y: 0.22, delay: '0.5s' },
  { x: 0.75, y: 0.55, delay: '1s' },
  { x: 0.25, y: 0.62, delay: '1.5s' },
  { x: 0.52, y: 0.18, delay: '0.8s' },
  { x: 0.48, y: 0.72, delay: '2s' },
  { x: 0.6, y: 0.45, delay: '1.2s' },
  { x: 0.38, y: 0.48, delay: '0.3s' },
];

export default function RadarScan({ size = 200 }: Props) {
  const half = size / 2;

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full glow-pulse"
        style={{
          background:
            'radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(14,165,233,0) 70%)',
        }}
      />

      {/* Pulse rings */}
      <div
        className="absolute inset-0 rounded-full border border-sky-500/20 radar-pulse-ring"
      />
      <div
        className="absolute inset-0 rounded-full border border-sky-500/15 radar-pulse-ring"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute inset-0 rounded-full border border-sky-500/10 radar-pulse-ring"
        style={{ animationDelay: '2s' }}
      />

      {/* Radar grid circles */}
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#0a0f1e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0a0f1e" stopOpacity="0.9" />
          </radialGradient>
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Background fill */}
        <circle cx={half} cy={half} r={half - 1} fill="url(#radarBg)" />

        {/* Grid circles */}
        {[0.3, 0.55, 0.8].map((r, i) => (
          <circle
            key={i}
            cx={half}
            cy={half}
            r={half * r}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.5"
            strokeOpacity="0.2"
          />
        ))}

        {/* Cross lines */}
        <line x1={half} y1="2" x2={half} y2={size - 2} stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.15" />
        <line x1="2" y1={half} x2={size - 2} y2={half} stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.15" />

        {/* Diagonal lines */}
        <line x1={half * 0.15} y1={half * 0.15} x2={size - half * 0.15} y2={size - half * 0.15} stroke="#38bdf8" strokeWidth="0.3" strokeOpacity="0.1" />
        <line x1={size - half * 0.15} y1={half * 0.15} x2={half * 0.15} y2={size - half * 0.15} stroke="#38bdf8" strokeWidth="0.3" strokeOpacity="0.1" />

        {/* Sweep cone */}
        <g className="radar-sweep" style={{ transformOrigin: `${half}px ${half}px` }}>
          <path
            d={`M ${half} ${half} L ${half} 2 A ${half - 2} ${half - 2} 0 0 1 ${size - 2} ${half} Z`}
            fill="url(#sweepGrad)"
          />
          <line
            x1={half}
            y1={half}
            x2={half}
            y2="2"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
        </g>

        {/* Center dot */}
        <circle cx={half} cy={half} r="3" fill="#38bdf8" fillOpacity="0.8" />
        <circle cx={half} cy={half} r="6" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.3" />

        {/* Blips */}
        {BLIPS.map((blip, i) => (
          <g key={i} className="radar-blip" style={{ animationDelay: blip.delay }}>
            <circle
              cx={blip.x * size}
              cy={blip.y * size}
              r="2"
              fill="#22d3ee"
              fillOpacity="0.9"
            />
            <circle
              cx={blip.x * size}
              cy={blip.y * size}
              r="4"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
