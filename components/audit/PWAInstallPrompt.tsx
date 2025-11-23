'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { pwaManager } from '@/lib/audit/pwa-register';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(pwaManager.isInstalled());

    // Check if dismissed
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
      }
    }

    // Listen for install prompt
    const handleInstallAvailable = () => {
      if (!pwaManager.isInstalled()) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('sw-install-available', handleInstallAvailable);

    return () => {
      window.removeEventListener('sw-install-available', handleInstallAvailable);
    };
  }, []);

  // Don't show if already installed or dismissed recently
  if (isInstalled || !showPrompt || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const accepted = await pwaManager.showInstallPrompt();
    if (accepted) {
      setShowPrompt(false);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Install ISO Audit App
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Install our app for offline access, faster performance, and a better experience.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
