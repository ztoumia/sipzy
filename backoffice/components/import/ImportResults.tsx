'use client';

import { CheckCircle, XCircle, AlertTriangle, SkipForward, Download } from 'lucide-react';
import { ImportResponse, ImportResult } from '@/lib/api/importApi';
import { cn } from '@sipzy/shared/lib/utils';

interface ImportResultsProps {
  response: ImportResponse;
}

export function ImportResults({ response }: ImportResultsProps) {
  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['Type', 'Operation', 'ID', 'Name', 'Status', 'Message'];
    const rows = response.results.map(result => [
      result.entityType,
      result.operation,
      result.entityId?.toString() || '',
      result.entityName,
      result.success ? 'Success' : 'Error',
      result.errorMessage || result.warning || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `import-results-${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={CheckCircle}
          label="Created"
          value={response.createCount}
          color="green"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Updated"
          value={response.updateCount}
          color="blue"
        />
        <SummaryCard
          icon={XCircle}
          label="Errors"
          value={response.errorCount}
          color="red"
        />
        <SummaryCard
          icon={SkipForward}
          label="Skipped"
          value={response.skipCount}
          color="gray"
        />
      </div>

      {/* Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium">{response.message}</p>
        <p className="text-xs text-blue-700 mt-1">
          Completed at {new Date(response.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Results Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            Detailed Results ({response.results.length} items)
          </h3>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operation
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {response.results.map((result, index) => (
                <ResultRow key={index} result={result} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: 'green' | 'blue' | 'red' | 'gray';
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className={cn('border rounded-lg p-4', colorClasses[color])}>
      <div className="flex items-center gap-3">
        <Icon className="w-8 h-8" />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm font-medium opacity-75">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ result }: { result: ImportResult }) {
  const getStatusIcon = () => {
    if (!result.success) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    if (result.warning) {
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  const getOperationBadge = () => {
    const classes = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      SKIP: 'bg-gray-100 text-gray-800',
      ERROR: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
          classes[result.operation]
        )}
      >
        {result.operation}
      </span>
    );
  };

  return (
    <tr className={cn(!result.success && 'bg-red-50')}>
      <td className="px-4 py-3 whitespace-nowrap">{getStatusIcon()}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {result.entityType}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{getOperationBadge()}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{result.entityName}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {result.entityId || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {result.errorMessage || result.warning || '-'}
      </td>
    </tr>
  );
}
