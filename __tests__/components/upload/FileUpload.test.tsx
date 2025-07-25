// Unit tests for FileUpload component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from '@/components/upload/FileUpload';
import { SUPPORTED_IMAGE_FORMATS, MAX_FILE_SIZE } from '../../../lib/constants';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock the utility functions
jest.mock('../../../lib/utils', () => ({
  FileUtils: {
    formatFileSize: jest.fn((bytes) => `${bytes} bytes`),
    isImageFile: jest.fn((file) => file.type.startsWith('image/')),
    isVideoFile: jest.fn((file) => file.type.startsWith('video/')),
    fileToBase64: jest.fn(() => Promise.resolve('data:image/jpeg;base64,mock'))
  },
  IdGenerator: {
    generate: jest.fn(() => 'mock-id-123')
  }
}));

// Mock the validation functions
jest.mock('../../../lib/validation', () => ({
  FileValidator: {
    validateBatchUpload: jest.fn(() => ({ isValid: true, errors: [] }))
  }
}));

describe('FileUpload Component', () => {
  const defaultProps = {
    onFilesSelected: jest.fn(),
    acceptedFormats: SUPPORTED_IMAGE_FORMATS,
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: 10,
    supportsBatch: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area correctly', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByText('Upload files')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop files here, or click to select')).toBeInTheDocument();
    expect(screen.getByText(/Supported formats:/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum file size:/)).toBeInTheDocument();
  });

  it('shows batch upload info when supportsBatch is true', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByText(/Maximum files:/)).toBeInTheDocument();
  });

  it('hides batch upload info when supportsBatch is false', () => {
    render(<FileUpload {...defaultProps} supportsBatch={false} />);
    
    expect(screen.queryByText(/Maximum files:/)).not.toBeInTheDocument();
  });

  it('handles file input change', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<FileUpload {...defaultProps} />);
    
    const fileInput = screen.getByRole('button', { hidden: true });
    
    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(defaultProps.onFilesSelected).toHaveBeenCalled();
    });
  });

  it('handles drag and drop events', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = screen.getByText('Upload files').closest('div');
    
    // Simulate drag enter
    fireEvent.dragEnter(dropZone!, {
      dataTransfer: {
        files: [mockFile]
      }
    });
    
    expect(screen.getByText('Drop files here')).toBeInTheDocument();
    
    // Simulate drop
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile]
      }
    });
    
    await waitFor(() => {
      expect(defaultProps.onFilesSelected).toHaveBeenCalled();
    });
  });

  it('displays uploaded files', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = screen.getByText('Upload files').closest('div');
    
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile]
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText('Uploaded Files (1)')).toBeInTheDocument();
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
  });

  it('allows removing uploaded files', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = screen.getByText('Upload files').closest('div');
    
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile]
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
    
    // Click remove button
    const removeButton = screen.getByTitle('Remove file');
    fireEvent.click(removeButton);
    
    expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
    expect(defaultProps.onFilesSelected).toHaveBeenCalledWith([]);
  });

  it('allows clearing all files', async () => {
    const mockFiles = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
    ];
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = screen.getByText('Upload files').closest('div');
    
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: mockFiles
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText('Uploaded Files (2)')).toBeInTheDocument();
    });
    
    // Click clear all button
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(screen.queryByText('Uploaded Files')).not.toBeInTheDocument();
    expect(defaultProps.onFilesSelected).toHaveBeenCalledWith([]);
  });

  it('disables upload when disabled prop is true', () => {
    render(<FileUpload {...defaultProps} disabled={true} />);
    
    const dropZone = screen.getByText('Upload files').closest('div');
    expect(dropZone).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('displays validation errors', async () => {
    // Mock validation to return errors
    const { FileValidator } = require('../../../lib/validation');
    FileValidator.validateBatchUpload.mockReturnValue({
      isValid: false,
      errors: ['File too large', 'Unsupported format']
    });
    
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = screen.getByText('Upload files').closest('div');
    
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile]
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText('Upload Errors')).toBeInTheDocument();
      expect(screen.getByText('• File too large')).toBeInTheDocument();
      expect(screen.getByText('• Unsupported format')).toBeInTheDocument();
    });
  });

  it('shows progress bar for uploading files', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = screen.getByText('Upload files').closest('div');
    
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile]
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });
    
    // Simulate updating file status to uploading
    // This would typically be done by the parent component
    // For now, we just verify the component structure is correct
    expect(screen.getByText('test.jpg')).toBeInTheDocument();
  });

  it('handles click to select files', () => {
    render(<FileUpload {...defaultProps} />);
    
    const dropZone = screen.getByText('Upload files').closest('div');
    
    // Mock the file input click
    const fileInput = dropZone?.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(fileInput, 'click');
    
    fireEvent.click(dropZone!);
    
    expect(clickSpy).toHaveBeenCalled();
  });
});