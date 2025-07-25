# File Upload API Documentation

The AI NDT Defect Detection system provides a comprehensive file upload API that supports single files, batch uploads, and chunked uploads for large files.

## API Endpoints

### POST /api/upload
Upload one or more files for defect detection analysis.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with files attached to the `files` field

**Response:**
```json
{
  "success": true,
  "data": {
    "uploaded": [
      {
        "id": "unique-file-id",
        "originalName": "component.jpg",
        "filename": "generated-unique-name.jpg",
        "path": "/uploads/temp/generated-unique-name.jpg",
        "size": 1024000,
        "type": "image/jpeg",
        "uploadedAt": "2023-12-01T10:00:00.000Z",
        "url": "/api/files/generated-unique-name.jpg"
      }
    ],
    "failed": [],
    "summary": {
      "total": 1,
      "successful": 1,
      "failed": 0
    }
  },
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### PUT /api/upload
Upload file chunks for large files.

**Request:**
- Method: `PUT`
- Query Parameters:
  - `fileId`: Unique identifier for the file
  - `chunkIndex`: Index of the current chunk (0-based)
  - `totalChunks`: Total number of chunks
- Body: Binary chunk data

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "chunk-file-id",
    "chunkIndex": 0,
    "status": "chunk_uploaded",
    "progress": 33.33
  }
}
```

### GET /api/upload
Check upload status for chunked uploads.

**Request:**
- Method: `GET`
- Query Parameters:
  - `fileId`: Unique identifier for the file

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "chunk-file-id",
    "status": "completed",
    "size": 3072000,
    "uploadedAt": "2023-12-01T10:00:00.000Z",
    "url": "/api/files/chunk-file-id.complete"
  }
}
```

### GET /api/files/[filename]
Serve uploaded files.

**Request:**
- Method: `GET`
- Path: `/api/files/{filename}`
- Headers: Optional `Range` header for video streaming

**Response:**
- Binary file data with appropriate Content-Type headers
- Supports range requests for video files
- Includes caching headers for performance

### DELETE /api/files/[filename]
Delete uploaded files.

**Request:**
- Method: `DELETE`
- Path: `/api/files/{filename}`

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "file.jpg",
    "deleted": true,
    "timestamp": "2023-12-01T10:00:00.000Z"
  }
}
```

### HEAD /api/files/[filename]
Get file metadata without downloading.

**Request:**
- Method: `HEAD`
- Path: `/api/files/{filename}`

**Response:**
- Headers only with file metadata
- Content-Type, Content-Length, Last-Modified, ETag

## Supported File Formats

### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- TIFF (.tiff, .tif)
- BMP (.bmp)

### Videos
- MP4 (.mp4)
- AVI (.avi)
- MOV (.mov)
- QuickTime (.mov)

## File Size Limits

- **Images**: 50MB per file
- **Videos**: 250MB per file (5x image limit)
- **Batch Upload**: Up to 100 images or 10 videos per request

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": ["Additional error details if applicable"]
  }
}
```

### Common Error Codes

- `NO_FILES`: No files provided in the request
- `VALIDATION_ERROR`: File validation failed (size, format, etc.)
- `MISSING_FILE_ID`: Required fileId parameter missing
- `FILE_NOT_FOUND`: Requested file does not exist
- `CHUNK_UPLOAD_ERROR`: Error during chunked upload
- `INTERNAL_ERROR`: Server-side error

## Security Features

- **Filename Sanitization**: Prevents directory traversal attacks
- **File Type Validation**: Only allows supported formats
- **Size Limits**: Prevents resource exhaustion
- **Temporary Storage**: Files stored in secure temporary directory
- **Path Validation**: Ensures files are served from allowed directories

## Usage Examples

See `examples/upload-demo.ts` for complete usage examples including:
- Single file upload
- Batch file upload
- Chunked upload for large files
- Upload status checking
- File deletion

## Integration with Frontend

The upload API is designed to work seamlessly with the FileUpload React component:

```typescript
import { FileUpload } from '../components/upload/FileUpload';

const MyComponent = () => {
  const handleFilesSelected = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    // Handle result...
  };

  return (
    <FileUpload
      onFilesSelected={handleFilesSelected}
      acceptedFormats={['image/jpeg', 'image/png']}
      maxFileSize={50 * 1024 * 1024}
      maxFiles={10}
      supportsBatch={true}
    />
  );
};
```

## Performance Considerations

- **Chunked Uploads**: Large files are automatically chunked for better performance
- **Caching**: Served files include appropriate cache headers
- **Range Requests**: Video files support partial content requests
- **Parallel Processing**: Batch uploads are processed efficiently
- **Memory Management**: Streaming approach prevents memory issues

## Directory Structure

```
uploads/
├── temp/           # Temporary uploaded files
└── processed/      # Files after AI processing
```

Files are initially stored in the `temp` directory and moved to `processed` after analysis.