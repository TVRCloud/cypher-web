"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedCellProps {
  value: string;
  className?: string;
}

// Always renders the Tooltip — CSS truncation handles the visual,
// tooltip shows the full value on hover regardless of whether text is clipped.
export function TruncatedCell({ value, className }: TruncatedCellProps) {
  const display = value || "—";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("block w-full truncate cursor-default", className)}>
          {display}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs break-all text-xs">
        {display}
      </TooltipContent>
    </Tooltip>
  );
}
