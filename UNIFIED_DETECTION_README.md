# Unified Defect Detection System

## Overview

The Unified Defect Detection system allows you to switch between three detection modes:

1. **🧠 TFJS Mode** - Client-side AI using TensorFlow.js (runs in browser)
2. **🌐 Backend Mode** - Server-side API processing
3. **🎭 Mock Mode** - Simulated results for testing

All modes provide **comprehensive console logging** so you can see exactly which method is being used.

## Features

✅ **Seamless Mode Switching** - Switch between modes without page reload  
✅ **Console Visibility** - Clear, color-coded console logs showing detection method  
✅ **No Backend Impact** - TFJS mode runs entirely client-side  
✅ **Unified Interface** - Same API regardless of detection mode  
✅ **React Hook** - Easy integration with `useUnifiedDetector`

## Quick Start

### 1. Using the Component

```tsx
import UnifiedDetectionPanel from '@/components/detection/UnifiedDetectionPanel';

export default function MyPage() {
  return <UnifiedDetectionPanel />;
}
```

### 2. Using the Hook

```tsx
import { useUnifiedDetector } from '@/hooks/useUnifiedDetector';
import { DetectionMode } from '@/services/ai/UnifiedDefectDetector';

function MyComponent() {
  const { mode, isReady, detect, switchMode } = useUnifiedDetector({
    initialMode: DetectionMode.TFJS,
    autoInitialize: true
  });

  const handleDetect = async (file: File) => {
    const result = await detect(file, {
      // ... detection config
    });
    console.log('Detection result:', result);
  };

  return (
    <div>
      <button onClick={() => switchMode(DetectionMode.BACKEND)}>
        Switch to Backend
      </button>
      {/* ... */}
    </div>
  );
}
```

### 3. Direct Usage

```tsx
import { UnifiedDefectDetector, DetectionMode } from '@/services/ai/UnifiedDefectDetector';

const detector = new UnifiedDefectDetector({
  mode: DetectionMode.TFJS,
  modelUrl: '/models/yolo-defect-detector/tfjs_model/model.json'
});

await detector.initialize();
const result = await detector.detectDefects(imageFile, config);
```

## Console Output

When you run detection, you'll see detailed console logs like:

```
🧠 TFJS MODE - Running client-side AI with TensorFlow.js
Detection Mode: TFJS

🚀 Initializing TFJS Detector
  📦 Loading TensorFlow.js model for client-side processing...
  🎯 TFJS model loaded - predictions will run in browser
  ✅ TFJS detector initialized successfully

🔍 Running TFJS Detection
  🧠 Using client-side TensorFlow.js
  ⚡ Processing image in browser with TensorFlow.js...
  ✅ Detection completed in 1234ms
  📊 Found 3 defects
```

## Detection Modes

### TFJS Mode (Client-Side)
- **Runs entirely in browser** - No backend required
- **Privacy-focused** - Images never leave the client
- **Fast** - No network latency
- **Offline-capable** - Works without internet after model load
- **Console**: `🧠 TFJS MODE` (green background)

### Backend Mode (Server-Side)
- **Server processing** - Uses backend API
- **Scalable** - Offload processing to server
- **Consistent** - Same model version for all users
- **Console**: `🌐 BACKEND MODE` (blue background)

### Mock Mode (Testing)
- **Instant results** - No actual AI processing
- **Predictable** - Always returns sample defects
- **Development** - Great for UI/UX testing
- **Console**: `🎭 MOCK MODE` (orange background)

## Configuration

### Model URL (TFJS Mode)
```tsx
const detector = new UnifiedDefectDetector({
  mode: DetectionMode.TFJS,
  modelUrl: '/models/yolo-defect-detector/tfjs_model/model.json'
});
```

### Backend URL (Backend Mode)
```tsx
const detector = new UnifiedDefectDetector({
  mode: DetectionMode.BACKEND,
  backendUrl: 'https://api.example.com/detect'
});
```

## API Reference

### `UnifiedDefectDetector`

#### Constructor
```tsx
new UnifiedDefectDetector(config: DetectorConfig)
```

#### Methods
- `initialize(): Promise<void>` - Initialize the detector
- `detectDefects(imageData, config): Promise<DetectionResult>` - Run detection
- `getMode(): DetectionMode` - Get current mode
- `setMode(mode): void` - Change detection mode
- `isReady(): boolean` - Check if detector is ready
- `dispose(): Promise<void>` - Clean up resources

### `useUnifiedDetector` Hook

#### Options
```tsx
{
  initialMode?: DetectionMode;      // Default: TFJS
  modelUrl?: string;                 // TFJS model path
  backendUrl?: string;               // Backend API URL
  autoInitialize?: boolean;          // Default: true
}
```

#### Returns
```tsx
{
  detector: UnifiedDefectDetector | null;
  isInitializing: boolean;
  isReady: boolean;
  error: string | null;
  mode: DetectionMode;
  initialize: (mode?) => Promise<void>;
  switchMode: (mode) => Promise<void>;
  detect: (imageData, config) => Promise<DetectionResult | null>;
}
```

## Examples

### Example 1: Mode Switching
```tsx
function DetectionApp() {
  const { mode, switchMode, detect } = useUnifiedDetector();

  return (
    <div>
      <select 
        value={mode} 
        onChange={(e) => switchMode(e.target.value as DetectionMode)}
      >
        <option value={DetectionMode.TFJS}>TFJS (Client)</option>
        <option value={DetectionMode.BACKEND}>Backend API</option>
        <option value={DetectionMode.MOCK}>Mock</option>
      </select>
      {/* Upload UI */}
    </div>
  );
}
```

### Example 2: Conditional Mode
```tsx
function SmartDetection() {
  const [mode, setMode] = useState(
    navigator.onLine ? DetectionMode.BACKEND : DetectionMode.TFJS
  );

  const { detect } = useUnifiedDetector({ initialMode: mode });

  useEffect(() => {
    // Switch to TFJS when offline
    window.addEventListener('offline', () => setMode(DetectionMode.TFJS));
    window.addEventListener('online', () => setMode(DetectionMode.BACKEND));
  }, []);

  // ...
}
```

## Demo Page

Visit `/unified-detection` to see the system in action with:
- Mode selector buttons
- Real-time status indicators
- Console logging hints
- File upload and detection

## Environment Variables

You can configure default modes via environment variables:

```env
NEXT_PUBLIC_DETECTION_MODE=tfjs|backend|mock
NEXT_PUBLIC_TFJS_MODEL_URL=/models/yolo-defect-detector/tfjs_model/model.json
NEXT_PUBLIC_BACKEND_DETECTION_URL=/api/detect
```

## Browser Console Tips

1. **Open Console**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. **Filter Logs**: Type "MODE" in the console filter to see mode-related logs
3. **Expand Groups**: Click the arrows to expand grouped logs
4. **Copy Results**: Right-click table data to copy detection results

## Troubleshooting

### TFJS Mode Not Loading
- Check model URL is correct
- Ensure model files are accessible
- Check browser console for CORS errors

### Backend Mode Failing
- Verify backend URL is correct
- Check network tab for API errors
- Ensure backend endpoint accepts FormData

### Mock Mode Not Showing Results
- Mock mode always works - check console for errors
- Ensure component is properly mounted

## Performance Comparison

| Mode | Speed | Privacy | Offline | Backend Load |
|------|-------|---------|---------|--------------|
| TFJS | Fast | ✅ High | ✅ Yes | None |
| Backend | Variable | Medium | ❌ No | High |
| Mock | Instant | ✅ High | ✅ Yes | None |

## License

Part of the Chitti AI NDT Defect Detection System.
