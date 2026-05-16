"use client";

import { useRef, useState } from "react";
import { Bell, BellDot } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useNotifications, TYPE_LABELS } from "@/hooks/use-notifications";

const TYPE_STYLES: Record<string, string> = {
  ADMIN_ACTION: "bg-red-400/10 text-red-400 border-red-400/20",
  GROUP_ACTION: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  BOT_ACTION:   "bg-blue-400/10 text-blue-400 border-blue-400/20",
  USER_ACTION:  "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  FEEDBACK:     "bg-amber-400/10 text-amber-400 border-amber-400/20",
};

const SHORT_LABELS: Record<string, string> = {
  ADMIN_ACTION: "Admin",
  GROUP_ACTION: "Group",
  BOT_ACTION:   "Bot",
  USER_ACTION:  "User",
  FEEDBACK:     "Feedback",
};

export function NotificationBell() {
  const { unread, recent, clearUnread } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setOpen((v) => {
      if (!v) clearUnread();
      return !v;
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        className="relative flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="Notifications"
        onClick={handleOpen}
      >
        {unread > 0 ? (
          <BellDot size={17} className="text-primary" />
        ) : (
          <Bell size={17} />
        )}
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-3.5 h-3.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center px-0.5 leading-none pointer-events-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 mt-2 w-85 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Bell size={13} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-semibold">
                    {unread} new
                  </span>
                )}
              </div>
              <Link
                href="/dashboard/settings"
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                Manage
              </Link>
            </div>

            <div className="max-h-90 overflow-y-auto divide-y divide-border/50">
              {recent.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={20} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No recent events</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    Subscribe to log types in Settings
                  </p>
                </div>
              ) : (
                recent.map((n) => {
                  const type = n.logType.toUpperCase();
                  const cls = TYPE_STYLES[type] ?? "bg-muted/50 text-muted-foreground border-border";
                  return (
                    <Link
                      key={n.id}
                      href={n.id ? `/dashboard/logs/${n.id}` : "/dashboard/notifications"}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <Badge variant="outline" className={`mt-0.5 text-[10px] font-medium shrink-0 ${cls}`}>
                        {SHORT_LABELS[type] ?? type}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">
                          {TYPE_LABELS[type] ?? type}
                          {n.user_id ? ` — User ${n.user_id}` : ""}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {[n.date, n.time].filter(Boolean).join(" ") || "—"}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">→</span>
                    </Link>
                  );
                })
              )}
            </div>

            <div className="border-t border-border/60 px-4 py-2.5 flex items-center justify-between bg-muted/20">
              <span className="text-[10px] text-muted-foreground">
                Showing last {recent.length} events
              </span>
              <Link
                href="/dashboard/notifications"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                View all →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
