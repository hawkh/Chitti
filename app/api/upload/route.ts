// File upload API endpoint

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { FileValidator } from '@/lib/validation';
import { IdGenerator, FileUtils } from '@/lib/utils';
import { SUPPORTED_IMAGE_FORMATS, SUPPORTED_VIDEO_FORMATS } from '@/lib/constants';
import { prisma } from '@/lib/database';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');

// Ensure upload directories exist
async function ensureUploadDirs() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDirs();

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'No files provided', code: 'NO_FILES' } },
        { status: 400 }
      );
    }

    // Validate all files
    const validationResult = FileValidator.validateBatchUpload(files);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'File validation failed', 
            code: 'VALIDATION_ERROR',
            details: validationResult.errors
          } 
        },
        { status: 400 }
      );
    }

    const uploadResults = [];

    // Create detection job
    const job = await prisma.detectionJob.create({
      data: {
        userId: 'default-user',
        status: 'QUEUED',
        config: {},
        totalFiles: files.length,
      },
    });

    for (const file of files) {
      try {
        const fileExtension = FileUtils.getFileExtension(file.name);
        const uniqueFilename = `${IdGenerator.generate()}.${fileExtension}`;
        const filePath = path.join(TEMP_DIR, uniqueFilename);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Save to database
        const dbFile = await prisma.detectionFile.create({
          data: {
            jobId: job.id,
            originalName: file.name,
            filename: uniqueFilename,
            filePath,
            fileSize: file.size,
            mimeType: file.type,
            status: 'PENDING',
          },
        });

        const fileInfo = {
          id: dbFile.id,
          originalName: file.name,
          filename: uniqueFilename,
          path: filePath,
          size: file.size,
          type: file.type,
          uploadedAt: dbFile.uploadedAt.toISOString(),
          url: `/api/files/${uniqueFilename}`,
          jobId: job.id,
        };

        uploadResults.push(fileInfo);

      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        uploadResults.push({
          originalName: file.name,
          error: 'Failed to upload file',
          success: false
        });
      }
    }

    // Check if any uploads failed
    const failedUploads = uploadResults.filter(result => 'error' in result);
    const successfulUploads = uploadResults.filter(result => !('error' in result));

    return NextResponse.json({
      success: failedUploads.length === 0,
      data: {
        uploaded: successfulUploads,
        failed: failedUploads,
        summary: {
          total: files.length,
          successful: successfulUploads.length,
          failed: failedUploads.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Internal server error', 
          code: 'INTERNAL_ERROR' 
        } 
      },
      { status: 500 }
    );
  }
}

// Handle file upload progress (for large files)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const chunkIndex = parseInt(searchParams.get('chunkIndex') || '0');
    const totalChunks = parseInt(searchParams.get('totalChunks') || '1');

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: { message: 'File ID required', code: 'MISSING_FILE_ID' } },
        { status: 400 }
      );
    }

    await ensureUploadDirs();

    const chunk = await request.arrayBuffer();
    const chunkBuffer = Buffer.from(chunk);
    
    // Save chunk to temporary location
    const chunkPath = path.join(TEMP_DIR, `${fileId}.chunk.${chunkIndex}`);
    await writeFile(chunkPath, chunkBuffer);

    // If this is the last chunk, combine all chunks
    if (chunkIndex === totalChunks - 1) {
      const finalPath = path.join(TEMP_DIR, `${fileId}.complete`);
      const chunks = [];

      // Read all chunks in order
      for (let i = 0; i < totalChunks; i++) {
        const chunkFilePath = path.join(TEMP_DIR, `${fileId}.chunk.${i}`);
        const chunkData = await import('fs').then(fs => fs.promises.readFile(chunkFilePath));
        chunks.push(chunkData);
      }

      // Combine chunks
      const finalBuffer = Buffer.concat(chunks);
      await writeFile(finalPath, finalBuffer);

      // Clean up chunk files
      for (let i = 0; i < totalChunks; i++) {
        const chunkFilePath = path.join(TEMP_DIR, `${fileId}.chunk.${i}`);
        await import('fs').then(fs => fs.promises.unlink(chunkFilePath).catch(() => {}));
      }

      return NextResponse.json({
        success: true,
        data: {
          fileId,
          status: 'completed',
          path: finalPath,
          url: `/api/files/${fileId}.complete`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        fileId,
        chunkIndex,
        status: 'chunk_uploaded',
        progress: ((chunkIndex + 1) / totalChunks) * 100
      }
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Chunk upload failed', 
          code: 'CHUNK_UPLOAD_ERROR' 
        } 
      },
      { status: 500 }
    );
  }
}

// Get upload status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: { message: 'File ID required', code: 'MISSING_FILE_ID' } },
        { status: 400 }
      );
    }

    // Check if file exists in temp directory
    const tempPath = path.join(TEMP_DIR, `${fileId}.complete`);
    const exists = existsSync(tempPath);

    if (exists) {
      const stats = await import('fs').then(fs => fs.promises.stat(tempPath));
      return NextResponse.json({
        success: true,
        data: {
          fileId,
          status: 'completed',
          size: stats.size,
          uploadedAt: stats.birthtime.toISOString(),
          url: `/api/files/${fileId}.complete`
        }
      });
    }

    // Check for partial chunks
    const chunkFiles = await import('fs').then(fs => 
      fs.promises.readdir(TEMP_DIR).then(files => 
        files.filter(file => file.startsWith(`${fileId}.chunk.`))
      )
    );

    if (chunkFiles.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          fileId,
          status: 'uploading',
          chunksUploaded: chunkFiles.length
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: { message: 'File not found', code: 'FILE_NOT_FOUND' }
    }, { status: 404 });

  } catch (error) {
    console.error('Upload status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to get upload status', 
          code: 'STATUS_ERROR' 
        } 
      },
      { status: 500 }
    );
  }
}