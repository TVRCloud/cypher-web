import { requireAuth } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";

export async function GET() {
  try {
    const user = await requireAuth();
    return ok({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      permissions: user.permissions ?? [],
    });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to load auth session", 400);
  }
}
