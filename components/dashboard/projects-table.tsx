import { MoreVertical } from "lucide-react";

const projects = [
  {
    name: "Chakra Soft UI Version",
    initials: "Xd",
    color: "#E91E8C",
    members: 5,
    budget: "$14,000",
    completion: 60,
    barColor: "#4299e1",
  },
  {
    name: "Add Progress Track",
    initials: "▲",
    color: "#4CAF50",
    members: 2,
    budget: "$3,000",
    completion: 10,
    barColor: "#4299e1",
  },
  {
    name: "Fix Platform Errors",
    initials: "✦",
    color: "#FF9800",
    members: 2,
    budget: "Not set",
    completion: 100,
    barColor: "#4299e1",
  },
  {
    name: "Launch our Mobile App",
    initials: "♪",
    color: "#4CAF50",
    members: 4,
    budget: "$32,000",
    completion: 100,
    barColor: "#4299e1",
  },
  {
    name: "Add the New Pricing Page",
    initials: "◆",
    color: "#2196F3",
    members: 3,
    budget: "$400",
    completion: 25,
    barColor: "#4299e1",
  },
  {
    name: "Redesign New Online Shop",
    initials: "Ⓑ",
    color: "#E91E8C",
    members: 2,
    budget: "$7,600",
    completion: 40,
    barColor: "#4299e1",
  },
];

function MemberDots({ count }: { count: number }) {
  const colors = ["#4299e1", "#8E54E9", "#ED8936", "#38EF7D", "#E91E8C"];
  return (
    <div className="flex -space-x-1.5">
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <div
          key={i}
          className="w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-[8px] font-bold text-white"
          style={{ backgroundColor: colors[i % colors.length], zIndex: count - i }}
        >
          {String.fromCharCode(65 + i)}
        </div>
      ))}
    </div>
  );
}

export function ProjectsTable() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-card-foreground">Projects</p>
          <p className="text-xs text-emerald-400 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 align-middle" />
            30 done this month
          </p>
        </div>
        <button
          className="text-muted-foreground hover:text-card-foreground transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="border-b border-border/30">
              <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Companies
              </th>
              <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Members
              </th>
              <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Budget
              </th>
              <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Completion
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {projects.map((p) => (
              <tr key={p.name}>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.initials}
                    </div>
                    <span className="font-medium text-card-foreground text-[13px] leading-tight">
                      {p.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <MemberDots count={p.members} />
                </td>
                <td className="py-3 pr-4">
                  <span className="text-[13px] text-card-foreground font-medium">
                    {p.budget}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[13px] font-semibold"
                      style={{
                        color: p.completion === 100 ? "#38EF7D" : "#4299e1",
                      }}
                    >
                      {p.completion}%
                    </span>
                    <div className="flex-1 h-1.5 bg-border/30 rounded-full min-w-[60px]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${p.completion}%`,
                          background:
                            p.completion === 100
                              ? "linear-gradient(90deg, #11998E, #38EF7D)"
                              : "linear-gradient(90deg, #4776E6, #4299e1)",
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
