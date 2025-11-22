# Offline Evidence Management Guide

## Overview

The offline evidence management system enables Inspectors to upload photos and videos even without internet connectivity. Files are automatically queued in IndexedDB and uploaded when connection is restored.

## Features

### 1. Automatic Offline Detection
- System automatically detects when device goes offline
- Evidence uploads are seamlessly queued without user intervention
- Visual indicators show offline status and queued items

### 2. IndexedDB Storage
- Evidence files stored locally in browser's IndexedDB
- Metadata preserved including audit ID, item ID, timestamps
- No file size limits beyond browser storage quotas

### 3. Background Sync
- Automatic upload when connection is restored
- Periodic sync checks every 5 minutes
- Sync triggered when app becomes visible

### 4. Retry Logic with Exponential Backoff
- Failed uploads automatically retried up to 3 times
- Retry delays: 1s, 5s, 15s (exponential backoff)
- Failed items marked after max retries

## Components

### OfflineQueueManager

Core service managing IndexedDB operations:

```typescript
import { offlineQueueManager } from '@/lib/audit/offline-queue-manager';

// Queue evidence for offline upload
const queueId = await offlineQueueManager.queueEvidence(
  auditId,
  itemId,
  file,
  { capturedAt: new Date(), location: geoPosition }
);

// Get pending uploads
const pending = await offlineQueueManager.getPendingEvidence();

// Get queue statistics
const stats = await offlineQueueManager.getQueueStats();
// Returns: { pending: 5, uploading: 2, failed: 1, total: 8 }

// Manually trigger sync
const result = await offlineQueueManager.syncPendingUploads();
// Returns: { successful: 5, failed: 0, errors: [] }
```

### BackgroundSyncService

Handles automatic synchronization:

```typescript
import { backgroundSyncService } from '@/lib/audit/background-sync-service';

// Listen for sync events
const unsubscribe = backgroundSyncService.onSync((event) => {
  console.log(`Sync completed: ${event.result.successful} uploaded`);
});

// Force manual sync
await backgroundSyncService.forceSync();

// Check online status
const isOnline = backgroundSyncService.getOnlineStatus();

// Get last sync time
const lastSync = backgroundSyncService.getLastSyncTime();
```

### OfflineQueueStatus Component

Visual status indicator for queued uploads:

```tsx
import OfflineQueueStatus from '@/components/audit/OfflineQueueStatus';

// Add to your layout or audit form
<OfflineQueueStatus />
```

Features:
- Shows pending, uploading, and failed counts
- Displays online/offline status
- Manual sync button when online
- Last sync timestamp
- Auto-hides when queue is empty and online

## Integration with Evidence Upload

The `useEvidenceUpload` hook automatically integrates offline queue:

```tsx
import { useEvidenceUpload } from '@/lib/audit/use-evidence-upload';

function AuditForm() {
  const { uploadFile, uploads, isUploading } = useEvidenceUpload({
    auditId: 'audit-123',
    itemId: 'item-456',
    onSuccess: (evidenceId) => {
      console.log('Evidence uploaded:', evidenceId);
    }
  });

  const handleFileSelect = async (file: File) => {
    // Automatically queues if offline, uploads if online
    await uploadFile(file);
  };

  return (
    <div>
      <input type="file" onChange={(e) => {
        if (e.target.files?.[0]) {
          handleFileSelect(e.target.files[0]);
        }
      }} />
      
      {uploads.map(upload => (
        <div key={upload.file.name}>
          {upload.status}: {upload.progress}%
        </div>
      ))}
    </div>
  );
}
```

## Usage Scenarios

### Scenario 1: Field Inspector Goes Offline

1. Inspector is completing audit in area with poor connectivity
2. Takes photos of compliance issues
3. Photos automatically queued in IndexedDB
4. Visual indicator shows "3 files will upload when connection is restored"
5. Inspector continues audit without interruption

### Scenario 2: Connection Restored

1. Device reconnects to network
2. Background sync automatically triggered
3. Queued files uploaded with retry logic
4. Success notification shown
5. Queue cleared of completed uploads

### Scenario 3: Upload Failures

1. Upload fails due to server error
2. System retries after 1 second
3. If fails again, retries after 5 seconds
4. If fails third time, retries after 15 seconds
5. After 3 failures, marked as failed
6. User can manually retry from queue status

