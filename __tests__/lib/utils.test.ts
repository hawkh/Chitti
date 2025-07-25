import { IdGenerator, DateUtils, DefectUtils, FileUtils, MathUtils } from '@/lib/utils';
import { DefectType, DefectSeverity } from '@/types';

describe('IdGenerator', () => {
  it('should generate unique IDs', () => {
    const id1 = IdGenerator.generate();
    const id2 = IdGenerator.generate();
    
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });

  it('should generate job IDs with correct prefix', () => {
    const jobId = IdGenerator.generateJobId();
    expect(jobId).toMatch(/^job-/);
  });

  it('should generate result IDs with correct prefix', () => {
    const resultId = IdGenerator.generateResultId();
    expect(resultId).toMatch(/^result-/);
  });

  it('should generate report IDs with correct prefix', () => {
    const reportId = IdGenerator.generateReportId();
    expect(reportId).toMatch(/^report-/);
  });
});

describe('DateUtils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25T10:30:00');
      const formatted = DateUtils.formatDate(date);
      
      expect(formatted).toMatch(/Dec 25, 2023/);
      expect(formatted).toMatch(/10:30/);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(DateUtils.formatDuration(5000)).toBe('5s');
    });

    it('should format minutes and seconds correctly', () => {
      expect(DateUtils.formatDuration(125000)).toBe('2m 5s');
    });

    it('should format hours, minutes and seconds correctly', () => {
      expect(DateUtils.formatDuration(3725000)).toBe('1h 2m 5s');
    });
  });

  describe('getRelativeTime', () => {
    it('should return "Just now" for recent dates', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 30000); // 30 seconds ago
      
      expect(DateUtils.getRelativeTime(recent)).toBe('Just now');
    });

    it('should return minutes for dates within an hour', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      expect(DateUtils.getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });
  });
});

describe('DefectUtils', () => {
  describe('getDefectDescription', () => {
    it('should return correct description for known defect types', () => {
      expect(DefectUtils.getDefectDescription(DefectType.CRACK))
        .toBe('Linear discontinuity in the material structure');
    });

    it('should return default description for unknown defect types', () => {
      expect(DefectUtils.getDefectDescription('unknown' as DefectType))
        .toBe('Unknown defect type');
    });
  });

  describe('calculateSeverity', () => {
    it('should return LOW for low confidence', () => {
      expect(DefectUtils.calculateSeverity(0.6)).toBe(DefectSeverity.LOW);
    });

    it('should return MEDIUM for medium confidence', () => {
      expect(DefectUtils.calculateSeverity(0.7)).toBe(DefectSeverity.MEDIUM);
    });

    it('should return HIGH for high confidence', () => {
      expect(DefectUtils.calculateSeverity(0.85)).toBe(DefectSeverity.HIGH);
    });

    it('should return CRITICAL for very high confidence', () => {
      expect(DefectUtils.calculateSeverity(0.95)).toBe(DefectSeverity.CRITICAL);
    });
  });

  describe('calculateAffectedArea', () => {
    it('should calculate affected area percentage correctly', () => {
      const boundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const imageWidth = 1000;
      const imageHeight = 1000;
      
      const affectedArea = DefectUtils.calculateAffectedArea(boundingBox, imageWidth, imageHeight);
      
      expect(affectedArea).toBe(1); // 1% of the image
    });
  });

  describe('getSeverityColor', () => {
    it('should return correct colors for each severity level', () => {
      expect(DefectUtils.getSeverityColor(DefectSeverity.LOW)).toBe('#10B981');
      expect(DefectUtils.getSeverityColor(DefectSeverity.MEDIUM)).toBe('#F59E0B');
      expect(DefectUtils.getSeverityColor(DefectSeverity.HIGH)).toBe('#EF4444');
      expect(DefectUtils.getSeverityColor(DefectSeverity.CRITICAL)).toBe('#7C2D12');
    });
  });
});

describe('FileUtils', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(FileUtils.formatFileSize(0)).toBe('0 Bytes');
      expect(FileUtils.formatFileSize(1024)).toBe('1 KB');
      expect(FileUtils.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(FileUtils.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(FileUtils.formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      expect(FileUtils.getFileExtension('test.jpg')).toBe('jpg');
      expect(FileUtils.getFileExtension('document.pdf')).toBe('pdf');
      expect(FileUtils.getFileExtension('file.name.with.dots.txt')).toBe('txt');
    });

    it('should handle files without extension', () => {
      expect(FileUtils.getFileExtension('filename')).toBe('');
    });
  });

  describe('isImageFile', () => {
    it('should identify image files correctly', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      
      expect(FileUtils.isImageFile(imageFile)).toBe(true);
      expect(FileUtils.isImageFile(textFile)).toBe(false);
    });
  });

  describe('isVideoFile', () => {
    it('should identify video files correctly', () => {
      const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      
      expect(FileUtils.isVideoFile(videoFile)).toBe(true);
      expect(FileUtils.isVideoFile(textFile)).toBe(false);
    });
  });
});

describe('MathUtils', () => {
  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(MathUtils.clamp(5, 1, 10)).toBe(5);
      expect(MathUtils.clamp(-1, 1, 10)).toBe(1);
      expect(MathUtils.clamp(15, 1, 10)).toBe(10);
    });
  });

  describe('roundToDecimals', () => {
    it('should round to specified decimal places', () => {
      expect(MathUtils.roundToDecimals(3.14159, 2)).toBe(3.14);
      expect(MathUtils.roundToDecimals(3.14159, 4)).toBe(3.1416);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(MathUtils.calculatePercentage(25, 100)).toBe(25);
      expect(MathUtils.calculatePercentage(1, 3)).toBeCloseTo(33.33, 2);
    });

    it('should handle zero total', () => {
      expect(MathUtils.calculatePercentage(5, 0)).toBe(0);
    });
  });

  describe('calculateAverage', () => {
    it('should calculate average correctly', () => {
      expect(MathUtils.calculateAverage([1, 2, 3, 4, 5])).toBe(3);
      expect(MathUtils.calculateAverage([10, 20])).toBe(15);
    });

    it('should handle empty array', () => {
      expect(MathUtils.calculateAverage([])).toBe(0);
    });
  });
});