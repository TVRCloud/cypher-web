"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@/validation/auth";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/providers/access-token-provider";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { publicClient } from "@/utils/axios";

export default function LoginPage() {
  const router = useRouter();
  const { setAccessToken } = useAuth();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const signInMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await publicClient.post("/api/auth/login", data);
      return res.data;
    },

    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      router.push("/");
    },
  });

  const onSubmit = async (data: LoginInput) => {
    signInMutation.mutate(data);
  };

  return (
    <main>
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        {/* animation */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        {/* grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md backdrop-blur-md bg-white/5 border border-white/10 shadow-xl rounded-2xl animate-fade-in">
          <CardHeader className="space-y-1 text-white">
            <CardTitle className="text-3xl font-extrabold text-center tracking-tight">
              Welcome to CYPHER
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Secure Admin Panel Access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="admin@example.com"
                          required
                          className="bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          required
                          className="bg-gray-900 text-white placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
                >
                  Sign In
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-400 hover:text-blue-500 font-medium"
              >
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
