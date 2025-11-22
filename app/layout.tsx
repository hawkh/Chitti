import "@/styles/globals.css";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { ToastProvider } from "@/components/shared/NotificationToast";
import PWAInstallPrompt from "@/components/audit/PWAInstallPrompt";
import PWAUpdateNotification from "@/components/audit/PWAUpdateNotification";
import type { Viewport } from 'next';

export const metadata = {
  title: "Chitti AI NDT - AI-Powered Defect Detection",
  description: "Enterprise AI-powered defect detection for manufacturing quality control.",
  icons: {
    icon: "/logoc.jpg",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950">
        <ToastProvider>
          <ErrorBoundary>
            {children}
            <PWAInstallPrompt />
            <PWAUpdateNotification />
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
