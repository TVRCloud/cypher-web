/**
 * _ui/form-field — labelled input wrapper with inline error display.
 * Two variants: FormField (adapts to theme) and GlassFormField (dark surface).
 */
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Theme-aware form field — label + input slot + error text. */
export function FormField({
  id,
  label,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

/**
 * Glass-surface form field — white-tinted label + error, for use on dark
 * translucent backgrounds (auth screens).
 */
export function GlassFormField({
  id,
  label,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-white/55 text-sm font-medium">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
