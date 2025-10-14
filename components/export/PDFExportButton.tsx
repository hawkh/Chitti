'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';

interface PDFExportButtonProps {
  jobId: string;
  disabled?: boolean;
}

export default function PDFExportButton({ jobId, disabled }: PDFExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inspection-report-${jobId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all font-semibold"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <FileText className="h-5 w-5" />
      )}
      {loading ? 'Generating PDF...' : 'Export PDF Report'}
    </button>
  );
}