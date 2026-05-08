import { signUpSchema } from "@/lib/validation/auth";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { signUp } from "@/lib/services/auth-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.parse(body);
    const user = await signUp(parsed);
    return ok(user, 201);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to sign up", 400);
  }
}
