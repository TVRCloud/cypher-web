import { signInSchema } from "@/lib/validation/auth";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { getClientMeta } from "@/lib/auth/request";
import { signIn } from "@/lib/services/auth-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signInSchema.parse(body);
    const result = await signIn(parsed, await getClientMeta());
    return ok(result);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to sign in", 400);
  }
}
