/**
 * Glass card for dark surfaces (auth pages, modals on dark backgrounds).
 * Expects to be placed on a dark bg — uses translucent white for the fill.
 */
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Card
      className={cn(
        "border-white/10 bg-white/[0.04] backdrop-blur-2xl",
        "shadow-2xl shadow-black/30",
        className
      )}
      {...props}
    />
  );
}
