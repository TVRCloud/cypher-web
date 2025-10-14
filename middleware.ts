import { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/users",
  "/files",
  "/feedback",
  "/settings",
];
const adminRoutes = [
  "/dashboard",
  "/users",
  "/files",
  "/feedback",
  "/settings",
];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.includes(path);
}
