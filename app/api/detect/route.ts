import { NextRequest, NextResponse } from 'next/server';

// Generate realistic AI-powered mock detections for demo
function generateRealisticDetections(imageData: string) {
  // Simulate processing time
  const processingTime = Math.random() * 500 + 800; // 800-1300ms
  
  // Generate 0-4 defects randomly (realistic distribution)
  const numDefects = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 3) + 1;
  
  const defectTypes = [
    { className: 'crack', confidence: [0.75, 0.95] },
    { className: 'corrosion', confidence: [0.70, 0.90] },
    { className: 'deformation', confidence: [0.65, 0.88] },
    { className: 'void', confidence: [0.72, 0.92] },
    { className: 'surface_defect', confidence: [0.68, 0.85] }
  ];
  
  const detections = [];
  
  for (let i = 0; i < numDefects; i++) {
    const defectType = defectTypes[Math.floor(Math.random() * defectTypes.length)];
    const [minConf, maxConf] = defectType.confidence;
    const confidence = Math.random() * (maxConf - minConf) + minConf;
    
    // Generate realistic bounding box coordinates
    const x = Math.random() * 400 + 50;
    const y = Math.random() * 300 + 50;
    const w = Math.random() * 150 + 80;
    const h = Math.random() * 120 + 60;
    
    detections.push({
      bbox: [x, y, w, h],
      confidence: parseFloat(confidence.toFixed(3)),
      classId: i,
      className: defectType.className
    });
  }
  
  return { detections, processingTime };
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Simulate AI processing delay for realism
    const { detections, processingTime } = generateRealisticDetections(image);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    console.log(`✅ AI Detection complete: ${detections.length} defects found in ${processingTime.toFixed(0)}ms`);
    
    return NextResponse.json({ 
      detections,
      model: 'YOLOv8-Defect-Detector',
      processingTime: Math.round(processingTime),
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Detection API error:', error);
    return NextResponse.json({ 
      error: 'Detection failed',
      detections: []
    }, { status: 500 });
  }
}
