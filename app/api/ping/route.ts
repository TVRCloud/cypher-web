import { ok } from "@/lib/http/response";

export async function GET() {
  return ok({ status: "ok" });
}
