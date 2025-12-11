// Quick test script for detection API
// Run with: node test-detection.js

const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testDetection() {
  console.log('🧪 Testing detection API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: testImage })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Detection API working!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      
      if (data.demo_mode) {
        console.log('\n⚠️  Running in DEMO MODE (mock detections)');
        console.log('💡 To use real AI, deploy Python backend and set PYTHON_BACKEND_URL');
      } else {
        console.log('\n🚀 Using real AI detection!');
      }
    } else {
      console.log('❌ Detection API failed');
      console.log('Error:', data);
    }
  } catch (error) {
    console.log('❌ Failed to connect to API');
    console.log('Error:', error.message);
    console.log('\n💡 Make sure the dev server is running: npm run dev');
  }
}

testDetection();
