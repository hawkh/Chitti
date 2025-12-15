# Deploying TensorFlow.js on Vercel - Complete Guide

## TL;DR: Yes, TFJS Works Perfectly on Vercel! 🚀

**TensorFlow.js predictions run 100% in the browser**, so you don't need ANY serverless functions. All AI processing happens on the user's device using WebGL/CPU.

## How It Works

### Architecture

```
┌─────────────────────────────────────────────┐
│              Vercel CDN                     │
│  (Static File Hosting - No Serverless)      │
└────────────────┬────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
Next.js      TFJS Model    Images/Assets
HTML/JS      (static)      (static)
(static)
                 │
                 ▼ Downloads to browser
                 
┌────────────────────────────────────────────┐
│           User's Browser                   │
│  ┌──────────────────────────────────┐     │
│  │      TensorFlow.js Engine        │     │
│  │  • Loads model from CDN          │     │
│  │  • Runs inference on GPU/CPU     │     │
│  │  • No backend communication      │     │
│  └──────────────────────────────────┘     │
└────────────────────────────────────────────┘
```

### What Gets Deployed

1. **Static HTML/CSS/JS** - Your Next.js app compiled to static assets
2. **TFJS Model Files** - Stored in `/public/models/` as static files
3. **No API Routes Needed** - For TFJS mode (Backend mode would need API routes)

## Vercel Configuration

### 1. `vercel.json` - Optimize for TFJS

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/models/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    },
    {
      "source": "/(.*).json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/models/:path*",
      "destination": "/models/:path*"
    }
  ]
}
```

### 2. `next.config.js` - Static Export Support

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // For static export (optional, if you want full static site)
  // output: 'export',
  
  // Or hybrid (some pages static, some with API routes)
  
  // Optimize for TFJS
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side only - optimize for browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    // Add rule for TFJS model files
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    
    return config;
  },
  
  // Increase static generation timeout for large models
  staticPageGenerationTimeout: 120,
  
  // Optimize images
  images: {
    unoptimized: true, // If using static export
  },
  
  // Headers for CORS and caching
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 3. Directory Structure

```
Chitti/
├── public/
│   └── models/
│       └── yolo-defect-detector/
│           └── tfjs_model/
│               ├── model.json          ← ~2-10 KB
│               ├── group1-shard1of4.bin ← 10-50 MB each
│               ├── group1-shard2of4.bin
│               ├── group1-shard3of4.bin
│               └── group1-shard4of4.bin
├── app/
├── components/
└── services/
```

## Deployment Steps

### Step 1: Prepare Your Model

Ensure your TFJS model is in the `public/models/` directory:

```bash
# Check model files exist
ls public/models/yolo-defect-detector/tfjs_model/

# Output should show:
# model.json
# *.bin files
```

### Step 2: Update Model URL

In your code, use relative paths that work on Vercel:

```typescript
// ✅ Good - Works on Vercel
const modelUrl = '/models/yolo-defect-detector/tfjs_model/model.json';

// ❌ Bad - Absolute localhost paths
const modelUrl = 'http://localhost:3000/models/...';
```

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Or deploy to production
vercel --prod
```

### Step 4: Verify Deployment

After deployment, check:

1. **Model files accessible**: `https://your-app.vercel.app/models/yolo-defect-detector/tfjs_model/model.json`
2. **Console logs**: Open browser DevTools, should see TFJS initialization
3. **Network tab**: Model files loading from Vercel CDN

## Important Considerations

### 1. File Size Limits

| Vercel Plan | Static File Limit | Total Size Limit |
|-------------|-------------------|------------------|
| Hobby (Free)| 100 MB per file   | ~256 MB total    |
| Pro         | 100 MB per file   | 1 GB total       |
| Enterprise  | Custom            | Custom           |

**Solution if model is too large:**
- Host model on external CDN (AWS S3, Google Cloud Storage, Cloudflare R2)
- Compress model (quantization, pruning)
- Split into smaller shards

#### Example: External Model Hosting

```typescript
// Host model on external CDN
const detector = new UnifiedDefectDetector({
  mode: DetectionMode.TFJS,
  modelUrl: 'https://your-cdn.com/models/model.json' // ← External CDN
});
```

