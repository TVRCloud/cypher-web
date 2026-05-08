/**
 * _ui/button — extends shadcn Button with a `gradient` prop.
 * Never modify components/ui/button.tsx; extend here instead.
 */
import { Button, buttonVariants } from "@/components/_ui/button";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";

export interface AppButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Applies the brand blue-purple gradient instead of the default primary. */
  gradient?: boolean;
}

export function AppButton({ gradient, className, ...props }: AppButtonProps) {
  return (
    <Button
      className={cn(
        gradient && [
          "border-0 text-white font-semibold tracking-wide",
          "bg-gradient-to-r from-[#4776E6] to-[#8E54E9]",
          "hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/20",
          "active:opacity-95 transition-all duration-200",
        ].join(" "),
        className
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
