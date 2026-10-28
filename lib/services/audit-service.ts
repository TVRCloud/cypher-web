import { connectPrimaryDb } from "@/lib/db/mongoose";
import { AuditLogModel } from "@/lib/models/audit-log";
import { SiteSettingsModel } from "@/lib/models/site-settings";

type AuditEntry = {
  actorId: string;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  commandId?: string | null;
  meta?: unknown;
};

/** Honors the `auditLogging` site setting (default on). Never throws. */
export async function writeAuditLog(entry: AuditEntry) {
  try {
    await connectPrimaryDb();
    const settings = await SiteSettingsModel.findOne({}).lean<{ auditLogging?: boolean }>();
    if (settings && settings.auditLogging === false) return;
    await AuditLogModel.create(entry);
  } catch (error) {
    console.error("audit log write failed", error);
  }
}
