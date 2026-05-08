import { headers } from "next/headers";

export async function getClientMeta() {
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") ?? "unknown";
  const forwardedFor = headerList.get("x-forwarded-for") ?? "unknown";
  const ip = forwardedFor.split(",")[0]?.trim() ?? "unknown";

  return {
    userAgent,
    ip,
    device: userAgent,
  };
}
