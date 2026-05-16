import { ok, fail } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requireAuth } from "@/lib/auth/guards";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { SiteSettingsModel } from "@/lib/models/site-settings";

async function getSettings() {
  await connectPrimaryDb();
  const doc = await SiteSettingsModel.findOne({}).lean();
  if (!doc) {
    // Return defaults without persisting
    return {
      siteName: "Cypher Admin",
      siteDescription: "",
      siteUrl: "",
      maintenanceMode: false,
      twoFactorRequired: false,
      auditLogging: true,
      emailNotifications: true,
      sessionAlerts: true,
      defaultTheme: "system",
    };
  }
  return doc;
}

export async function GET() {
  try {
    await requireAuth();
    const settings = await getSettings();
    return ok(settings);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode);
    return fail("Failed to load settings", 500);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAuth();
    await connectPrimaryDb();

    const body = (await req.json()) as Record<string, unknown>;

    const allowed = [
      "siteName", "siteDescription", "siteUrl",
      "maintenanceMode", "twoFactorRequired", "auditLogging",
      "emailNotifications", "sessionAlerts", "defaultTheme",
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    const doc = await SiteSettingsModel.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true },
    ).lean();

    return ok(doc);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode);
    return fail("Failed to save settings", 500);
  }
}
