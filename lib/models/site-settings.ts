import { Schema, model, models } from "mongoose";

const siteSettingsSchema = new Schema(
  {
    siteName: { type: String, default: "Cypher Admin" },
    siteDescription: { type: String, default: "" },
    siteUrl: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },
    twoFactorRequired: { type: Boolean, default: false },
    auditLogging: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    sessionAlerts: { type: Boolean, default: true },
    defaultTheme: { type: String, default: "system" },
  },
  { timestamps: true, collection: "site_settings" },
);

export const SiteSettingsModel =
  models.SiteSettings || model("SiteSettings", siteSettingsSchema);
