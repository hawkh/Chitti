'use client';

import { ToastProvider } from './NotificationToast';
import { QualityProvider } from '@/context/QualityContext';
import ErrorBoundary from './ErrorBoundary';
import PWAInstallPrompt from '@/components/audit/PWAInstallPrompt';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QualityProvider>
      <ToastProvider>
        <ErrorBoundary>
          {children}
          <PWAInstallPrompt />
        </ErrorBoundary>
      </ToastProvider>
    </QualityProvider>
  );
}
