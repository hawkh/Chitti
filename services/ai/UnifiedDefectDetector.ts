/**
 * Unified Defect Detector
 * Supports multiple detection modes: TFJS (client-side), Backend API, and Mock API
 * with clear console logging to show which method is being used
 */

import { YOLODefectDetector } from './YOLODefectDetector';
import { DetectionConfig, DetectionResult, DefectType, DefectSeverity, ResultStatus } from '@/types';

export enum DetectionMode {
    TFJS = 'tfjs',          // Client-side TensorFlow.js
    BACKEND = 'backend',    // Server-side API
    MOCK = 'mock'           // Mock API for testing
}

export interface DetectorConfig {
    mode: DetectionMode;
    backendUrl?: string;    // Required for backend mode
    modelUrl?: string;      // Required for TFJS mode
}

export class UnifiedDefectDetector {
    private mode: DetectionMode;
    private tfjsDetector: YOLODefectDetector | null = null;
    private backendUrl: string;
    private isInitialized = false;

    constructor(private config: DetectorConfig) {
        this.mode = config.mode;
        this.backendUrl = config.backendUrl || '/api/detect';

        this.logDetectionMode();
    }

    private logDetectionMode() {
        const styles = {
            tfjs: 'background: #4CAF50; color: white; padding: 2px 8px; border-radius: 3px;',
            backend: 'background: #2196F3; color: white; padding: 2px 8px; border-radius: 3px;',
            mock: 'background: #FF9800; color: white; padding: 2px 8px; border-radius: 3px;'
        };

        const messages = {
            tfjs: '🧠 TFJS MODE - Running client-side AI with TensorFlow.js',
            backend: '🌐 BACKEND MODE - Using server-side API for predictions',
            mock: '🎭 MOCK MODE - Using mock API for testing'
        };

        console.log(`%c${messages[this.mode]}`, styles[this.mode]);
        console.log(`Detection Mode: ${this.mode.toUpperCase()}`);
    }

