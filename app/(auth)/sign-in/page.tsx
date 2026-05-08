import { AuthForm } from "@/components/auth/auth-form";

export default function SignInPage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-cyan-50 p-4">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="absolute -right-16 bottom-16 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <AuthForm mode="signin" />
    </section>
  );
}
