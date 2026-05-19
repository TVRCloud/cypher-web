"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type PushState = "unsupported" | "denied" | "unsubscribed" | "subscribed" | "loading";

interface PushContextValue {
  state: PushState;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

const PushContext = createContext<PushContextValue>({
  state: "unsupported",
  subscribe: async () => {},
  unsubscribe: async () => {},
});

export function usePush() {
  return useContext(PushContext);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PushState>("loading");
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  // Register service worker and check initial state
  useEffect(() => {
<<<<<<< Updated upstream
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !vapidKey) {
      setState("unsupported");
      return;
    }

=======
>>>>>>> Stashed changes
    void (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !vapidKey) {
        setState("unsupported");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;

        const permission = Notification.permission;
        if (permission === "denied") { setState("denied"); return; }

        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          setState("subscribed");
        } else {
          setState("unsubscribed");
        }
      } catch {
        setState("unsupported");
      }
    })();
  }, [vapidKey]);

  const subscribe = useCallback(async () => {
    if (!vapidKey) return;
    setState("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState("denied"); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = sub.toJSON() as {
        endpoint: string;
        keys?: { p256dh?: string; auth?: string };
      };

      await fetch("/api/user/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
        }),
      });

      setState("subscribed");
    } catch {
      setState("unsubscribed");
    }
  }, [vapidKey]);

  const unsubscribe = useCallback(async () => {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      await sub?.unsubscribe();
      await fetch("/api/user/push-subscription", { method: "DELETE" });
      setState("unsubscribed");
    } catch {
      setState("unsubscribed");
    }
  }, []);

  return (
    <PushContext.Provider value={{ state, subscribe, unsubscribe }}>
      {children}
    </PushContext.Provider>
  );
}
