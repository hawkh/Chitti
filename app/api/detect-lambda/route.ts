import { NextRequest, NextResponse } from 'next/server'
import * as tf from '@tensorflow/tfjs-node'

// Server-side detection implementation optimized for AWS Lambda
// No 250MB limit on Amplify - we can use larger models!

interface DetectionConfig {
    componentType?: any
    sensitivity?: number
    defectTypes?: string[]
    confidenceThreshold?: number
}

// Model cache to avoid reloading on every request
let modelCache: tf.GraphModel | null = null
let modelLoadPromise: Promise<tf.GraphModel> | null = null

async function loadModel(): Promise<tf.GraphModel> {
    // If already loading, wait for it
    if (modelLoadPromise) {
        return modelLoadPromise
    }

    // If already loaded, return cached model
    if (modelCache) {
        return modelCache
    }

    // Start loading
    modelLoadPromise = (async () => {
        console.log('🔄 Loading YOLO model on AWS Lambda...')
        const startTime = Date.now()

        try {
            // Check if model URL is provided (for S3 or external hosting)
            const modelUrl = process.env.MODEL_URL || process.env.NEXT_PUBLIC_TFJS_MODEL_URL

            if (modelUrl && modelUrl.startsWith('http')) {
                // Load from external URL (S3, CDN, etc.)
                console.log(`📦 Loading model from: ${modelUrl}`)
                const model = await tf.loadGraphModel(modelUrl)
                const loadTime = Date.now() - startTime
                console.log(`✅ Server model loaded from URL in ${loadTime}ms`)
                modelCache = model
                return model
            }

            // Fallback: Model not configured
            throw new Error('Server-side model not configured. Set MODEL_URL or NEXT_PUBLIC_TFJS_MODEL_URL')

        } catch (error) {
            console.error('❌ Failed to load server model:', error)
            throw error
        }
    })()

    return modelLoadPromise
}

async function preprocessImage(imageBuffer: Buffer): Promise<tf.Tensor4D> {
    console.log('📸 Preprocessing image on server...')

    // Decode image
    const imageTensor = tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D

    // Resize to 640x640 (YOLO input size)
    const resized = tf.image.resizeBilinear(imageTensor, [640, 640])

    // Normalize to [0, 1]
    const normalized = resized.div(255.0)

    // Add batch dimension [1, 640, 640, 3]
    const batched = normalized.expandDims(0) as tf.Tensor4D

    // Clean up intermediate tensors
    imageTensor.dispose()
    resized.dispose()
    normalized.dispose()

    return batched
}

function postProcessDetections(
    predictions: tf.Tensor,
    confidenceThreshold: number = 0.5
): any[] {
    console.log('🔍 Post-processing detections on server...')

    // Get prediction data
    const predData = predictions.dataSync()
    const predShape = predictions.shape

    // YOLO output format: [batch, num_detections, 85]
    // 85 = 4 (bbox) + 1 (objectness) + 80 (classes)
    const numDetections = predShape[1] || 0
    const numParams = predShape[2] || 0

    const detections: any[] = []

    for (let i = 0; i < numDetections; i++) {
        const offset = i * numParams

        // Extract bounding box
        const centerX = predData[offset]
        const centerY = predData[offset + 1]
        const width = predData[offset + 2]
        const height = predData[offset + 3]
        const objectness = predData[offset + 4]

        // Find best class
        let bestClass = 0
        let bestClassProb = 0

        for (let j = 5; j < numParams; j++) {
            const classProb = predData[offset + j]
            if (classProb > bestClassProb) {
                bestClassProb = classProb
                bestClass = j - 5
            }
        }

        const confidence = objectness * bestClassProb

        // Filter by confidence
        if (confidence >= confidenceThreshold && bestClass < 7) {
            // Convert to corner coordinates
            const x = (centerX - width / 2) * 640
            const y = (centerY - height / 2) * 640
            const w = width * 640
            const h = height * 640

            detections.push({
                bbox: [Math.max(0, x), Math.max(0, y), w, h],
                confidence,
                classId: bestClass,
                className: getClassName(bestClass)
            })
        }
    }

    console.log(`✅ Found ${detections.length} detections`)
    return detections
}

