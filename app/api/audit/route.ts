import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { AuditLogModel } from "@/lib/models/audit-log";

export async function GET(req: Request) {
  try {
    await requirePermission("audit.read");
    await connectPrimaryDb();

    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "20") || 20, 1), 100);
    const page = Math.max(Number(url.searchParams.get("page") ?? "0") || 0, 0);
    const action = url.searchParams.get("action");

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;

    const [data, total] = await Promise.all([
      AuditLogModel.find(filter).sort({ createdAt: -1 }).skip(page * limit).limit(limit).lean(),
      AuditLogModel.countDocuments(filter),
    ]);

    return ok({ data, total, totalPages: Math.ceil(total / limit), page, limit });
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch audit log", 400);
  }
}
