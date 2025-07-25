import "@/styles/globals.css";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { ToastProvider } from "@/components/shared/NotificationToast";

export const metadata = {
  title: "Chitti AI NDT - AI-Powered Defect Detection System",
  description: "Comprehensive Non-Destructive Testing solution using AI to detect defects in manufacturing components with 92% accuracy.",
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
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="text-xl font-bold text-gray-900">
                  Chitti AI NDT
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/detection"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Detection
                </a>
                <a
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
              </div>
            </div>
          </div>
        </nav>
            {children}
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  );
}
