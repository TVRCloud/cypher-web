export const publicRoutes: string[] = [];

export const authRoutes = ["/sign-in", "/sign-up"];

export const protectedRoutePrefixes = ["/"];

export const adminRoutePrefixes = ["/dashboard/admin", "/api/admin"];

export const publicApiRoutes = [
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/[...nextauth]",
  "/api/ping",
];

export function isAuthRoute(pathname: string) {
  return authRoutes.includes(pathname);
}

export function isPublicRoute(pathname: string) {
  return publicRoutes.includes(pathname);
}

export function isPublicApiRoute(pathname: string) {
  if (pathname === "/api/auth/[...nextauth]") return true;
  if (pathname.startsWith("/api/auth/")) {
    return (
      pathname === "/api/auth/signin" ||
      pathname === "/api/auth/signup" ||
      pathname === "/api/auth/refresh"
    );
  }

  return publicApiRoutes.includes(pathname);
}

export function isAdminRoute(pathname: string) {
  return adminRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function isProtectedRoute(pathname: string) {
  if (isPublicRoute(pathname) || isAuthRoute(pathname) || isPublicApiRoute(pathname)) {
    return false;
  }

  return protectedRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
}
