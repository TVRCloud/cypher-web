import { AuthForm } from "@/components/auth/auth-form";

export default function SignUpPage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4">
      <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
      <AuthForm mode="signup" />
    </section>
  );
}
