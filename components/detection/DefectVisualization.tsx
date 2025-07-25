'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, Eye, EyeOff, X } from 'lucide-react';
import { DetectionResult, DefectSeverity } from '@/types';

interface DefectVisualizationProps {
  detectionResult: DetectionResult;
  showLabels?: boolean;
  showConfidence?: boolean;
  className?: string;
}

export const DefectVisualization: React.FC<DefectVisualizationProps> = ({
  detectionResult,
  showLabels = true,
  showConfidence = true,
  className = ''
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedDefect, setSelectedDefect] = useState<string | null>(null);

  const severityColors = {
    [DefectSeverity.LOW]: 'rgb(251, 191, 36)',      // Yellow
    [DefectSeverity.MEDIUM]: 'rgb(251, 146, 60)',   // Orange
    [DefectSeverity.HIGH]: 'rgb(239, 68, 68)',      // Red
    [DefectSeverity.CRITICAL]: 'rgb(127, 29, 29)'   // Dark red
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDefectClick = (defectId: string) => {
    setSelectedDefect(selectedDefect === defectId ? null : defectId);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Use a placeholder image if no image URL is available
  const imageUrl = detectionResult.originalImageUrl || detectionResult.imageUrl || '/placeholder-image.jpg';

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="bg-white rounded-lg shadow-lg p-1 flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-gray-300" />
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title={showOverlay ? 'Hide overlay' : 'Show overlay'}
          >
            {showOverlay ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-lg px-3 py-1 text-sm">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Image container */}
      <div
        className="relative w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ height: '600px' }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.2s'
          }}
        >
          <div className="relative">
            <img
              src={imageUrl}
              alt="Detection result"
              className="max-w-full max-h-full"
              draggable={false}
              onError={(e) => {
                // Fallback to a placeholder if image fails to load
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
              }}
            />

            {/* Defect overlays */}
            {showOverlay && detectionResult.detectedDefects.map(defect => (
              <DefectOverlay
                key={defect.id}
                defect={defect}
                imageSize={detectionResult.metadata?.imageSize || { width: 1000, height: 1000 }}
                isSelected={selectedDefect === defect.id}
                showLabel={showLabels}
                showConfidence={showConfidence}
                onClick={() => handleDefectClick(defect.id)}
                color={severityColors[defect.severity]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Defect details panel */}
      {selectedDefect && (
        <DefectDetailsPanel
          defect={detectionResult.detectedDefects.find(d => d.id === selectedDefect)!}
          onClose={() => setSelectedDefect(null)}
        />
      )}
    </div>
  );
}

interface DefectOverlayProps {
  defect: any;
  imageSize: { width: number; height: number };
  isSelected: boolean;
  showLabel: boolean;
  showConfidence: boolean;
  onClick: () => void;
  color: string;
}

const DefectOverlay: React.FC<DefectOverlayProps> = ({
  defect,
  imageSize,
  isSelected,
  showLabel,
  showConfidence,
  onClick,
  color
}) => {
  const { x, y, width, height } = defect.boundingBox;

  // Convert to percentage for responsive scaling
  const style = {
    left: `${(x / imageSize.width) * 100}%`,
    top: `${(y / imageSize.height) * 100}%`,
    width: `${(width / imageSize.width) * 100}%`,
    height: `${(height / imageSize.height) * 100}%`,
    borderColor: color,
    borderWidth: isSelected ? '3px' : '2px',
    boxShadow: isSelected ? `0 0 0 2px ${color}40` : 'none'
  };

  return (
    <div
      className="absolute border-2 cursor-pointer transition-all hover:opacity-80"
      style={style}
      onClick={onClick}
    >
      {(showLabel || showConfidence) && (
        <div
          className="absolute -top-6 left-0 text-xs font-medium px-2 py-1 rounded whitespace-nowrap"
          style={{ backgroundColor: color, color: 'white' }}
        >
          {showLabel && defect.defectType.name}
          {showLabel && showConfidence && ' - '}
          {showConfidence && `${Math.round(defect.confidence * 100)}%`}
        </div>
      )}
    </div>
  );
};

interface DefectDetailsPanelProps {
  defect: any;
  onClose: () => void;
}

const DefectDetailsPanel: React.FC<DefectDetailsPanelProps> = ({ defect, onClose }) => {
  const getSeverityColor = (severity: DefectSeverity) => {
    switch (severity) {
      case DefectSeverity.LOW:
        return 'bg-yellow-100 text-yellow-800';
      case DefectSeverity.MEDIUM:
        return 'bg-orange-100 text-orange-800';
      case DefectSeverity.HIGH:
        return 'bg-red-100 text-red-800';
      case DefectSeverity.CRITICAL:
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-20 bg-white rounded-lg shadow-xl p-4 max-w-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{defect.defectType.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Severity:</span>
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(defect.severity)}`}>
            {defect.severity.toUpperCase()}
          </span>
        </div>
        <div>
          <span className="font-medium">Confidence:</span>
          <span className="ml-2">{Math.round(defect.confidence * 100)}%</span>
        </div>
        <div>
          <span className="font-medium">Category:</span>
          <span className="ml-2 capitalize">{defect.defectType.category}</span>
        </div>
        <div>
          <p className="font-medium mb-1">Description:</p>
          <p className="text-gray-600">{defect.defectType.description}</p>
        </div>
        <div>
          <p className="font-medium mb-1">Location:</p>
          <p className="text-gray-600">
            x: {Math.round(defect.boundingBox.x)}, y: {Math.round(defect.boundingBox.y)}<br />
            {Math.round(defect.boundingBox.width)} × {Math.round(defect.boundingBox.height)} px
          </p>
        </div>
      </div>
    </div>
  );
};