### 2. Initial Load Time

TFJS models need to be downloaded before first use:

- **Small model (10-20 MB)**: 2-5 seconds on 4G
- **Medium model (50-100 MB)**: 10-20 seconds on 4G
- **Large model (200+ MB)**: 1+ minute on 4G

**Optimization strategies:**

```typescript
// 1. Show loading indicator
const [modelLoading, setModelLoading] = useState(true);

// 2. Preload model on page load
useEffect(() => {
  const preloadModel = async () => {
    await detector.initialize();
    setModelLoading(false);
  };
  preloadModel();
}, []);

// 3. Use service worker to cache model
// See example below
```

### 3. Browser Compatibility

TFJS requires modern browsers with WebGL support:

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 13+
- ✅ Edge 79+
- ❌ IE 11 (not supported)

**Check compatibility in your app:**

```typescript
import * as tf from '@tensorflow/tfjs';

// Check WebGL support
const hasWebGL = tf.ENV.getBool('WEBGL_VERSION') >= 1;
if (!hasWebGL) {
  console.warn('WebGL not supported, falling back to CPU');
  await tf.setBackend('cpu');
}
```

### 4. Memory Management

Client devices have limited memory:

```typescript
// Clean up tensors to prevent memory leaks
useEffect(() => {
  return () => {
    detector.dispose(); // Clean up model when component unmounts
  };
}, [detector]);

// Monitor memory usage
const memoryUsage = tf.memory();
console.log('TFJS Memory:', memoryUsage);
```

## Production Optimization

### 1. Service Worker for Model Caching

Create `public/sw.js`:

```javascript
// Cache TFJS model files for offline use
const CACHE_NAME = 'tfjs-model-v1';
const MODEL_FILES = [
  '/models/yolo-defect-detector/tfjs_model/model.json',
  '/models/yolo-defect-detector/tfjs_model/group1-shard1of4.bin',
  '/models/yolo-defect-detector/tfjs_model/group1-shard2of4.bin',
  '/models/yolo-defect-detector/tfjs_model/group1-shard3of4.bin',
  '/models/yolo-defect-detector/tfjs_model/group1-shard4of4.bin',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(MODEL_FILES);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (MODEL_FILES.some(file => event.request.url.includes(file))) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### 2. Progressive Loading UI

```tsx
function ProgressiveModelLoader() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const loadModel = async () => {
      setStatus('Downloading model...');
      
      // Track download progress (approximate)
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      await detector.initialize();
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setStatus('Model ready!');
    };

    loadModel();
  }, []);

  return (
    <div className="model-loader">
      <p>{status}</p>
      <div className="progress-bar">
        <div style={{ width: `${loadingProgress}%` }} />
      </div>
    </div>
  );
}
```

### 3. Lazy Loading

Only load TFJS when needed:

```tsx
import dynamic from 'next/dynamic';

// Lazy load detection component
const UnifiedDetectionPanel = dynamic(
  () => import('@/components/detection/UnifiedDetectionPanel'),
  { 
    ssr: false, // Don't server-render
    loading: () => <p>Loading AI detector...</p> 
  }
);
```

## Cost Comparison

### TFJS (Client-Side) on Vercel

| Metric | Cost |
|--------|------|
| Static hosting | **FREE** (Hobby plan) |
| Bandwidth | 100 GB/month free |
| Function invocations | **0** (not used) |
| Compute time | **0** (runs on client) |
| **Total** | **$0** for most apps |

### Backend API on Vercel

| Metric | Cost (Hobby) | Cost (Pro) |
|--------|--------------|------------|
| Static hosting | FREE | $20/month |
| Function invocations | 100 GB-hrs/month | 1000 GB-hrs/month |
| Compute (per inference) | ~1-5 seconds | ~1-5 seconds |
| **Estimated** | **$0-25/month** | **$20-100/month** |

**Winner:** TFJS saves money by eliminating serverless function costs! 💰

## Environment Variables

Create `.env.local`:

```bash
# Detection mode (tfjs, backend, mock)
NEXT_PUBLIC_DETECTION_MODE=tfjs

