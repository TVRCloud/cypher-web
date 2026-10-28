import { signUpSchema } from "@/lib/validation/auth";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { signUp } from "@/lib/services/auth-service";
import { isSignupAllowed } from "@/lib/services/signup-policy";
import { getIpFromHeaders, rateLimit } from "@/lib/auth/rate-limit";

const SIGNUP_LIMIT = 5;
const SIGNUP_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const ip = getIpFromHeaders((name) => req.headers.get(name));
    const limited = rateLimit(`signup:${ip}`, SIGNUP_LIMIT, SIGNUP_WINDOW_MS);
    if (!limited.allowed) {
      const res = fail("Too many sign-up attempts. Try again later.", 429);
      res.headers.set("Retry-After", String(limited.retryAfterSec));
      return res;
    }

    if (!(await isSignupAllowed())) return fail("Sign-up is disabled", 403);

    const body = await req.json();
    const parsed = signUpSchema.parse(body);
    const user = await signUp(parsed);
    return ok(user, 201);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to sign up", 400);
  }
}
