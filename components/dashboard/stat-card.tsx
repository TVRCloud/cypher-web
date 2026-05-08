import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: LucideIcon;
}

export function StatCard({
  label,
  value,
  change,
  positive = true,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="relative flex items-start justify-between gap-3 rounded-2xl border border-border/50 bg-card p-5 overflow-hidden">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest truncate">
          {label}
        </p>
        <p className="text-2xl font-bold text-card-foreground mt-1 leading-none">
          {value}
        </p>
        <p
          className={cn(
            "text-xs font-semibold mt-1.5",
            positive ? "text-emerald-400" : "text-red-400"
          )}
        >
          {change}
        </p>
      </div>

      <div
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{
          background: "linear-gradient(97.89deg, #4776E6 0%, #0099F7 100%)",
        }}
      >
        <Icon size={18} className="text-white" />
      </div>
    </div>
  );
}
