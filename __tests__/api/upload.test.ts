// Integration tests for upload API

import { NextRequest } from 'next/server';
import { POST, PUT, GET } from '@/app/api/upload/route';
import { existsSync } from 'fs';
import { unlink, rmdir } from 'fs/promises';
import path from 'path';

// Mock the file system operations for testing
jest.mock('fs/promises');
jest.mock('fs');

const mockWriteFile = jest.mocked(require('fs/promises').writeFile);
const mockMkdir = jest.mocked(require('fs/promises').mkdir);
const mockExistsSync = jest.mocked(existsSync);

describe('/api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
    mockWriteFile.mockResolvedValue(undefined);
    mockMkdir.mockResolvedValue(undefined);
  });

  describe('POST /api/upload', () => {
    it('should upload files successfully', async () => {
      const formData = new FormData();
      const file1 = new File(['test content 1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test content 2'], 'test2.png', { type: 'image/png' });
      
      formData.append('files', file1);
      formData.append('files', file2);

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.uploaded).toHaveLength(2);
      expect(data.data.summary.total).toBe(2);
      expect(data.data.summary.successful).toBe(2);
      expect(data.data.summary.failed).toBe(0);
    });

    it('should return error when no files provided', async () => {
      const formData = new FormData();
      
      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NO_FILES');
    });

    it('should handle file validation errors', async () => {
      // Mock validation to return errors
      const mockValidation = jest.fn().mockReturnValue({
        isValid: false,
        errors: ['File too large', 'Unsupported format']
      });

      jest.doMock('../../../lib/validation', () => ({
        FileValidator: {
          validateBatchUpload: mockValidation
        }
      }));

      const formData = new FormData();
      const file = new File(['x'.repeat(100 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
      formData.append('files', file);

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toEqual(['File too large', 'Unsupported format']);
    });

    it('should handle file write errors gracefully', async () => {
      mockWriteFile.mockRejectedValueOnce(new Error('Disk full'));

      const formData = new FormData();
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('files', file);

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.data.failed).toHaveLength(1);
      expect(data.data.failed[0].error).toBe('Failed to upload file');
    });
  });

  describe('PUT /api/upload (chunked upload)', () => {
    it('should handle chunk upload', async () => {
      const chunkData = new ArrayBuffer(1024);
      const request = new NextRequest('http://localhost:3000/api/upload?fileId=test-123&chunkIndex=0&totalChunks=3', {
        method: 'PUT',
        body: chunkData
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('chunk_uploaded');
      expect(data.data.chunkIndex).toBe(0);
    });

    it('should combine chunks on final upload', async () => {
      // Mock reading chunk files
      const mockReadFile = jest.fn()
        .mockResolvedValueOnce(Buffer.from('chunk1'))
        .mockResolvedValueOnce(Buffer.from('chunk2'))
        .mockResolvedValueOnce(Buffer.from('chunk3'));

      const mockUnlink = jest.fn().mockResolvedValue(undefined);

      jest.doMock('fs', () => ({
        promises: {
          readFile: mockReadFile,
          unlink: mockUnlink
        }
      }));

      const chunkData = new ArrayBuffer(1024);
      const request = new NextRequest('http://localhost:3000/api/upload?fileId=test-123&chunkIndex=2&totalChunks=3', {
        method: 'PUT',
        body: chunkData
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('completed');
    });

    it('should return error when fileId is missing', async () => {
      const chunkData = new ArrayBuffer(1024);
      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'PUT',
        body: chunkData
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MISSING_FILE_ID');
    });
  });

  describe('GET /api/upload (upload status)', () => {
    it('should return completed status for existing file', async () => {
      mockExistsSync.mockReturnValue(true);
      
      const mockStat = jest.fn().mockResolvedValue({
        size: 1024,
        birthtime: new Date('2023-01-01T00:00:00Z')
      });

      jest.doMock('fs', () => ({
        promises: {
          stat: mockStat
        }
      }));

      const request = new NextRequest('http://localhost:3000/api/upload?fileId=test-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('completed');
      expect(data.data.size).toBe(1024);
    });

    it('should return uploading status for partial chunks', async () => {
      mockExistsSync.mockReturnValue(false);
      
      const mockReaddir = jest.fn().mockResolvedValue([
        'test-123.chunk.0',
        'test-123.chunk.1'
      ]);

      jest.doMock('fs', () => ({
        promises: {
          readdir: mockReaddir
        }
      }));

      const request = new NextRequest('http://localhost:3000/api/upload?fileId=test-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('uploading');
      expect(data.data.chunksUploaded).toBe(2);
    });

    it('should return not found for non-existent file', async () => {
      mockExistsSync.mockReturnValue(false);
      
      const mockReaddir = jest.fn().mockResolvedValue([]);

      jest.doMock('fs', () => ({
        promises: {
          readdir: mockReaddir
        }
      }));

      const request = new NextRequest('http://localhost:3000/api/upload?fileId=non-existent');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FILE_NOT_FOUND');
    });

    it('should return error when fileId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/upload');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MISSING_FILE_ID');
    });
  });
});