// Upload API Demo - Shows how to use the file upload system

/**
 * This demo shows how to use the file upload API endpoints
 * for the AI NDT Defect Detection system
 */

// Example 1: Single file upload
async function uploadSingleFile(file: File) {
  const formData = new FormData();
  formData.append('files', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Upload successful:', result.data.uploaded[0]);
      return result.data.uploaded[0];
    } else {
      console.error('Upload failed:', result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Example 2: Batch file upload
async function uploadMultipleFiles(files: File[]) {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Successfully uploaded ${result.data.summary.successful} files`);
      if (result.data.failed.length > 0) {
        console.warn(`Failed to upload ${result.data.failed.length} files:`, result.data.failed);
      }
      return result.data.uploaded;
    } else {
      console.error('Batch upload failed:', result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Batch upload error:', error);
    throw error;
  }
}

// Example 3: Chunked upload for large files
async function uploadLargeFile(file: File, chunkSize: number = 1024 * 1024) {
  const fileId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const totalChunks = Math.ceil(file.size / chunkSize);

  try {
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const response = await fetch(`/api/upload?fileId=${fileId}&chunkIndex=${chunkIndex}&totalChunks=${totalChunks}`, {
        method: 'PUT',
        body: chunk
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Chunk ${chunkIndex} upload failed: ${result.error.message}`);
      }

      console.log(`Uploaded chunk ${chunkIndex + 1}/${totalChunks} (${result.data.progress?.toFixed(1)}%)`);

      if (result.data.status === 'completed') {
        console.log('Large file upload completed:', result.data);
        return result.data;
      }
    }
  } catch (error) {
    console.error('Large file upload error:', error);
    throw error;
  }
}

// Example 4: Check upload status
async function checkUploadStatus(fileId: string) {
  try {
    const response = await fetch(`/api/upload?fileId=${fileId}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
}

// Example 5: Delete uploaded file
async function deleteFile(filename: string) {
  try {
    const response = await fetch(`/api/files/${filename}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('File deleted successfully:', result.data);
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
}

// Example usage in a React component
export const UploadExamples = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadLargeFile,
  checkUploadStatus,
  deleteFile
};

// Usage example:
/*
// In a React component:
const handleFileUpload = async (files: FileList) => {
  const fileArray = Array.from(files);
  
  try {
    const uploadedFiles = await uploadMultipleFiles(fileArray);
    console.log('All files uploaded:', uploadedFiles);
    
    // Files are now available at their URLs for processing
    uploadedFiles.forEach(file => {
      console.log(`File available at: ${file.url}`);
    });
    
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
*/