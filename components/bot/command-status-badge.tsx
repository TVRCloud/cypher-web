import { Badge } from "@/components/ui/badge";
import type { AdminCommand } from "@/hooks/use-admin-commands";

const VARIANT: Record<AdminCommand["status"], "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  processing: "secondary",
  done: "default",
  failed: "destructive",
};

export function CommandStatusBadge({ status }: { status: AdminCommand["status"] }) {
  return <Badge variant={VARIANT[status] ?? "outline"}>{status}</Badge>;
}