    async initialize(): Promise<void> {
        console.group(`🚀 Initializing ${this.mode.toUpperCase()} Detector`);

        try {
            if (this.mode === DetectionMode.TFJS) {
                await this.initializeTFJS();
            } else if (this.mode === DetectionMode.BACKEND) {
                await this.initializeBackend();
            } else if (this.mode === DetectionMode.MOCK) {
                await this.initializeMock();
            }

            this.isInitialized = true;
            console.log(`✅ ${this.mode.toUpperCase()} detector initialized successfully`);
        } catch (error) {
            console.error(`❌ Failed to initialize ${this.mode.toUpperCase()} detector:`, error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    private async initializeTFJS(): Promise<void> {
        console.log('📦 Loading TensorFlow.js model for client-side processing...');

        if (!this.config.modelUrl) {
            throw new Error('Model URL is required for TFJS mode');
        }

        this.tfjsDetector = new YOLODefectDetector();

        await this.tfjsDetector.initialize({
            modelUrl: this.config.modelUrl,
            inputSize: { width: 640, height: 640 },
            numClasses: 7,
            anchors: [], // Will be loaded from model
            classNames: ['crack', 'corrosion', 'deformation', 'surface_irregularity', 'inclusion', 'void', 'dimensional_variance'],
            confidenceThreshold: 0.5,
            nmsThreshold: 0.45
        });

        console.log('🎯 TFJS model loaded - predictions will run in browser');
    }

    private async initializeBackend(): Promise<void> {
        console.log(`🌐 Connecting to backend API at: ${this.backendUrl}`);

        // Test backend connection
        try {
            const response = await fetch(`${this.backendUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Backend health check failed: ${response.statusText}`);
            }

            console.log('✅ Backend API is ready');
        } catch (error) {
            console.warn('⚠️ Backend health check failed, will proceed anyway:', error);
        }
    }

    private async initializeMock(): Promise<void> {
        console.log('🎭 Mock detector ready - will generate simulated results');
    }

    async detectDefects(
        imageData: ImageData | File,
        config: DetectionConfig
    ): Promise<DetectionResult> {
        if (!this.isInitialized) {
            throw new Error('Detector not initialized. Call initialize() first.');
        }

        console.group(`🔍 Running ${this.mode.toUpperCase()} Detection`);
        const startTime = Date.now();

        try {
            let result: DetectionResult;

            switch (this.mode) {
                case DetectionMode.TFJS:
                    console.log('🧠 Using client-side TensorFlow.js');
                    result = await this.detectWithTFJS(imageData, config);
                    break;

                case DetectionMode.BACKEND:
                    console.log('🌐 Sending request to backend API');
                    result = await this.detectWithBackend(imageData, config);
                    break;

                case DetectionMode.MOCK:
                    console.log('🎭 Generating mock detection results');
                    result = await this.detectWithMock(imageData, config);
                    break;

                default:
                    throw new Error(`Unknown detection mode: ${this.mode}`);
            }

            const processingTime = Date.now() - startTime;
            console.log(`✅ Detection completed in ${processingTime}ms`);
            console.log(`📊 Found ${result.detectedDefects.length} defects`);
            console.table(result.detectedDefects.map(d => ({
                Type: d.defectType.name,
                Confidence: `${(d.confidence * 100).toFixed(1)}%`,
                Severity: d.severity
            })));

            return result;

        } catch (error) {
            console.error(`❌ Detection failed:`, error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }

    private async detectWithTFJS(
        imageData: ImageData | File,
        config: DetectionConfig
    ): Promise<DetectionResult> {
        if (!this.tfjsDetector) {
            throw new Error('TFJS detector not initialized');
        }

        console.log('⚡ Processing image in browser with TensorFlow.js...');
        return await this.tfjsDetector.detectDefects(imageData, config);
    }

    private async detectWithBackend(
        imageData: ImageData | File,
        config: DetectionConfig
    ): Promise<DetectionResult> {
        console.log(`📤 Uploading image to ${this.backendUrl}`);

        const formData = new FormData();

        if (imageData instanceof File) {
            formData.append('image', imageData);
        } else {
            // Convert ImageData to Blob
            const canvas = document.createElement('canvas');
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            const ctx = canvas.getContext('2d')!;
            ctx.putImageData(imageData, 0, 0);

            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/png');
            });

            formData.append('image', blob, 'image.png');
        }

        formData.append('config', JSON.stringify(config));

        const response = await fetch(this.backendUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.statusText}`);
        }

        console.log('📥 Received response from backend');
        return await response.json();
    }

    private async detectWithMock(
        imageData: ImageData | File,
        config: DetectionConfig
    ): Promise<DetectionResult> {
        console.log('🎲 Generating mock defects...');

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockDefects = [
            {
                id: 'mock_defect_1',
                defectType: {
                    id: 'crack-001',
                    name: 'Crack',
                    description: 'A linear fracture in the material',
                    category: 'structural',
                    severity: DefectSeverity.HIGH
                },
                confidence: 0.87,
                boundingBox: { x: 120, y: 80, width: 150, height: 100 },
                severity: DefectSeverity.HIGH,
                description: 'Mock crack defect for testing',
                affectedArea: 5.2
            },
            {
                id: 'mock_defect_2',
                defectType: {
                    id: 'corrosion-001',
                    name: 'Corrosion',
                    description: 'Surface corrosion detected',
                    category: 'surface',
                    severity: DefectSeverity.MEDIUM
                },
                confidence: 0.72,
                boundingBox: { x: 300, y: 150, width: 80, height: 60 },
                severity: DefectSeverity.MEDIUM,
                description: 'Mock corrosion defect for testing',
                affectedArea: 2.1
            }
        ];

        const fileName = imageData instanceof File ? imageData.name : 'mock_image.png';

        return {
            id: `mock_result_${Date.now()}`,
            fileName,
            defects: mockDefects.map(d => ({
                id: d.id,
                type: DefectType.CRACK,
                confidence: d.confidence,
                location: d.boundingBox,
                severity: d.severity,
                description: d.description,
                affectedArea: d.affectedArea
            })),
            detectedDefects: mockDefects,
            overallStatus: ResultStatus.FAIL,
            processingTime: 500,
            timestamp: new Date(),
            metadata: {
                imageSize: { width: 640, height: 480 },
                fileSize: imageData instanceof File ? imageData.size : 0,
                format: imageData instanceof File ? imageData.type : 'image/png'
            }
        };
    }

    getMode(): DetectionMode {
        return this.mode;
    }

    setMode(mode: DetectionMode) {
        console.log(`🔄 Switching detection mode from ${this.mode.toUpperCase()} to ${mode.toUpperCase()}`);
        this.mode = mode;
        this.isInitialized = false;
        this.logDetectionMode();
    }

    isReady(): boolean {
        return this.isInitialized;
    }

    async dispose(): Promise<void> {
        console.log(`🧹 Disposing ${this.mode.toUpperCase()} detector`);

        if (this.tfjsDetector) {
            this.tfjsDetector.dispose();
            this.tfjsDetector = null;
        }

        this.isInitialized = false;
    }
}