# TFJS Model URL (for Vercel deployment)
NEXT_PUBLIC_TFJS_MODEL_URL=/models/yolo-defect-detector/tfjs_model/model.json

# Backend API URL (if using backend mode)
NEXT_PUBLIC_BACKEND_DETECTION_URL=/api/detect
```

Update your detector initialization:

```typescript
const detector = new UnifiedDefectDetector({
  mode: process.env.NEXT_PUBLIC_DETECTION_MODE as DetectionMode,
  modelUrl: process.env.NEXT_PUBLIC_TFJS_MODEL_URL,
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_DETECTION_URL
});
```

## Monitoring & Analytics

### Track TFJS Performance

```typescript
// Track model load time
const loadStart = performance.now();
await detector.initialize();
const loadTime = performance.now() - loadStart;

// Send to analytics
analytics.track('TFJS_Model_Loaded', {
  loadTime,
  modelSize: '50MB',
  backend: tf.getBackend()
});

// Track inference time
const inferenceStart = performance.now();
const result = await detector.detectDefects(image, config);
const inferenceTime = performance.now() - inferenceStart;

analytics.track('TFJS_Inference', {
  inferenceTime,
  defectsFound: result.detectedDefects.length
});
```

## Debugging on Vercel

### Check if model files are accessible

```bash
# Test model.json is accessible
curl https://your-app.vercel.app/models/yolo-defect-detector/tfjs_model/model.json

# Should return JSON with model architecture
```

### Common Issues & Solutions

#### Issue 1: Model files not found (404)

**Solution:**
```bash
# Ensure files are in public/ directory
mv models/ public/models/

# Or add to .vercelignore (remove if present)
# !public/models/**
```

#### Issue 2: CORS errors

**Solution:** Add headers in `vercel.json` (see configuration above)

#### Issue 3: Large model exceeds limits

**Solution:** Host model externally:
```typescript
const modelUrl = 'https://storage.googleapis.com/your-bucket/model.json';
```

#### Issue 4: Slow initial load

**Solution:** 
1. Use model compression (quantization)
2. Implement service worker caching
3. Show loading progress UI

## Testing Before Deployment

### Local Vercel Simulation

```bash
# Build for production locally
npm run build

# Test with Vercel dev server
vercel dev

# Or use Next.js production server
npm run start
```

### Verify TFJS Works

1. Open browser console
2. Look for logs: `🧠 TFJS MODE - Running client-side AI`
3. Check Network tab: Model files loading from `/models/`
4. Test detection: Should work without any API calls

## Example Deployment Workflow

```bash
# 1. Prepare files
npm run build

# 2. Test locally
npm run start

# 3. Check model files
ls -lh public/models/yolo-defect-detector/tfjs_model/

# 4. Deploy to Vercel preview
vercel

# 5. Test on preview URL
# https://your-app-xyz.vercel.app

# 6. Deploy to production
vercel --prod

# 7. Monitor
# Check Vercel dashboard for traffic and errors
```

## Best Practices

### ✅ DO

- Store models in `public/models/`
- Use relative URLs (`/models/...`)
- Implement loading states
- Cache models with service workers
- Monitor memory usage
- Provide fallback to backend mode if needed

### ❌ DON'T

- Don't exceed Vercel file size limits
- Don't use absolute localhost URLs
- Don't skip error handling
- Don't forget to dispose tensors
- Don't assume all browsers support WebGL

## Conclusion

**Yes, TensorFlow.js works perfectly on Vercel without serverless functions!**

- ✅ **100% client-side** - All AI runs in browser
- ✅ **Zero backend costs** - Just static file hosting
- ✅ **Unlimited predictions** - No function limits
- ✅ **Fast & scalable** - Vercel's global CDN
- ✅ **Private** - Images never leave client

Deploy with confidence! 🚀

## Resources

- [TensorFlow.js Docs](https://www.tensorflow.org/js)
- [Vercel Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)
- [TFJS Model Hosting Guide](https://www.tensorflow.org/js/guide/platform_environment)
- [Your Unified Detection README](./UNIFIED_DETECTION_README.md)
