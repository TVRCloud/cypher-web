import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { isSignupAllowed } from "@/lib/services/signup-policy";

export const metadata = { title: "Sign Up — Cypher Admin" };
export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  let allowed = false;
  try {
    allowed = await isSignupAllowed();
  } catch {
    // DB unavailable: fail closed
  }

  if (!allowed) {
    return (
      <div className="w-full max-w-105 space-y-3 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Sign-up is disabled</h2>
        <p className="text-sm text-white/40">
          New accounts are created by an administrator. Ask one to invite you.
        </p>
        <Link href="/sign-in" className="text-sm text-white/70 font-semibold hover:text-white transition-colors">
          Back to sign in
        </Link>
      </div>
    );
  }

  return <AuthForm mode="signup" />;
}
