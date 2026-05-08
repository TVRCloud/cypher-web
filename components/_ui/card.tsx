/**
 * _ui/card — themed card variants on top of shadcn Card.
 * Never modify components/ui/card.tsx; extend here instead.
 */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/_ui/card";
import { cn } from "@/lib/utils";

/** Standard dashboard section card — consistent border + bg. */
export function DashCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <Card
      className={cn("border-border/50 bg-card shadow-none", className)}
      {...props}
    />
  );
}

/**
 * Glass card for dark surfaces (auth pages, modals on dark backgrounds).
 * Expects to be placed on a dark bg — uses translucent white for the fill.
 */
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

export { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter };
