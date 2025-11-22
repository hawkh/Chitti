// Offline mode handling

export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

export const queueOfflineRequest = (request: {
  url: string;
  method: string;
  data: any;
}): void => {
  if (typeof localStorage === 'undefined') return;
  
  const queue = getOfflineQueue();
  queue.push({ ...request, timestamp: Date.now() });
  localStorage.setItem('offlineQueue', JSON.stringify(queue));
};

export const getOfflineQueue = (): any[] => {
  if (typeof localStorage === 'undefined') return [];
  
  try {
    const queue = localStorage.getItem('offlineQueue');
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
};

export const clearOfflineQueue = (): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('offlineQueue');
};

export const processOfflineQueue = async (): Promise<void> => {
  if (!isOnline()) return;
  
  const queue = getOfflineQueue();
  if (queue.length === 0) return;
  
  for (const request of queue) {
    try {
      await fetch(request.url, {
        method: request.method,
        body: JSON.stringify(request.data),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Failed to process offline request:', error);
    }
  }
  
  clearOfflineQueue();
};

// Auto-process queue when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processOfflineQueue();
  });
}
