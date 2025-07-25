// File serving API endpoint

import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { FileUtils } from '@/lib/utils';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');
const PROCESSED_DIR = path.join(UPLOAD_DIR, 'processed');

type RouteParams = {
  params: { filename: string };
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = params;
    
    if (!filename) {
      return NextResponse.json(
        { success: false, error: { message: 'Filename required', code: 'MISSING_FILENAME' } },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    
    // Check in temp directory first
    let filePath = path.join(TEMP_DIR, sanitizedFilename);
    
    if (!existsSync(filePath)) {
      // Check in processed directory
      filePath = path.join(PROCESSED_DIR, sanitizedFilename);
      
      if (!existsSync(filePath)) {
        return NextResponse.json(
          { success: false, error: { message: 'File not found', code: 'FILE_NOT_FOUND' } },
          { status: 404 }
        );
      }
    }

    // Get file stats
    const fileStats = await stat(filePath);
    const fileBuffer = await readFile(filePath);

    // Determine content type based on file extension
    const extension = FileUtils.getFileExtension(sanitizedFilename).toLowerCase();
    let contentType = 'application/octet-stream';

    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff',
      'tif': 'image/tiff',
      'webp': 'image/webp',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      'webm': 'video/webm',
      'pdf': 'application/pdf',
      'json': 'application/json',
      'csv': 'text/csv',
      'txt': 'text/plain'
    };

    if (mimeTypes[extension]) {
      contentType = mimeTypes[extension];
    }

    // Handle range requests for video files
    const range = request.headers.get('range');
    if (range && contentType.startsWith('video/')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileStats.size - 1;
      const chunkSize = (end - start) + 1;

      const chunk = fileBuffer.slice(start, end + 1);

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileStats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
          'Last-Modified': fileStats.mtime.toUTCString(),
          'ETag': `"${fileStats.size}-${fileStats.mtime.getTime()}"`
        }
      });
    }

    // Regular file serving
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStats.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Last-Modified': fileStats.mtime.toUTCString(),
        'ETag': `"${fileStats.size}-${fileStats.mtime.getTime()}"`
      }
    });

  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to serve file', 
          code: 'FILE_SERVE_ERROR' 
        } 
      },
      { status: 500 }
    );
  }
}

// Delete file endpoint
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = params;
    
    if (!filename) {
      return NextResponse.json(
        { success: false, error: { message: 'Filename required', code: 'MISSING_FILENAME' } },
        { status: 400 }
      );
    }

    const sanitizedFilename = path.basename(filename);
    
    // Check both directories
    const tempPath = path.join(TEMP_DIR, sanitizedFilename);
    const processedPath = path.join(PROCESSED_DIR, sanitizedFilename);

    let deleted = false;

    if (existsSync(tempPath)) {
      await import('fs').then(fs => fs.promises.unlink(tempPath));
      deleted = true;
    }

    if (existsSync(processedPath)) {
      await import('fs').then(fs => fs.promises.unlink(processedPath));
      deleted = true;
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { message: 'File not found', code: 'FILE_NOT_FOUND' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        filename: sanitizedFilename,
        deleted: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Failed to delete file', 
          code: 'FILE_DELETE_ERROR' 
        } 
      },
      { status: 500 }
    );
  }
}

// Get file metadata
export async function HEAD(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = params;
    
    if (!filename) {
      return new NextResponse(null, { status: 400 });
    }

    const sanitizedFilename = path.basename(filename);
    
    // Check in temp directory first
    let filePath = path.join(TEMP_DIR, sanitizedFilename);
    
    if (!existsSync(filePath)) {
      // Check in processed directory
      filePath = path.join(PROCESSED_DIR, sanitizedFilename);
      
      if (!existsSync(filePath)) {
        return new NextResponse(null, { status: 404 });
      }
    }

    const fileStats = await stat(filePath);
    const extension = FileUtils.getFileExtension(sanitizedFilename).toLowerCase();
    
    let contentType = 'application/octet-stream';
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime'
    };

    if (mimeTypes[extension]) {
      contentType = mimeTypes[extension];
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStats.size.toString(),
        'Last-Modified': fileStats.mtime.toUTCString(),
        'ETag': `"${fileStats.size}-${fileStats.mtime.getTime()}"`,
        'Accept-Ranges': 'bytes'
      }
    });

  } catch (error) {
    console.error('File metadata error:', error);
    return new NextResponse(null, { status: 500 });
  }
}