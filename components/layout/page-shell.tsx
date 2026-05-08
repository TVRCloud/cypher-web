"use client";

import { AnimatePresence, motion } from "framer-motion";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex-1"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