function getClassName(classId: number): string {
    const classNames = [
        'crack',
        'corrosion',
        'deformation',
        'surface_irregularity',
        'inclusion',
        'void',
        'dimensional_variance'
    ]
    return classNames[classId] || 'unknown'
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()

    console.log('🚀 AWS Lambda Backend AI Detection - Starting...')
    console.log('💻 Running on AWS Amplify (No 250MB limit!)')

    try {
        // Parse multipart form data
        const formData = await request.formData()
        const imageFile = formData.get('image') as File
        const configStr = formData.get('config') as string

        if (!imageFile) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            )
        }

        console.log(`📁 Image received: ${imageFile.name} (${imageFile.size} bytes)`)

        // Parse config
        const config: DetectionConfig = configStr ? JSON.parse(configStr) : {}
        const confidenceThreshold = config.confidenceThreshold || 0.5

        // Load model (cached after first request)
        const model = await loadModel()

        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer()
        const imageBuffer = Buffer.from(arrayBuffer)

        // Preprocess image
        const inputTensor = await preprocessImage(imageBuffer)
        console.log(`📊 Input tensor shape: [${inputTensor.shape.join(', ')}]`)

        // Run inference on server
        console.log('🧠 Running server-side TensorFlow inference...')
        const inferenceStart = Date.now()
        const predictions = model.predict(inputTensor) as tf.Tensor
        const inferenceTime = Date.now() - inferenceStart
        console.log(`⚡ Inference completed in ${inferenceTime}ms`)
        console.log(`📊 Output shape: [${predictions.shape.join(', ')}]`)

        // Post-process
        const detections = postProcessDetections(predictions, confidenceThreshold)

        // Clean up tensors
        inputTensor.dispose()
        predictions.dispose()

        const totalTime = Date.now() - startTime

        // Format response to match UnifiedDetectDetector expected format
        const detectedDefects = detections.map(d => ({
            id: `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            defectType: {
                id: `${d.className}-001`,
                name: formatClassName(d.className),
                description: `${formatClassName(d.className)} detected`,
                category: 'structural',
                severity: getSeverity(d.confidence)
            },
            confidence: d.confidence,
            boundingBox: {
                x: Math.round(d.bbox[0]),
                y: Math.round(d.bbox[1]),
                width: Math.round(d.bbox[2]),
                height: Math.round(d.bbox[3])
            },
            severity: getSeverity(d.confidence),
            description: `${formatClassName(d.className)} detected with ${(d.confidence * 100).toFixed(1)}% confidence`,
            affectedArea: ((d.bbox[2] * d.bbox[3]) / (640 * 640)) * 100
        }))

        const result = {
            id: `result_${Date.now()}`,
            fileName: imageFile.name,
            defects: detectedDefects.map(d => ({
                id: d.id,
                type: d.defectType.name,
                confidence: d.confidence,
                location: d.boundingBox,
                severity: d.severity,
                description: d.description,
                affectedArea: d.affectedArea
            })),
            detectedDefects,
            overallStatus: detectedDefects.length > 0 ? 'FAIL' : 'PASS',
            processingTime: totalTime,
            timestamp: new Date(),
            metadata: {
                imageSize: { width: 640, height: 640 },
                fileSize: imageFile.size,
                format: imageFile.type,
                backend: 'tensorflow-node',
                platform: 'aws-lambda',
                inferenceTime
            }
        }

        console.log(`✅ Backend detection completed in ${totalTime}ms`)
        console.log(`📊 Detected ${detections.length} defects`)

        return NextResponse.json(result)

    } catch (error) {
        console.error('❌ Backend detection failed:', error)

        return NextResponse.json(
            {
                error: 'Detection failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                serverSide: true,
                platform: 'aws-lambda'
            },
            { status: 500 }
        )
    }
}

function formatClassName(className: string): string {
    return className
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

function getSeverity(confidence: number): string {
    if (confidence >= 0.9) return 'CRITICAL'
    if (confidence >= 0.75) return 'HIGH'
    if (confidence >= 0.6) return 'MEDIUM'
    return 'LOW'
}

// Health check endpoint
export async function GET() {
    try {
        const model = modelCache

        return NextResponse.json({
            status: 'healthy',
            modelLoaded: !!model,
            backend: 'tensorflow-node',
            platform: 'aws-lambda',
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            modelUrl: process.env.MODEL_URL || process.env.NEXT_PUBLIC_TFJS_MODEL_URL
        })
    } catch (error) {
        return NextResponse.json(
            { status: 'unhealthy', error: String(error) },
            { status: 500 }
        )
    }
}
