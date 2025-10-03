/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/notifications/stream/route.ts
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const send = (msg: any) => {
        controller.enqueue(`data: ${JSON.stringify(msg)}\n\n`);
      };

      // Poll DB every 1-2 seconds (simple approach)
      let lastChecked = new Date();
      const interval = setInterval(async () => {
        await connectDB();
        const newNotifications = await Notification.find({
          createdAt: { $gt: lastChecked },
        });
        lastChecked = new Date();
        newNotifications.forEach(send);
      }, 2000);

      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
