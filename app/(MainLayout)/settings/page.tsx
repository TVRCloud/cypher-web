"use client";

import InstallButton from "@/components/InstallButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { motion } from "framer-motion";
import { PushNotificationManager } from "@/components/PushNotificationManager";

const SettingsPage = () => {
  return (
    <motion.div
      className="p-6 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h1 className="text-3xl font-bold">Settings</h1>
      {/* Install PWA */}
      <Card>
        <CardHeader>
          <CardTitle>Install Cypher Web App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            You can install this app on your device for faster access and a more
            native experience.
          </p>
          <InstallButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <PushNotificationManager />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SettingsPage;
