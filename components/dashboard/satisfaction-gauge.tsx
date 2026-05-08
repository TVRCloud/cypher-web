interface SatisfactionGaugeProps {
  value?: number;
}

export function SatisfactionGauge({ value = 95 }: SatisfactionGaugeProps) {
  // Semicircle: path M 14 96 A 82 82 0 0 1 186 96
  // Arc length = π × 82 ≈ 257.6
  const r = 82;
  const arcLen = Math.PI * r;
  const filled = (value / 100) * arcLen;
  const offset = arcLen - filled;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col h-full">
      <p className="text-sm font-bold text-card-foreground">Satisfaction Rate</p>
      <p className="text-xs text-muted-foreground mt-0.5">From all projects</p>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Gauge */}
        <div className="relative w-full flex justify-center">
          <svg
            viewBox="0 0 200 108"
            className="w-full max-w-[230px]"
            aria-label={`Satisfaction rate: ${value}%`}
          >
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4299e1" />
                <stop offset="100%" stopColor="#38EF7D" />
              </linearGradient>
            </defs>

            {/* Track */}
            <path
              d={`M 14 96 A ${r} ${r} 0 0 1 186 96`}
              fill="none"
              stroke="rgba(148,163,184,0.15)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Progress */}
            <path
              d={`M 14 96 A ${r} ${r} 0 0 1 186 96`}
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={arcLen}
              strokeDashoffset={offset}
            />

            {/* Icon at apex */}
            <circle cx="100" cy="18" r="16" fill="rgba(66,153,225,0.12)" />
            {/* Eyes */}
            <circle cx="95.5" cy="15" r="2" fill="#4299e1" />
            <circle cx="104.5" cy="15" r="2" fill="#4299e1" />
            {/* Smile */}
            <path
              d="M 94 21 Q 100 27 106 21"
              stroke="#4299e1"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <span className="absolute bottom-1 left-[12%] text-[11px] text-muted-foreground">
            0%
          </span>
          <span className="absolute bottom-1 right-[12%] text-[11px] text-muted-foreground">
            100%
          </span>
        </div>

        <div className="text-center mt-2">
          <p className="text-3xl font-bold text-card-foreground">{value}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">Based on likes</p>
        </div>
      </div>
    </div>
  );
}
