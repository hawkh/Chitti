/**
 * PWA Service Worker Registration
 * Handles service worker registration and updates
 */

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private registration: ServiceWorkerRegistration | null = null;
  private installPrompt: PWAInstallPrompt | null = null;
  private updateAvailable = false;

  /**
   * Register service worker
   */
  async register(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', this.registration.scope);

      // Check for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

      // Check for updates periodically
      setInterval(() => {
        this.registration?.update();
      }, 60 * 60 * 1000); // Check every hour

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<void> {
    if (this.registration) {
      await this.registration.unregister();
      this.registration = null;
    }
  }

  /**
   * Update service worker
   */
  async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  /**
   * Check if update is available
   */
  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  /**
   * Capture install prompt
   */
  captureInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as any;
      this.notifyInstallAvailable();
    });
  }

  /**
   * Show install prompt
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    await this.installPrompt.prompt();
    const { outcome } = await this.installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      this.installPrompt = null;
      return true;
    }

    return false;
  }

  /**
   * Check if app is installed
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Handle service worker messages
   */
  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'SYNC_EVIDENCE':
        // Trigger evidence sync
        window.dispatchEvent(new CustomEvent('sw-sync-evidence', {
          detail: { timestamp: data.timestamp }
        }));
        break;
      
      default:
        console.log('Unknown service worker message:', data);
    }
  }

  /**
   * Notify update available
   */
  private notifyUpdateAvailable(): void {
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  /**
   * Notify install available
   */
  private notifyInstallAvailable(): void {
    window.dispatchEvent(new CustomEvent('sw-install-available'));
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service worker not registered');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// Singleton instance
export const pwaManager = new PWAManager();

// Auto-register on module load
if (typeof window !== 'undefined') {
  pwaManager.register();
  pwaManager.captureInstallPrompt();
}
