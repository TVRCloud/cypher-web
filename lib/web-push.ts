import webpush from "web-push";
import { env } from "@/lib/config/env";

let initialised = false;

function init() {
  if (initialised) return;
  if (!env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(
    `mailto:${env.VAPID_EMAIL ?? "admin@example.com"}`,
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );
  initialised = true;
}

export async function sendPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: {
    title: string;
    body?: string;
    url?: string;
    icon?: string;
    badge?: string;
  },
): Promise<void> {
  init();
  if (!initialised) return;
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: subscription.keys },
      JSON.stringify(payload),
    );
  } catch (err: unknown) {
    // 410 Gone = subscription expired/unsubscribed — caller should clean up
    throw err;
  }
}
