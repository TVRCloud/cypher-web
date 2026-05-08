"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import {
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// Keep standard shadcn exports available through _ui as compatibility layer.
export { TabsList, TabsTrigger, TabsContent };
export const Tabs = TabsPrimitive.Root;

export function AnimatedTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "relative inline-flex h-9 items-center gap-0.5 rounded-full bg-muted p-1",
        className
      )}
      {...props}
    />
  );
}

export function AnimatedTabsTrigger({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setActive(el.dataset.state === "active");
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["data-state"] });
    return () => obs.disconnect();
  }, []);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-medium whitespace-nowrap",
        "text-muted-foreground hover:text-foreground transition-colors",
        "data-[state=active]:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <AnimatePresence initial={false}>
        {active && (
          <motion.span
            layoutId="tab-pill"
            className="absolute inset-0 rounded-full bg-background shadow-sm"
            transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
          />
        )}
      </AnimatePresence>
      <span className="relative">{children}</span>
    </TabsPrimitive.Trigger>
  );
}
