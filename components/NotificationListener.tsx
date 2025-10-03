"use client";

import { Megaphone } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function NotificationListener() {
  useEffect(() => {
    const evtSource = new EventSource("/api/notifications/stream");

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Show live toast notification
      toast(data.message, {
        duration: 8000,
        position: "bottom-right",
        closeButton: true,
        icon: <Megaphone size={16} />,
      });
    };

    return () => evtSource.close();
  }, []);

  return null; // This component just listens in background
}
