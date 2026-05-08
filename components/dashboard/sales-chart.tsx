const salesData = [
  { month: "Jan", value: 450 },
  { month: "Feb", value: 88 },
  { month: "Mar", value: 175 },
  { month: "Apr", value: 220 },
  { month: "May", value: 265 },
  { month: "Jun", value: 375 },
  { month: "Jul", value: 325 },
  { month: "Aug", value: 430 },
  { month: "Sep", value: 375 },
  { month: "Oct", value: 415 },
  { month: "Nov", value: 468 },
  { month: "Dec", value: 455 },
];

const W = 640;
const H = 240;
const PL = 46;
const PR = 16;
const PT = 16;
const PB = 40;
const MAX = 500;

function pts() {
  const cw = W - PL - PR;
  const ch = H - PT - PB;
  return salesData.map((d, i) => ({
    x: PL + (i / (salesData.length - 1)) * cw,
    y: PT + ch - (d.value / MAX) * ch,
    month: d.month,
  }));
}

function smoothPath(points: { x: number; y: number }[]): string {
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const mid = (points[i].x + points[i + 1].x) / 2;
    d += ` C ${mid.toFixed(2)} ${points[i].y.toFixed(2)}, ${mid.toFixed(2)} ${points[i + 1].y.toFixed(2)}, ${points[i + 1].x.toFixed(2)} ${points[i + 1].y.toFixed(2)}`;
  }
  return d;
}

export function SalesChart() {
  const points = pts();
  const ch = H - PT - PB;
  const baseline = PT + ch;
  const line = smoothPath(points);
  const area =
    line +
    ` L ${points[points.length - 1].x.toFixed(2)} ${baseline} L ${points[0].x.toFixed(2)} ${baseline} Z`;

  const yTicks = [0, 100, 200, 300, 400, 500];

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <p className="text-sm font-bold text-card-foreground">Sales overview</p>
      <p className="text-xs text-emerald-400 mt-0.5">
        <span className="font-bold">(+5)</span> more in 2021
      </p>

      <div className="mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 220 }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4299e1" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#4299e1" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#4299e1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4299e1" />
              <stop offset="100%" stopColor="#38EF7D" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {yTicks.map((v) => {
            const y = PT + (H - PT - PB) - (v / MAX) * (H - PT - PB);
            return (
              <g key={v}>
                <line
                  x1={PL}
                  x2={W - PR}
                  y1={y}
                  y2={y}
                  stroke="rgba(148,163,184,0.08)"
                  strokeWidth="1"
                />
                <text
                  x={PL - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  style={{ fill: "var(--muted-foreground)" }}
                >
                  {v}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={area} fill="url(#areaFill)" />

          {/* Line */}
          <path
            d={line}
            fill="none"
            stroke="url(#lineStroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-axis labels */}
          {points.map((p) => (
            <text
              key={p.month}
              x={p.x}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              style={{ fill: "var(--muted-foreground)" }}
            >
              {p.month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
