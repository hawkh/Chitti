const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    const user = await prisma.user.upsert({
      where: { email: 'admin@chitti.ai' },
      update: {},
      create: {
        email: 'admin@chitti.ai',
        name: 'System Administrator'
      }
    });
    console.log('✓ Default user created');

    const modelInfo = await prisma.modelInfo.upsert({
      where: { name: 'YOLO Defect Detector v1' },
      update: {},
      create: {
        name: 'YOLO Defect Detector v1',
        version: '1.0.0',
        description: 'Production YOLO model for defect detection',
        modelPath: '/app/models/yolo-v1/model.json',
        weightsPath: '/app/models/yolo-v1/weights.bin',
        configPath: '/app/models/yolo-v1/config.json',
        inputSize: { width: 640, height: 640 },
        classNames: ['crack', 'corrosion', 'deformation', 'surface_irregularity', 'inclusion', 'void'],
        accuracy: 0.92
      }
    });
    console.log('✓ Default model info created');

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function setupDirectories() {
  console.log('Setting up directories...');
  
  const directories = [
    'uploads',
    'uploads/temp',
    'models',
    'models/yolo-v1',
    'logs'
  ];

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Chitti AI NDT setup...\n');
  
  await setupDirectories();
  await setupDatabase();
  
  console.log('\n✅ Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Place your YOLO model files in ./models/yolo-v1/');
  console.log('2. Update environment variables in .env.local');
  console.log('3. Run: npm run dev');
}

main().catch(console.error);