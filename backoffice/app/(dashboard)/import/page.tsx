'use client';

import { useState } from 'react';
import { FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { JsonUploader } from '@/components/import/JsonUploader';
import { ImportProgress } from '@/components/import/ImportProgress';
import { ImportResults } from '@/components/import/ImportResults';
import {
  importApi,
  validateImportJSON,
  getImportErrorMessage,
  BatchImportRequest,
  ImportResponse,
} from '@/lib/api/importApi';

type ImportStatus = 'idle' | 'importing' | 'completed' | 'error';

export default function ImportPage() {
  const [jsonContent, setJsonContent] = useState('');
  const [isValidJson, setIsValidJson] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importResponse, setImportResponse] = useState<ImportResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [continueOnError, setContinueOnError] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleJsonLoad = (json: string) => {
    setJsonContent(json);
    validateJson(json);
  };

  const handleJsonPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const json = e.target.value;
    setJsonContent(json);
    validateJson(json);
  };

  const validateJson = (json: string) => {
    if (!json.trim()) {
      setIsValidJson(false);
      setValidationError(null);
      return;
    }

    const result = validateImportJSON(json);
    setIsValidJson(result.valid);
    setValidationError(result.error || null);
  };

  const handleLoadExample = async () => {
    try {
      // Load example from backend
      const response = await fetch('/backend/import-examples/batch-import-example.json');
      const exampleData = await response.json();
      const exampleJson = JSON.stringify(exampleData, null, 2);
      setJsonContent(exampleJson);
      validateJson(exampleJson);
    } catch (error) {
      // Fallback to inline example
      const example: BatchImportRequest = {
        continueOnError: true,
        autoApprove: false,
        roasters: [
          {
            name: 'Example Roaster',
            description: 'A sample roaster for testing',
            location: 'Paris, France',
            website: 'https://example.com',
            isVerified: true,
          },
        ],
        coffees: [
          {
            name: 'Example Coffee',
            roasterName: 'Example Roaster',
            origin: 'Ethiopia',
            process: 'Natural',
            variety: 'Heirloom',
            altitudeMin: 1800,
            altitudeMax: 2200,
            harvestYear: 2024,
            priceRange: '€€€',
            description: 'A sample coffee for testing',
            noteNames: ['Fruity', 'Floral', 'Sweet'],
            autoApprove: false,
          },
        ],
      };

      const exampleJson = JSON.stringify(example, null, 2);
      setJsonContent(exampleJson);
      validateJson(exampleJson);
    }
  };

  const handleImport = async () => {
    if (!isValidJson || !jsonContent) {
      return;
    }

    setImportStatus('importing');
    setImportError(null);
    setImportResponse(null);

    try {
      const data: BatchImportRequest = JSON.parse(jsonContent);

      // Apply global options
      data.continueOnError = continueOnError;
      data.autoApprove = autoApprove;

      // Calculate total items for progress
      const total = (data.roasters?.length || 0) + (data.coffees?.length || 0);
      setProgress({ current: 0, total });

      // Start import
      const response = await importApi.batchImport(data);

      // Import completed
      setProgress({ current: total, total });
      setImportStatus('completed');
      setImportResponse(response);
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setImportError(getImportErrorMessage(error));
    }
  };

  const handleReset = () => {
    setJsonContent('');
    setIsValidJson(false);
    setValidationError(null);
    setImportStatus('idle');
    setImportResponse(null);
    setImportError(null);
    setProgress({ current: 0, total: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Import</h1>
          <p className="text-sm text-gray-600 mt-1">
            Import multiple roasters and coffees from JSON
          </p>
        </div>
        {importResponse && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Import Another
          </button>
        )}
      </div>

      {/* Import Form */}
      {!importResponse && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload JSON File
            </label>
            <JsonUploader
              onJsonLoad={handleJsonLoad}
              onError={(error) => setValidationError(error)}
            />
          </div>

          {/* Or Paste JSON */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or paste JSON</span>
            </div>
          </div>

          {/* JSON Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                JSON Content
              </label>
              <button
                onClick={handleLoadExample}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={jsonContent}
              onChange={handleJsonPaste}
              placeholder='{"continueOnError": true, "autoApprove": false, "roasters": [...], "coffees": [...]}'
              rows={12}
              className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Validation Status */}
            {jsonContent && (
              <div className="mt-2">
                {isValidJson ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Valid JSON format</span>
                  </div>
                ) : validationError ? (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationError}</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Import Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Import Options</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={continueOnError}
                  onChange={(e) => setContinueOnError(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Continue on error (process all items even if some fail)
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Auto-approve all imported coffees
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleImport}
              disabled={!isValidJson || importStatus === 'importing'}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {importStatus === 'importing' ? 'Importing...' : 'Start Import'}
            </button>
            <button
              onClick={handleReset}
              disabled={importStatus === 'importing'}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Import Progress */}
      {importStatus !== 'idle' && !importResponse && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ImportProgress
            current={progress.current}
            total={progress.total}
            status={importStatus}
          />

          {/* Error Message */}
          {importError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Import Failed</p>
                  <p className="text-sm text-red-700 mt-1">{importError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Results */}
      {importResponse && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ImportResults response={importResponse} />
        </div>
      )}

      {/* Documentation Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileJson className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900">Need Help?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Check the{' '}
              <a
                href="/backend/import-examples/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >
                import documentation
              </a>{' '}
              for examples and API details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
