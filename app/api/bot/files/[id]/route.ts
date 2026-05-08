import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotFileModel } from "@/lib/bot/models/file";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("analytics.read");
    const { id } = await params;

    const FileModel = await getBotFileModel();
    const [result] = await FileModel.aggregate([
      { $match: { _id: id } },
      { $limit: 1 },
    ]);

    if (!result) return fail("File not found", 404);
    return ok(result);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch file", 400);
  }
}
