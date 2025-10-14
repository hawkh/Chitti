# Performance Optimization Strategy

## 1. Database Optimization

### Connection Pooling
```typescript
// lib/database/pool.ts
import { Pool } from 'pg';

export class DatabasePool {
  private static instance: Pool;
  
  static getInstance(): Pool {
    if (!this.instance) {
      this.instance = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20, // Maximum connections
        min: 5,  // Minimum connections
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
    return this.instance;
  }
}
```

### Query Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_detection_results_created_at 
ON detection_results (created_at DESC);

CREATE INDEX CONCURRENTLY idx_detection_results_status 
ON detection_results (status) WHERE status IN ('processing', 'completed');

CREATE INDEX CONCURRENTLY idx_detection_results_user_id 
ON detection_results (user_id, created_at DESC);

-- Composite index for complex queries
CREATE INDEX CONCURRENTLY idx_detection_results_composite 
ON detection_results (user_id, status, created_at DESC);
```

### Database Partitioning
```sql
-- Partition large tables by date
CREATE TABLE detection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE detection_results_2024_01 PARTITION OF detection_results
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## 2. Caching Strategy

### Redis Implementation
```typescript
// lib/cache/redis-client.ts
import Redis from 'ioredis';

export class CacheManager {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### Application-Level Caching
```typescript
// lib/cache/memory-cache.ts
export class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>();
  
  set(key: string, value: any, ttlMs: number = 300000): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

## 3. AI Model Optimization

### Model Loading Optimization
```typescript
// services/ai/optimized-model-loader.ts
export class OptimizedModelLoader {
  private modelCache = new Map<string, tf.GraphModel>();
  private loadingPromises = new Map<string, Promise<tf.GraphModel>>();
  
  async loadModel(modelPath: string): Promise<tf.GraphModel> {
    // Check cache first
    if (this.modelCache.has(modelPath)) {
      return this.modelCache.get(modelPath)!;
    }
    
    // Check if already loading
    if (this.loadingPromises.has(modelPath)) {
      return this.loadingPromises.get(modelPath)!;
    }
    
    // Load model with optimization
    const loadPromise = this.loadModelOptimized(modelPath);
    this.loadingPromises.set(modelPath, loadPromise);
    
    try {
      const model = await loadPromise;
      this.modelCache.set(modelPath, model);
      return model;
    } finally {
      this.loadingPromises.delete(modelPath);
    }
  }
  
  private async loadModelOptimized(modelPath: string): Promise<tf.GraphModel> {
    return tf.loadGraphModel(modelPath, {
      fetchFunc: this.optimizedFetch,
    });
  }
  
  private optimizedFetch = async (url: string): Promise<Response> => {
    const response = await fetch(url, {
      cache: 'force-cache',
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    
    return response;
  };
}
```

### Batch Processing Optimization
```typescript
// services/ai/batch-processor.ts
export class BatchProcessor {
  private readonly batchSize = 8;
  private readonly maxConcurrency = 4;
  
  async processBatch(files: File[]): Promise<DetectionResult[]> {
    const batches = this.createBatches(files, this.batchSize);
    const results: DetectionResult[] = [];
    
    // Process batches with controlled concurrency
    for (let i = 0; i < batches.length; i += this.maxConcurrency) {
      const concurrentBatches = batches.slice(i, i + this.maxConcurrency);
      
      const batchPromises = concurrentBatches.map(batch => 
        this.processSingleBatch(batch)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());
    }
    
    return results;
  }
  
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
  
  private async processSingleBatch(files: File[]): Promise<DetectionResult[]> {
    // Process files in parallel within batch
    const promises = files.map(file => this.processFile(file));
    return Promise.all(promises);
  }
}
```

## 4. File Processing Optimization

### Streaming File Processing
```typescript
// services/file/stream-processor.ts
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';

export class StreamProcessor {
  async processLargeFile(file: File): Promise<void> {
    const fileStream = file.stream();
    const reader = fileStream.getReader();
    
    const nodeStream = new Readable({
      async read() {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      }
    });
    
    const processTransform = new Transform({
      transform(chunk, encoding, callback) {
        // Process chunk without loading entire file
        const processed = this.processChunk(chunk);
        callback(null, processed);
      }
    });
    
    await pipeline(nodeStream, processTransform);
  }
  
  private processChunk(chunk: Buffer): Buffer {
    // Implement chunk processing logic
    return chunk;
  }
}
```

### Image Optimization
```typescript
// services/image/optimizer.ts
import sharp from 'sharp';

export class ImageOptimizer {
  async optimizeForProcessing(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(640, 640, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();
  }
  
  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(200, 200, {
        fit: 'cover'
      })
      .jpeg({
        quality: 70
      })
      .toBuffer();
  }
}
```

## 5. API Optimization

### Response Compression
```typescript
// middleware/compression.ts
import { NextRequest, NextResponse } from 'next/server';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export async function compressionMiddleware(
  req: NextRequest,
  response: any
): Promise<NextResponse> {
  const acceptEncoding = req.headers.get('accept-encoding') || '';
  
  if (acceptEncoding.includes('gzip')) {
    const compressed = await gzipAsync(JSON.stringify(response));
    
    return new NextResponse(compressed, {
      headers: {
        'Content-Encoding': 'gzip',
        'Content-Type': 'application/json',
        'Content-Length': compressed.length.toString()
      }
    });
  }
  
  return NextResponse.json(response);
}
```

### Pagination Optimization
```typescript
// lib/pagination/cursor-pagination.ts
export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
}

export class CursorPagination {
  static async paginate<T>(
    query: any,
    params: CursorPaginationParams
  ): Promise<{
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const { cursor, limit, sortField, sortOrder } = params;
    
    let whereClause = '';
    if (cursor) {
      const operator = sortOrder === 'asc' ? '>' : '<';
      whereClause = `WHERE ${sortField} ${operator} $1`;
    }
    
    const sql = `
      SELECT * FROM (${query})
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder.toUpperCase()}
      LIMIT $${cursor ? 2 : 1}
    `;
    
    const params_array = cursor ? [cursor, limit + 1] : [limit + 1];
    const results = await db.query(sql, params_array);
    
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, -1) : results;
    const nextCursor = hasMore ? data[data.length - 1][sortField] : undefined;
    
    return { data, nextCursor, hasMore };
  }
}
```

## 6. Frontend Optimization

### Code Splitting
```typescript
// components/lazy-loading.tsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from './shared/LoadingSpinner';

// Lazy load heavy components
const DefectVisualization = lazy(() => import('./detection/DefectVisualization'));
const BatchResultsVisualization = lazy(() => import('./detection/BatchResultsVisualization'));
const ComponentProfileManager = lazy(() => import('./profiles/ComponentProfileManager'));

export function LazyDefectVisualization(props: any) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DefectVisualization {...props} />
    </Suspense>
  );
}
```

### Virtual Scrolling
```typescript
// components/virtual-list.tsx
import { useMemo, useState } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);
  
  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 7. Monitoring & Metrics

### Performance Monitoring
```typescript
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();
  
  static startTimer(operation: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }
  
  static recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const values = this.metrics.get(operation)!;
    values.push(value);
    
    // Keep only last 1000 measurements
    if (values.length > 1000) {
      values.shift();
    }
  }
  
  static getMetrics(operation: string) {
    const values = this.metrics.get(operation) || [];
    
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg, min, max, count: values.length };
  }
}
```

This performance optimization strategy addresses the key bottlenecks identified in the codebase and provides a foundation for handling enterprise-scale workloads.