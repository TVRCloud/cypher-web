/**
 * _ui/badge — themed badge variants on top of shadcn Badge.
 * Never modify components/ui/badge.tsx; extend here instead.
 */
import { Badge, badgeVariants } from "@/components/_ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "active" | "pending" | "done" | "error" | "warning";

const statusMap: Record<StatusVariant, string> = {
  active:  "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  pending: "bg-amber-400/10   text-amber-400   border-amber-400/20",
  done:    "bg-blue-400/10    text-blue-400    border-blue-400/20",
  error:   "bg-red-400/10     text-red-400     border-red-400/20",
  warning: "bg-orange-400/10  text-orange-400  border-orange-400/20",
};

interface StatusBadgeProps {
  status: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

/** Semantic status badge with auto colour. */
export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusMap[status], "font-medium", className)}
    >
      {children}
    </Badge>
  );
}

export { Badge, badgeVariants };
