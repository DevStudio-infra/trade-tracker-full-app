import "@/styles/globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";

import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Trading Agent - Coming Soon",
  description:
    "Join the waitlist for our revolutionary AI Trading Agent. Harness the power of artificial intelligence to transform your trading strategy.",
  icons: {
    icon: "/favicon.ico",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
