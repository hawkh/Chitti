import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/audit/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const auditId = formData.get('auditId') as string;
    const itemId = formData.get('itemId') as string;
    const responseId = formData.get('responseId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!auditId) {
      return NextResponse.json({ error: 'Audit ID required' }, { status: 400 });
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });
    }

    // Determine file type
    const mimeType = file.type;
    let fileType: 'PHOTO' | 'VIDEO' | 'DOCUMENT';

    if (mimeType.startsWith('image/')) {
      fileType = 'PHOTO';
    } else if (mimeType.startsWith('video/')) {
      fileType = 'VIDEO';
    } else if (mimeType === 'application/pdf' || mimeType.includes('document')) {
      fileType = 'DOCUMENT';
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'evidence', auditId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${itemId}-${timestamp}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generate URL
    const url = `/uploads/evidence/${auditId}/${filename}`;

    // TODO: Generate thumbnail for images (would require image processing library)
    const thumbnailUrl = fileType === 'PHOTO' ? url : null;

    // Save to database
    const evidence = await prisma.evidenceRecord.create({
      data: {
        auditId,
        responseId,
        filename,
        originalName: file.name,
        fileType,
        url,
        thumbnailUrl,
        fileSize: file.size,
        metadata: {
          mimeType,
          uploadedBy: decoded.userId,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      evidence: {
        id: evidence.id,
        filename: evidence.filename,
        fileType: evidence.fileType,
        url: evidence.url,
        thumbnailUrl: evidence.thumbnailUrl,
        fileSize: evidence.fileSize,
        uploadedAt: evidence.uploadedAt
      }
    });
  } catch (error) {
    console.error('Error uploading evidence:', error);
    return NextResponse.json(
      { error: 'Failed to upload evidence' },
      { status: 500 }
    );
  }
}
