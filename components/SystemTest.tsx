'use client';

import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Upload } from 'lucide-react';
import { useToast } from '@/components/shared/NotificationToast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AuditLogger } from '@/services/AuditLogger';
import { IdGenerator, DateUtils, DefectUtils, FileUtils, MathUtils } from '@/lib/utils';
import { DefectType, DefectSeverity } from '@/types';

export default function SystemTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { showToast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: string[] = [];

    try {
      const id1 = IdGenerator.generate();
      const id2 = IdGenerator.generate();
      results.push(id1 !== id2 ? '✅ IdGenerator works' : '❌ IdGenerator failed');

      const formatted = DateUtils.formatDate(new Date());
      results.push(formatted.length > 0 ? '✅ DateUtils works' : '❌ DateUtils failed');

      const severity = DefectUtils.calculateSeverity(0.85);
      results.push(severity === DefectSeverity.HIGH ? '✅ DefectUtils works' : '❌ DefectUtils failed');

      const fileSize = FileUtils.formatFileSize(1024);
      results.push(fileSize === '1 KB' ? '✅ FileUtils works' : '❌ FileUtils failed');

      const avg = MathUtils.calculateAverage([1, 2, 3, 4, 5]);
      results.push(avg === 3 ? '✅ MathUtils works' : '❌ MathUtils failed');

      const auditLogger = AuditLogger.getInstance();
      auditLogger.log('test', 'test-action', {});
      results.push('✅ AuditLogger works');

      showToast('success', 'Tests completed!');
      results.push('✅ Toast works');

      setTestResults(results);
    } catch (error) {
      results.push(`❌ Error: ${error}`);
      setTestResults(results);
      showToast('error', 'Tests failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">System Test</h2>
      
      <button
        onClick={runTests}
        disabled={isRunning}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {isRunning ? <Clock className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {isRunning ? 'Running...' : 'Run Tests'}
      </button>

      {isRunning && <LoadingSpinner size="sm" text="Testing..." />}

      {testResults.length > 0 && (
        <div className="bg-gray-50 rounded p-4">
          {testResults.map((result, i) => (
            <div key={i} className="font-mono text-sm">{result}</div>
          ))}
        </div>
      )}
    </div>
  );
}