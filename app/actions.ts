/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import webpush, { PushSubscription as WebPushSubscription } from "web-push";
import Subscription from "@/models/Subscription";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

// Set VAPID keys for push notifications
webpush.setVapidDetails(
  "mailto:amegh2002@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: any) {
  await connectDB();

  const subscription = sub as WebPushSubscription;

  // Upsert subscription to avoid duplicates
  await Subscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    { ...subscription, adminId: null },
    { upsert: true, new: true }
  );

  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  await connectDB();
  await Subscription.findOneAndDelete({ endpoint });
  return { success: true };
}

export async function sendNotification(message: string) {
  try {
    await connectDB();

    // Save to DB
    await Notification.create({ message });

    // Fetch subscriptions
    const subscriptions = await Subscription.find();
    if (!subscriptions.length) throw new Error("No subscription available");

    const payload = JSON.stringify({
      title: "Test Notification",
      body: message,
      icon: "https://cypher-web-mu.vercel.app/icon-192x192.png",
      url: "/",
    });

    await Promise.all(
      subscriptions.map((sub) =>
        webpush
          .sendNotification(sub as any, payload)
          .catch(async (err: any) => {
            console.error("Push error:", err);
            if (err.statusCode === 410 || err.statusCode === 404) {
              await Subscription.findOneAndDelete({ endpoint: sub.endpoint });
            }
          })
      )
    );

    return { success: true };
  } catch (err: any) {
    console.error("Send notification error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

// Optional: send notification to a specific admin
export async function sendNotificationToAdmin(
  adminId: string,
  message: string
) {
  await connectDB();

  const subscriptions = await Subscription.find({ adminId });

  if (!subscriptions.length) {
    throw new Error("No subscription for this admin");
  }

  const payload = JSON.stringify({
    title: "Test Notification",
    body: message,
    icon: "https://cypher-web-mu.vercel.app/icon-192x192.png",
    url: "https://cypher-web-mu.vercel.app/",
  });

  await Promise.all(
    subscriptions.map((sub) =>
      webpush
        .sendNotification(sub as unknown as WebPushSubscription, payload)
        .catch(async (err: any) => {
          console.error("Push error:", err);
          if (err.statusCode === 410 || err.statusCode === 404) {
            await Subscription.findOneAndDelete({ endpoint: sub.endpoint });
          }
        })
    )
  );

  return { success: true };
}
