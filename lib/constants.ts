// Application constants

import { DefectType } from '../types';

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/tiff',
  'image/bmp'
];

export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/quicktime'
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_BATCH_SIZE = 100;
export const MAX_VIDEO_BATCH_SIZE = 10;

export const DEFAULT_CONFIDENCE_THRESHOLD = 0.5;
export const DEFAULT_SENSITIVITY = 0.7;

export const PROCESSING_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const DEFECT_DESCRIPTIONS = {
  [DefectType.CRACK]: 'Linear discontinuity in the material structure',
  [DefectType.CORROSION]: 'Chemical deterioration of material surface',
  [DefectType.DEFORMATION]: 'Permanent change in shape or structure',
  [DefectType.SURFACE_IRREGULARITY]: 'Abnormal surface texture or finish',
  [DefectType.INCLUSION]: 'Foreign material embedded in the component',
  [DefectType.VOID]: 'Empty space or cavity within the material',
  [DefectType.DIMENSIONAL_VARIANCE]: 'Deviation from specified dimensions'
} as Record<DefectType, string>;

export const SEVERITY_THRESHOLDS = {
  low: { min: 0.5, max: 0.65 },
  medium: { min: 0.65, max: 0.8 },
  high: { min: 0.8, max: 0.9 },
  critical: { min: 0.9, max: 1.0 }
};

export const COMPONENT_TYPES = [
  {
    id: 'casting',
    name: 'Metal Casting',
    description: 'Cast metal components',
    materialType: 'metal',
    commonDefects: ['crack', 'void', 'inclusion', 'surface_irregularity']
  },
  {
    id: 'welded',
    name: 'Welded Joint',
    description: 'Welded metal joints and seams',
    materialType: 'metal',
    commonDefects: ['crack', 'void', 'deformation']
  },
  {
    id: 'machined',
    name: 'Machined Part',
    description: 'Precision machined components',
    materialType: 'metal',
    commonDefects: ['dimensional_variance', 'surface_irregularity']
  },
  {
    id: 'composite',
    name: 'Composite Material',
    description: 'Fiber-reinforced composite parts',
    materialType: 'composite',
    commonDefects: ['delamination', 'void', 'fiber_breakage']
  }
];