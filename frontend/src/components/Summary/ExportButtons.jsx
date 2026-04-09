import React, { useState } from 'react';
import { Download, FileText, File, FileCode, Loader2, Check } from 'lucide-react';
import { exportSummary } from '../../services/api';

const ExportButtons = ({ documentId, summary, summaryId }) => {
  const [exporting, setExporting] = useState(null);
  const [copied, setCopied] = useState(false);

  const formats = [
    { id: 'pdf', label: 'PDF', icon: FileText, description: 'Portable Document Format' },
    { id: 'docx', label: 'Word', icon: File, description: 'Microsoft Word Document' },
    { id: 'txt', label: 'Text', icon: FileCode, description: 'Plain Text File' }
  ];

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await exportSummary(summaryId || documentId, format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(format);
      setTimeout(() => setExporting(null), 1000);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Download className="h-4 w-4" />
        <span className="text-sm font-medium">Export</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Export as</p>
          </div>
          {formats.map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <Icon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-primary-500" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{format.label}</div>
                  <div className="text-xs text-gray-400">{format.description}</div>
                </div>
                {exporting === format.id && <Loader2 className="h-4 w-4 animate-spin text-primary-500" />}
              </button>
            );
          })}
          <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
          <button
            onClick={handleCopyLink}
            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-3 text-green-500" />
                <span>Link copied!</span>
              </>
            ) : (
              <>
                <FileCode className="h-4 w-4 mr-3 text-gray-400" />
                <span>Copy shareable link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportButtons;