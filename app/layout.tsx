import "@/styles/globals.css";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { ToastProvider } from "@/components/shared/NotificationToast";

export const metadata = {
  title: "Chitti AI NDT - AI-Powered Defect Detection System",
  description: "Comprehensive Non-Destructive Testing solution using AI to detect defects in manufacturing components with 92% accuracy.",
  icons: {
    icon: "/logoc.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ToastProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