## API Integration

### Upload Endpoint

The offline queue uses the same upload endpoint:

```typescript
POST /api/audit/evidence/upload

Headers:
  Authorization: Bearer <token>
  X-Offline-Upload: true  // Indicates queued upload

Body (FormData):
  file: <File>
  auditId: string
  itemId: string
  metadata: JSON string
```

### Queue Management

Queue operations are client-side only (IndexedDB):

```typescript
// No API calls needed for queue management
await offlineQueueManager.queueEvidence(...);
await offlineQueueManager.getPendingEvidence();
await offlineQueueManager.getQueueStats();
```

## Storage Management

### Automatic Cleanup

Old completed uploads are automatically cleaned up:

```typescript
// Clear uploads older than 7 days
await offlineQueueManager.clearOldCompletedUploads(7);
```

### Storage Quotas

Browser storage quotas vary by browser:
- Chrome: ~60% of available disk space
- Firefox: ~50% of available disk space
- Safari: ~1GB

Monitor storage usage:

```typescript
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const estimate = await navigator.storage.estimate();
  const percentUsed = (estimate.usage! / estimate.quota!) * 100;
  console.log(`Storage: ${percentUsed.toFixed(2)}% used`);
}
```

## Best Practices

### 1. Image Compression

Always enable auto-compression to reduce storage:

```typescript
const { uploadFile } = useEvidenceUpload({
  auditId,
  autoCompress: true  // Reduces file size before queuing
});
```

### 2. User Feedback

Show clear offline indicators:

```tsx
<OfflineQueueStatus />  // Always include in audit forms
```

### 3. Periodic Cleanup

Clean old completed uploads regularly:

```typescript
// Run on app startup or periodically
useEffect(() => {
  offlineQueueManager.clearOldCompletedUploads(7);
}, []);
```

### 4. Error Handling

Handle queue errors gracefully:

```typescript
const { uploadFile } = useEvidenceUpload({
  auditId,
  onError: (error) => {
    if (error.message.includes('quota')) {
      alert('Storage full. Please sync and clear old uploads.');
    }
  }
});
```

## Troubleshooting

### Queue Not Syncing

1. Check online status: `backgroundSyncService.getOnlineStatus()`
2. Manually trigger sync: `backgroundSyncService.forceSync()`
3. Check browser console for errors

### Storage Quota Exceeded

1. Clear old uploads: `offlineQueueManager.clearOldCompletedUploads(1)`
2. Enable compression: `autoCompress: true`
3. Reduce image quality in compression settings

### Failed Uploads

1. Check queue stats: `offlineQueueManager.getQueueStats()`
2. Review failed items for error messages
3. Manually retry or remove failed items

## Testing

### Test Offline Mode

```typescript
// Simulate offline
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: false
});

// Upload should queue
await uploadFile(testFile);

// Check queue
const stats = await offlineQueueManager.getQueueStats();
expect(stats.pending).toBe(1);

// Simulate online
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

// Trigger sync
await backgroundSyncService.forceSync();
```

### Test Retry Logic

```typescript
// Mock fetch to fail twice then succeed
let attempts = 0;
global.fetch = jest.fn(() => {
  attempts++;
  if (attempts < 3) {
    return Promise.reject(new Error('Network error'));
  }
  return Promise.resolve({ ok: true, json: () => ({ id: '123' }) });
});

await offlineQueueManager.syncPendingUploads();
expect(attempts).toBe(3);
```

## Performance Considerations

### IndexedDB Performance

- Batch operations when possible
- Use indexes for queries (status, auditId, createdAt)
- Limit concurrent uploads to 3-5 files

### Memory Management

- Large files stored as Blobs (not in memory)
- Thumbnails generated on-demand
- Cleanup completed uploads regularly

### Network Optimization

- Compress images before queuing
- Use exponential backoff for retries
- Batch small files when possible

## Security

### Data Protection

- Evidence stored in browser's IndexedDB (encrypted by OS)
- No sensitive data in queue metadata
- Auth tokens not stored in queue

### Upload Security

- All uploads use authenticated endpoints
- HTTPS required for production
- File type validation on server

## Future Enhancements

Potential improvements:
- Service Worker integration for true background sync
- Compression progress indicators
- Batch upload optimization
- Upload priority queue
- Conflict resolution for duplicate uploads
