/**
 * React Hook for Unified Defect Detection
 * Easily switch between TFJS, Backend, and Mock modes
 */

import { useState, useEffect, useCallback } from 'react';
import { UnifiedDefectDetector, DetectionMode, DetectorConfig } from '@/services/ai/UnifiedDefectDetector';
import { DetectionConfig, DetectionResult } from '@/types';

interface UseUnifiedDetectorOptions {
    initialMode?: DetectionMode;
    modelUrl?: string;
    backendUrl?: string;
    autoInitialize?: boolean;
}

export function useUnifiedDetector(options: UseUnifiedDetectorOptions = {}) {
    const {
        initialMode = DetectionMode.TFJS,
        modelUrl = '/models/yolo-defect-detector/tfjs_model/model.json',
        backendUrl = '/api/detect',
        autoInitialize = true
    } = options;

    const [detector, setDetector] = useState<UnifiedDefectDetector | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<DetectionMode>(initialMode);

    // Initialize detector
    const initialize = useCallback(async (targetMode: DetectionMode = mode) => {
        setIsInitializing(true);
        setError(null);

        try {
            const config: DetectorConfig = {
                mode: targetMode,
                modelUrl,
                backendUrl
            };

            const newDetector = new UnifiedDefectDetector(config);
            await newDetector.initialize();

            setDetector(newDetector);
            setIsReady(true);
            setMode(targetMode);

            console.log(`%c✅ Detector ready in ${targetMode.toUpperCase()} mode`,
                'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold;');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize detector';
            setError(errorMessage);
            console.error('Detector initialization failed:', err);
        } finally {
            setIsInitializing(false);
        }
    }, [mode, modelUrl, backendUrl]);

    // Auto-initialize on mount
    useEffect(() => {
        if (autoInitialize) {
            initialize();
        }

        return () => {
            // Cleanup on unmount
            if (detector) {
                detector.dispose();
            }
        };
    }, []);

    // Switch detection mode
    const switchMode = useCallback(async (newMode: DetectionMode) => {
        console.log(`%c🔄 Switching to ${newMode.toUpperCase()} mode`,
            'background: #2196F3; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold;');

        // Dispose current detector
        if (detector) {
            await detector.dispose();
            setDetector(null);
            setIsReady(false);
        }

        // Initialize with new mode
        await initialize(newMode);
    }, [detector, initialize]);

    // Run detection
    const detect = useCallback(async (
        imageData: ImageData | File,
        config: DetectionConfig
    ): Promise<DetectionResult | null> => {
        if (!detector || !isReady) {
            console.warn('Detector not ready. Please wait for initialization.');
            return null;
        }

        try {
            const result = await detector.detectDefects(imageData, config);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Detection failed';
            setError(errorMessage);
            console.error('Detection error:', err);
            return null;
        }
    }, [detector, isReady]);

    return {
        detector,
        isInitializing,
        isReady,
        error,
        mode,
        initialize,
        switchMode,
        detect
    };
}
