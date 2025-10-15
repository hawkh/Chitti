import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default user
  const user = await prisma.user.upsert({
    where: { email: 'admin@chitti.ai' },
    update: {},
    create: {
      id: 'default-user',
      email: 'admin@chitti.ai',
      name: 'Admin User',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
    },
  });

  console.log('✓ Created default user:', user.email);

  // Create default profiles
  const metalProfile = await prisma.componentProfile.upsert({
    where: { name: 'Default Metal Profile' },
    update: {},
    create: {
      name: 'Default Metal Profile',
      materialType: 'METAL',
      criticalDefects: ['CRACK', 'CORROSION', 'DEFORMATION'],
      defaultSensitivity: 0.7,
      qualityStandards: ['ISO 9001', 'ASTM E165'],
      customParameters: {},
    },
  });

  const plasticProfile = await prisma.componentProfile.upsert({
    where: { name: 'Default Plastic Profile' },
    update: {},
    create: {
      name: 'Default Plastic Profile',
      materialType: 'PLASTIC',
      criticalDefects: ['CRACK', 'DEFORMATION'],
      defaultSensitivity: 0.6,
      qualityStandards: ['ASTM D638', 'ISO 527'],
      customParameters: {},
    },
  });

  console.log('✓ Created default profiles');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
