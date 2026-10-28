import { z } from "zod";
import { ok, fail } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { SiteSettingsModel } from "@/lib/models/site-settings";

const settingsUpdateSchema = z
  .strictObject({
    siteName: z.string().trim().min(1).max(100),
    siteDescription: z.string().trim().max(500),
    siteUrl: z.union([z.literal(""), z.url().max(300)]),
    maintenanceMode: z.boolean(),
    // Not enforced anywhere yet: no 2FA implementation exists.
    twoFactorRequired: z.boolean(),
    auditLogging: z.boolean(),
    emailNotifications: z.boolean(),
    sessionAlerts: z.boolean(),
    defaultTheme: z.enum(["light", "dark", "system"]),
  })
  .partial();

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
    await requirePermission("settings.read");
    const settings = await getSettings();
    return ok(settings);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode);
    return fail("Failed to load settings", 500);
  }
}

export async function PUT(req: Request) {
  try {
    await requirePermission("settings.write");

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return fail("Invalid JSON body", 400);
    }
    const parsed = settingsUpdateSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid settings", 400, parsed.error.issues);
    const update = parsed.data;

    await connectPrimaryDb();

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
