"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { getSession } from "next-auth/react";

import { GlassCard, CardContent } from "@/components/_ui/card";
import { GlassInput } from "@/components/_ui/input";
import { GlassFormField } from "@/components/_ui/form-field";
import { AppButton } from "@/components/_ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof formSchema>;

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignIn = mode === "signin";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    try {
      if (!isSignIn) {
        // Create the account first, then sign in via NextAuth
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const data = (await res.json()) as { message?: string };
          throw new Error(data.message ?? "Sign up failed");
        }
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) throw new Error("Invalid email or password");

      // Sync permissions into Zustand store
      const session = await getSession();
      if (session?.user) {
        setAuth({
          user: { id: session.user.id, email: session.user.email ?? "", role: session.user.role },
          permissions: session.user.permissions ?? [],
        });
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-105"
    >
      <GlassCard>
        <CardContent className="p-8 space-y-7">
          {/* Mobile-only logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
              style={{
                background: "linear-gradient(97.89deg, #4776E6 0%, #8E54E9 100%)",
              }}
            >
              ◈
            </div>
            <span className="text-white font-bold text-sm tracking-widest uppercase">
              Cypher Admin
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isSignIn ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-white/40">
              {isSignIn
                ? "Sign in to access your dashboard."
                : "Get started with your admin workspace."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <GlassFormField
              id="email"
              label="Email address"
              error={errors.email?.message}
            >
              <GlassInput
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                {...register("email")}
              />
            </GlassFormField>

            <GlassFormField
              id="password"
              label="Password"
              error={errors.password?.message}
            >
              <GlassInput
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                {...register("password")}
              />
            </GlassFormField>

            {isSignIn && (
              <div className="flex justify-end -mt-1">
                <Link
                  href="#"
                  className="text-xs text-white/35 hover:text-white/60 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5"
                >
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AppButton
              gradient
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  Processing…
                </span>
              ) : isSignIn ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </AppButton>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/25">or continue with</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Switch */}
          <p className="text-sm text-white/35 text-center">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              href={isSignIn ? "/sign-up" : "/sign-in"}
              className="text-white/70 font-semibold hover:text-white transition-colors"
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </Link>
          </p>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
}
