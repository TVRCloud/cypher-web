/**
 * _ui/input — themed input variants on top of shadcn Input.
 * Never modify components/ui/input.tsx; extend here instead.
 */
import { Input } from "@/components/_ui/input";
import { cn } from "@/lib/utils";

/**
 * Glass input — for auth / dark-surface forms.
 * White text, translucent background, blue focus ring.
 */
export function GlassInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      className={cn(
        "h-11 bg-white/5 border-white/10 text-white",
        "placeholder:text-white/25",
        "focus-visible:border-[#4776E6]/70 focus-visible:ring-[#4776E6]/20",
        "transition-colors duration-150",
        className
      )}
      {...props}
    />
  );
}

export { Input };
