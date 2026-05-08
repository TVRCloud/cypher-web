const barData = [
  { label: "M", value: 160 },
  { label: "T", value: 230 },
  { label: "W", value: 310 },
  { label: "T", value: 250 },
  { label: "F", value: 375 },
  { label: "S", value: 420 },
  { label: "S", value: 355 },
  { label: "M", value: 448 },
  { label: "T", value: 285 },
  { label: "W", value: 395 },
];

const stats = [
  { label: "Users", value: "32,984", color: "#4299e1" },
  { label: "Clicks", value: "2.42m", color: "#8E54E9" },
  { label: "Sales", value: "2,400$", color: "#ED8936" },
  { label: "Items", value: "320", color: "#38EF7D" },
];

const W = 320;
const H = 160;
const PL = 8;
const PR = 8;
const PT = 8;
const PB = 8;
const MAX = 500;

export function ActiveUsersChart() {
  const cw = W - PL - PR;
  const ch = H - PT - PB;
  const count = barData.length;
  const slotW = cw / count;
  const barW = slotW * 0.45;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col h-full">
      {/* SVG bar chart */}
      <div className="w-full overflow-hidden mb-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 130 }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
            </linearGradient>
          </defs>

          {barData.map((d, i) => {
            const bh = (d.value / MAX) * ch;
            const x = PL + i * slotW + (slotW - barW) / 2;
            const y = PT + ch - bh;
            return (
              <rect
                key={i}
                x={x.toFixed(2)}
                y={y.toFixed(2)}
                width={barW.toFixed(2)}
                height={bh.toFixed(2)}
                rx="3"
                style={{ fill: "var(--primary)", opacity: 0.85 }}
              />
            );
          })}
        </svg>
      </div>

      {/* Label */}
      <div className="mb-3">
        <p className="text-sm font-bold text-card-foreground">Active Users</p>
        <p className="text-xs text-emerald-400">(+23) than last week</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2 border-t border-border/30 pt-3 mt-auto">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-1">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: color + "22" }}
            >
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className="text-[13px] font-bold text-card-foreground">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
