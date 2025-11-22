'use client';

import React, { useState } from 'react';
import { Download, FileText, Table, Loader2, CheckCircle } from 'lucide-react';

interface ReportGeneratorProps {
  auditId: string;
  auditData?: any;
}

export default function ReportGenerator({ auditId, auditData }: ReportGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'html' | 'csv'>('pdf');
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [includeCorrectiveActions, setIncludeCorrectiveActions] = useState(true);
  const [success, setSuccess] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setSuccess(false);

    try {
      if (exportType === 'csv') {
        await generateCSV();
      } else {
        await generatePDFOrHTML();
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const generatePDFOrHTML = async () => {
    const response = await fetch('/api/audit/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportData: auditData,
        options: {
          format: exportType === 'pdf' ? 'html' : exportType, // HTML for now, can be converted to PDF
          includeEvidence,
          includeComments,
          includeCorrectiveActions,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${auditId}.${exportType === 'pdf' ? 'html' : exportType}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const generateCSV = async () => {
    const response = await fetch('/api/audit/reports/export-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'audit',
        data: {
          audit: auditData.audit,
          site: auditData.site,
          inspector: auditData.inspector,
          complianceScore: auditData.complianceScore,
        },
        options: {
          includeComments,
          includeSeverity: true,
          includeEvidence,
          includeTimestamps: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-export-${auditId}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
          <p className="text-sm text-gray-600 mt-1">
            Export audit data in various formats
          </p>
        </div>
        {success && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Report generated!</span>
          </div>
        )}
      </div>

      {/* Export Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Export Format
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setExportType('pdf')}
            className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-colors ${
              exportType === 'pdf'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">PDF Report</span>
          </button>
          <button
            onClick={() => setExportType('html')}
            className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-colors ${
              exportType === 'html'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">HTML Report</span>
          </button>
          <button
            onClick={() => setExportType('csv')}
            className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-colors ${
              exportType === 'csv'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Table className="h-5 w-5" />
            <span className="font-medium">CSV Data</span>
          </button>
        </div>
      </div>

      {/* Options */}
      {exportType !== 'csv' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Report Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeEvidence}
                onChange={(e) => setIncludeEvidence(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include evidence gallery</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include comments and notes</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeCorrectiveActions}
                onChange={(e) => setIncludeCorrectiveActions(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include corrective actions</span>
            </label>
          </div>
        </div>
      )}

      {exportType === 'csv' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            CSV Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include comments column</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeEvidence}
                onChange={(e) => setIncludeEvidence(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include evidence count</span>
            </label>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerateReport}
        disabled={generating}
        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            <span>Generate & Download</span>
          </>
        )}
      </button>

      {/* Info */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> {exportType === 'csv' 
            ? 'CSV exports contain raw audit data suitable for analysis in spreadsheet applications.'
            : 'PDF/HTML reports are formatted according to ISO 9001:2015 standards and include all audit details, compliance scores, and findings.'}
        </p>
      </div>
    </div>
  );
}
