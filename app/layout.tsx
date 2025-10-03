import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Providers from "@/lib/ReactQueryClientProvider";
import { Toaster } from "@/components/ui/sonner";
import NotificationListener from "@/components/NotificationListener";

export const metadata: Metadata = {
  title: "CYPHER Bot Admin",
  description: "Admin dashboard for Telegram movie bot",
  manifest: "/manifest.ts",
  appleWebApp: {
    capable: true,
    title: "CYPHER Bot Admin",
  },
  generator: "Kratos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NotificationListener />
          <Providers>{children}</Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
