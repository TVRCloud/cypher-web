"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canAccessPath, getFirstAllowedPath } from "@/lib/auth/route-access";

export function RouteAccessGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) return;

    const allowed = canAccessPath(pathname, user.role, permissions);
    if (allowed) return;

    const fallbackPath = getFirstAllowedPath(user.role, permissions);
    if (fallbackPath !== pathname) router.replace(fallbackPath);
  }, [hydrated, pathname, permissions, router, user]);

  return null;
}
