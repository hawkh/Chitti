# Task 3.3 Implementation: Build Offline Evidence Management

## Overview

Implemented comprehensive offline evidence management system with IndexedDB storage, background sync, and retry logic with exponential backoff.

## Components Implemented

### 1. OfflineQueueManager (`lib/audit/offline-queue-manager.ts`)

Core service managing IndexedDB operations for offline evidence queuing.

**Key Features:**
- IndexedDB database initialization with evidence queue store
- Queue evidence for offline upload with metadata
- Get pending, uploading, and failed evidence items
- Update evidence status and retry counts
- Upload with exponential backoff retry logic (1s, 5s, 15s)
- Sync all pending uploads with error handling
- Queue statistics and cleanup utilities

**Key Methods:**
```typescript
- initialize(): Promise<void>
- queueEvidence(auditId, itemId, file, metadata): Promise<string>
- getPendingEvidence(): Promise<QueuedEvidence[]>
- getAuditEvidence(auditId): Promise<QueuedEvidence[]>
- updateEvidenceStatus(id, status, error?): Promise<void>
- removeEvidence(id): Promise<void>
- syncPendingUploads(): Promise<SyncResult>
- getQueueStats(): Promise<QueueStats>
- clearOldCompletedUploads(daysOld): Promise<number>
```

**Retry Logic:**
- Maximum 3 retry attempts per upload
- Exponential backoff delays: 1s, 5s, 15s
- Failed items marked after max retries
- Automatic retry on next sync attempt

### 2. BackgroundSyncService (`lib/audit/background-sync-service.ts`)

Handles automatic synchronization when connection is restored.

**Key Features:**
- Network event listeners (online/offline)
- Periodic sync checks every 5 minutes
- Visibility change detection for sync triggers
- Sync event notification system
- Manual sync trigger capability

**Key Methods:**
```typescript
- triggerSync(type): Promise<void>
- onSync(callback): () => void (unsubscribe)
- getOnlineStatus(): boolean
- getLastSyncTime(): Date | null
- forceSync(): Promise<void>
- stopPeriodicSync(): void
```

**Sync Triggers:**
- Connection restored (online event)
- App becomes visible (visibility change)
- Periodic check (every 5 minutes)
- Manual user trigger

### 3. OfflineQueueStatus Component (`components/audit/OfflineQueueStatus.tsx`)

Visual status indicator for queued uploads with user controls.

**Features:**
- Real-time queue statistics display
- Online/offline status indicator
- Pending, uploading, and failed counts
- Last sync timestamp
- Manual sync button
- Auto-hide when queue empty and online
- Error notifications for failed uploads

**UI Elements:**
- Fixed bottom-right position
- Compact floating card design
- Color-coded status (green=online, red=offline, yellow=pending)
- Sync progress indication
- Offline mode messaging

### 4. Updated useEvidenceUpload Hook

Enhanced existing evidence upload hook with offline queue integration.

**New Features:**
- Automatic offline detection
- Queue evidence when offline
- Fallback to queue on upload failure
- Online/offline status monitoring
- Seamless transition between online/offline modes

**Integration:**
```typescript
// Automatically queues if offline
const { uploadFile } = useEvidenceUpload({
  auditId: 'audit-123',
  itemId: 'item-456'
});

await uploadFile(file); // Queues if offline, uploads if online
```

### 5. Updated OfflineSyncIndicator Component

Refactored to use new queue manager and background sync service.

**Changes:**
- Replaced custom offline evidence hook with queue manager
- Integrated background sync service
- Added sync event listeners
- Improved status display
- Enhanced error handling

## Data Models

### QueuedEvidence Interface

```typescript
interface QueuedEvidence {
  id: string;
  auditId: string;
  itemId: string;
  file: Blob;
  fileName: string;
  fileType: string;
  metadata: EvidenceMetadata;
  retryCount: number;
  status: 'pending' | 'uploading' | 'failed' | 'completed';
  createdAt: Date;
  lastAttemptAt?: Date;
  error?: string;
}
```

### SyncResult Interface

```typescript
interface SyncResult {
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}
```

### QueueStats Interface

```typescript
interface QueueStats {
  pending: number;
  uploading: number;
  failed: number;
  total: number;
}
```

## IndexedDB Schema

**Database:** `iso-audit-offline`
**Version:** 1

**Object Store:** `evidence-queue`
- Key Path: `id`
- Indexes:
  - `status` (non-unique)
  - `auditId` (non-unique)
  - `createdAt` (non-unique)

## Usage Examples

### Queue Evidence for Offline Upload

```typescript
import { offlineQueueManager } from '@/lib/audit/offline-queue-manager';

const queueId = await offlineQueueManager.queueEvidence(
  'audit-123',
  'item-456',
  file,
  {
    capturedAt: new Date(),
    location: geoPosition,
    deviceInfo: navigator.userAgent
  }
);
```

