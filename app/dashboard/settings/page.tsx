"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Check, CheckCircle2, Download, MonitorSmartphone, Save } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/_ui/card";
import { Button } from "@/components/_ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePush } from "@/components/providers/push-provider";

type Settings = {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  sessionAlerts: boolean;
  twoFactorRequired: boolean;
  auditLogging: boolean;
  defaultTheme: "system" | "light" | "dark";
};

const DEFAULTS: Settings = {
  siteName: "Cypher Admin",
  siteDescription: "Real-time monitoring and analytics for your Telegram bot",
  siteUrl: "",
  maintenanceMode: false,
  emailNotifications: true,
  sessionAlerts: true,
  twoFactorRequired: false,
  auditLogging: true,
  defaultTheme: "system",
};

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const NOTIF_LOG_TYPES = [
  { value: "ADMIN_ACTION", label: "Admin Action" },
  { value: "GROUP_ACTION", label: "Group Action" },
  { value: "BOT_ACTION",   label: "Bot Action" },
  { value: "USER_ACTION",  label: "User Action" },
  { value: "FEEDBACK",     label: "New Feedback" },
] as const;
type NotifLogType = (typeof NOTIF_LOG_TYPES)[number]["value"];

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Notification prefs
  const [subscribedTypes, setSubscribedTypes] = useState<NotifLogType[]>(
    NOTIF_LOG_TYPES.map((t) => t.value)
  );
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [settingsRes, notifRes] = await Promise.all([
          fetch("/api/admin/settings"),
          fetch("/api/user/notification-prefs"),
        ]);
        if (settingsRes.ok) {
          const data = (await settingsRes.json()) as Partial<Settings>;
          setSettings((prev) => ({ ...prev, ...data }));
        }
        if (notifRes.ok) {
          const data = (await notifRes.json()) as { subscribedTypes: string[] };
          const validValues = NOTIF_LOG_TYPES.map((t) => t.value);
          setSubscribedTypes(
            data.subscribedTypes.filter((t): t is NotifLogType =>
              validValues.includes(t as NotifLogType)
            )
          );
        }
      } catch {
        // non-blocking
      }
    })();
  }, []);

  const toggleNotifType = (type: NotifLogType) => {
    setSubscribedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setNotifSaved(false);
  };

  const handleSaveNotifPrefs = async () => {
    setNotifSaving(true);
    try {
      await fetch("/api/user/notification-prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribedTypes }),
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2500);
    } finally {
      setNotifSaving(false);
    }
  };

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Global configuration for this admin panel.
          </p>
        </div>
        <Button onClick={() => void handleSave()} size="sm" className="gap-1.5" disabled={saving}>
          {saved ? <Check size={13} /> : <Save size={13} />}
          {saved ? "Saved" : saving ? "Saving…" : "Save"}
        </Button>
      </div>

      {/* General */}
      <Card>
        <CardHeader className="px-5 py-4 pb-0">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-2">
          <div className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="siteName" className="text-xs">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => set("siteName", e.target.value)}
                placeholder="Cypher Admin"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="siteDescription" className="text-xs">Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => set("siteDescription", e.target.value)}
                placeholder="Short description of this panel"
              />
            </div>
            <div className="space-y-1.5 pb-2">
              <Label htmlFor="siteUrl" className="text-xs">Public URL</Label>
              <Input
                id="siteUrl"
                value={settings.siteUrl}
                onChange={(e) => set("siteUrl", e.target.value)}
                placeholder="https://your-domain.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="px-5 py-4 pb-0">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-4">
          <p className="text-xs text-muted-foreground mb-3">Default theme for new sessions</p>
          <div className="flex gap-2">
            {(["system", "light", "dark"] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => set("defaultTheme", theme)}
                className={[
                  "flex-1 rounded-lg border py-2 text-xs font-medium capitalize transition-colors",
                  settings.defaultTheme === theme
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
                ].join(" ")}
              >
                {theme}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Access */}
      <Card>
        <CardHeader className="px-5 py-4 pb-0">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Access
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <SettingRow
            label="Maintenance Mode"
            description="Block all non-admin access to the dashboard"
          >
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(v: boolean) => set("maintenanceMode", v)}
            />
          </SettingRow>
          <SettingRow
            label="Require 2FA"
            description="Enforce two-factor authentication for all accounts"
          >
            <Switch
              checked={settings.twoFactorRequired}
              onCheckedChange={(v: boolean) => set("twoFactorRequired", v)}
            />
          </SettingRow>
          <SettingRow
            label="Audit Logging"
            description="Log all admin actions for compliance"
          >
            <Switch
              checked={settings.auditLogging}
              onCheckedChange={(v: boolean) => set("auditLogging", v)}
            />
          </SettingRow>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="px-5 py-4 pb-0">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <SettingRow
            label="Email Notifications"
            description="Send system alerts via email"
          >
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(v: boolean) => set("emailNotifications", v)}
            />
          </SettingRow>
          <SettingRow
            label="Session Alerts"
            description="Notify on new logins from unknown devices"
          >
            <Switch
              checked={settings.sessionAlerts}
              onCheckedChange={(v: boolean) => set("sessionAlerts", v)}
            />
          </SettingRow>
        </CardContent>
      </Card>

      {/* Notification Prefs */}
      <Card>
        <CardHeader className="px-5 py-4 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Log Notification Types
            </CardTitle>
            <Button
              size="sm"
              onClick={handleSaveNotifPrefs}
              disabled={notifSaving}
              className="gap-1.5"
            >
              {notifSaved ? <Check size={13} /> : <Save size={13} />}
              {notifSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <p className="text-xs text-muted-foreground mt-3 mb-4">
            Receive in-app notifications when a log of this type is created by the bot.
          </p>
          <div className="space-y-3">
            {NOTIF_LOG_TYPES.map(({ value, label }) => (
              <div key={value} className="flex items-center gap-3">
                <input
                  id={`notif-${value}`}
                  type="checkbox"
                  checked={subscribedTypes.includes(value)}
                  onChange={() => toggleNotifType(value)}
                  className="h-4 w-4 rounded border border-border accent-blue-500"
                />
                <Label htmlFor={`notif-${value}`} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <PushNotificationCard />

      {/* App Installation */}
      <AppInstallCard />
    </div>
  );
}

function PushNotificationCard() {
  const { state, subscribe, unsubscribe } = usePush();

  const busy = state === "loading";

  return (
    <Card>
      <CardHeader className="px-5 py-4 pb-0">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-4">
        {state === "unsupported" ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <BellOff size={15} />
            Push notifications are not supported in this browser.
          </div>
        ) : state === "denied" ? (
          <div className="flex items-center gap-3 text-sm text-orange-500">
            <BellOff size={15} />
            Notifications are blocked. Enable them in your browser settings, then reload.
          </div>
        ) : (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              {state === "subscribed" ? (
                <BellRing size={15} className="mt-0.5 shrink-0 text-primary" />
              ) : (
                <Bell size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {state === "subscribed" ? "Push notifications enabled" : "Enable push notifications"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {state === "subscribed"
                    ? "You'll receive browser alerts for subscribed log types, even when the tab is in the background."
                    : "Get browser alerts for new log events matching your subscribed types."}
                </p>
              </div>
            </div>
            <Switch
              checked={state === "subscribed"}
              disabled={busy}
              onCheckedChange={(on) => { void (on ? subscribe() : unsubscribe()); }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AppInstallCard() {
  const { installState, install } = usePWAInstall();

  return (
    <Card>
      <CardHeader className="px-5 py-4 pb-0">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          App Installation
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-4">
        {installState === "installed" ? (
          <div className="flex items-center gap-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 size={15} className="shrink-0" />
            Cypher is installed as an app on this device.
          </div>
        ) : installState === "available" || installState === "installing" ? (
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-3">
              <MonitorSmartphone size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Install as app</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add Cypher to your home screen or taskbar for a faster, standalone experience.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="gap-1.5 shrink-0"
              disabled={installState === "installing"}
              onClick={() => void install()}
            >
              <Download size={13} />
              {installState === "installing" ? "Installing…" : "Install"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MonitorSmartphone size={15} className="shrink-0" />
            Open Cypher over HTTPS in a supported browser (Chrome, Edge) to enable installation.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
