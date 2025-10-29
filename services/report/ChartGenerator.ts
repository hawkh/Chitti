import { DetectionResult } from '@/types';

export class ChartGenerator {
  generateDefectDistributionChart(
    defectDistribution: Record<string, number>,
    width: number = 400,
    height: number = 300
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const entries = Object.entries(defectDistribution);
    if (entries.length === 0) return canvas.toDataURL();

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const total = entries.reduce((sum, [, count]) => sum + count, 0);

    // Draw pie chart
    let startAngle = 0;
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const radius = Math.min(width, height) / 3;

    entries.forEach(([type, count], index) => {
      const sliceAngle = (count / total) * 2 * Math.PI;
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw label
      const labelAngle = startAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
      
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${type}: ${count}`, labelX, labelY);

      startAngle += sliceAngle;
    });

    // Title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Defect Distribution', width / 2, 20);

    return canvas.toDataURL();
  }

  generateSeverityDistributionChart(
    severityDistribution: Record<string, number>,
    width: number = 400,
    height: number = 300
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const entries = Object.entries(severityDistribution);
    if (entries.length === 0) return canvas.toDataURL();

    const severityColors: Record<string, string> = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#f59e0b',
      low: '#84cc16',
      info: '#3b82f6'
    };

    const maxCount = Math.max(...entries.map(([, count]) => count));
    const barWidth = (width - 100) / entries.length;
    const chartHeight = height - 80;

    // Draw bars
    entries.forEach(([severity, count], index) => {
      const barHeight = (count / maxCount) * chartHeight;
      const x = 50 + index * barWidth;
      const y = height - 50 - barHeight;

      ctx.fillStyle = severityColors[severity.toLowerCase()] || '#6b7280';
      ctx.fillRect(x, y, barWidth - 10, barHeight);

      // Draw value on top
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(count.toString(), x + barWidth / 2 - 5, y - 5);

      // Draw label
      ctx.save();
      ctx.translate(x + barWidth / 2 - 5, height - 30);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.fillText(severity, 0, 0);
      ctx.restore();
    });

    // Title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Severity Distribution', width / 2, 20);

    // Y-axis
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(45, 40);
    ctx.lineTo(45, height - 50);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(45, height - 50);
    ctx.lineTo(width - 20, height - 50);
    ctx.stroke();

    return canvas.toDataURL();
  }

  generateConfidenceDistributionChart(
    results: DetectionResult[],
    width: number = 400,
    height: number = 300
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const allDefects = results.flatMap(r => r.detectedDefects || r.defects || []);
    if (allDefects.length === 0) return canvas.toDataURL();

    // Create bins for confidence ranges
    const bins = [0, 0, 0, 0, 0]; // 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
    allDefects.forEach(defect => {
      const binIndex = Math.min(Math.floor(defect.confidence * 5), 4);
      bins[binIndex]++;
    });

    const maxCount = Math.max(...bins);
    const barWidth = (width - 100) / bins.length;
    const chartHeight = height - 80;

    // Draw bars
    bins.forEach((count, index) => {
      const barHeight = maxCount > 0 ? (count / maxCount) * chartHeight : 0;
      const x = 50 + index * barWidth;
      const y = height - 50 - barHeight;

      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, y, barWidth - 10, barHeight);

      // Draw value
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(count.toString(), x + barWidth / 2 - 5, y - 5);

      // Draw label
      const label = `${index * 20}-${(index + 1) * 20}%`;
      ctx.fillText(label, x + barWidth / 2 - 5, height - 30);
    });

    // Title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Confidence Distribution', width / 2, 20);

    // Axes
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(45, 40);
    ctx.lineTo(45, height - 50);
    ctx.lineTo(width - 20, height - 50);
    ctx.stroke();

    return canvas.toDataURL();
  }

  generateProcessingTimeChart(
    results: DetectionResult[],
    width: number = 400,
    height: number = 300
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    if (results.length === 0) return canvas.toDataURL();

    const maxTime = Math.max(...results.map(r => r.processingTime));
    const chartHeight = height - 80;
    const pointSpacing = (width - 100) / Math.max(results.length - 1, 1);

    // Draw line chart
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    results.forEach((result, index) => {
      const x = 50 + index * pointSpacing;
      const y = height - 50 - (result.processingTime / maxTime) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw point
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.stroke();

    // Title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Processing Time Trend', width / 2, 20);

    // Axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(45, 40);
    ctx.lineTo(45, height - 50);
    ctx.lineTo(width - 20, height - 50);
    ctx.stroke();

    // Y-axis label
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${maxTime}ms`, 40, 45);
    ctx.fillText('0ms', 40, height - 50);

    return canvas.toDataURL();
  }
}