### Monitor Sync Events

```typescript
import { backgroundSyncService } from '@/lib/audit/background-sync-service';

const unsubscribe = backgroundSyncService.onSync((event) => {
  console.log(`Sync ${event.type}: ${event.result.successful} uploaded`);
});
```

### Display Queue Status

```tsx
import OfflineQueueStatus from '@/components/audit/OfflineQueueStatus';

function AuditForm() {
  return (
    <div>
      {/* Your form content */}
      <OfflineQueueStatus />
    </div>
  );
}
```

### Manual Sync Trigger

```typescript
import { backgroundSyncService } from '@/lib/audit/background-sync-service';

await backgroundSyncService.forceSync();
```

## Error Handling

### Network Errors

- Automatic retry with exponential backoff
- Queue for offline upload on network failure
- User notification for persistent failures

### Storage Errors

- Quota exceeded detection
- Cleanup suggestions
- Graceful degradation

### Upload Errors

- Retry logic for transient errors
- Permanent failure marking after max retries
- Error message preservation for debugging

## Performance Optimizations

### IndexedDB Operations

- Batch operations where possible
- Indexed queries for fast lookups
- Efficient cursor-based iteration

### Network Operations

- Exponential backoff prevents server overload
- Concurrent upload limiting (handled by browser)
- Compression before queuing

### Memory Management

- Files stored as Blobs (not in memory)
- Automatic cleanup of old completed uploads
- Efficient queue statistics calculation

## Testing Considerations

### Unit Tests Needed

- Queue operations (add, remove, update)
- Retry logic with exponential backoff
- Sync result aggregation
- Status transitions

### Integration Tests Needed

- Online/offline transitions
- Background sync triggers
- Upload failure recovery
- Queue persistence across sessions

### Manual Testing Scenarios

1. Go offline, upload files, verify queuing
2. Come online, verify automatic sync
3. Simulate upload failures, verify retries
4. Test storage quota limits
5. Test periodic sync (5-minute intervals)

## Documentation

Created comprehensive guide: `components/audit/OFFLINE_EVIDENCE_GUIDE.md`

**Sections:**
- Overview and features
- Component documentation
- Integration examples
- Usage scenarios
- API reference
- Storage management
- Best practices
- Troubleshooting
- Testing strategies
- Performance considerations
- Security notes

## Requirements Satisfied

✅ **Requirement 7.1:** Save audit drafts to local storage when network unavailable
✅ **Requirement 7.4:** Queue files for background upload when connected
✅ **Requirement 10.4:** Compress images automatically to optimize bandwidth

**Additional Features:**
- Exponential backoff retry logic
- Background sync service
- Visual queue status indicator
- Automatic cleanup of old uploads
- Comprehensive error handling

## Integration Points

### Existing Components

- `useEvidenceUpload` hook - Enhanced with offline queue
- `OfflineSyncIndicator` - Updated to use queue manager
- `EvidenceUpload` component - Works seamlessly with queue

### API Endpoints

- `POST /api/audit/evidence/upload` - Accepts queued uploads
- Header `X-Offline-Upload: true` indicates queued upload

### Storage

- IndexedDB for evidence queue
- LocalStorage for auth tokens
- Browser cache for static assets

## Future Enhancements

Potential improvements:
- Service Worker for true background sync
- Upload progress tracking per file
- Batch upload optimization
- Priority queue for critical evidence
- Conflict resolution for duplicate uploads
- Compression progress indicators

## Known Limitations

1. Browser storage quotas vary by browser
2. Large files may impact performance
3. No cross-device sync (device-specific queue)
4. Requires modern browser with IndexedDB support

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 10+)
- Opera: Full support

**Required APIs:**
- IndexedDB
- Fetch API
- Blob API
- Online/Offline events

## Deployment Notes

### Production Considerations

1. Enable HTTPS for secure uploads
2. Configure appropriate storage quotas
3. Monitor IndexedDB usage
4. Set up error tracking for failed uploads
5. Configure periodic cleanup schedules

### Configuration

No additional configuration required. System uses sensible defaults:
- Max retries: 3
- Retry delays: 1s, 5s, 15s
- Periodic sync: 5 minutes
- Cleanup age: 7 days

## Conclusion

Task 3.3 successfully implemented a robust offline evidence management system with:
- Reliable IndexedDB storage
- Automatic background synchronization
- Intelligent retry logic with exponential backoff
- User-friendly status indicators
- Comprehensive error handling
- Performance optimizations

The system enables Inspectors to work seamlessly in areas with poor connectivity, ensuring no data loss and automatic upload when connection is restored.
