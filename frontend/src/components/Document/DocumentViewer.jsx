import React, { useState, useEffect } from 'react';
import { Eye, FileText, Download, Maximize2, Minimize2, Copy, Check, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const DocumentViewer = ({ document: documentData, className = '' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('preview');

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(documentData.text_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>${documentData.original_filename}</title></head>
        <body>${documentData.text_content.replace(/\n/g, '<br>')}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const blob = new Blob([documentData.text_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentData.original_filename || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!documentData) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 ${className}`}>
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No document selected</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Upload a document to view its content</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden ${className}`}>
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{documentData.original_filename}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {documentData.word_count?.toLocaleString()} words • 
              {documentData.language === 'am' ? ' አማርኛ' : ' English'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-sm transition-all ${
                viewMode === 'preview'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1.5 text-sm transition-all ${
                viewMode === 'raw'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Copy text"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          
          <button
            onClick={handlePrint}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 max-h-[600px]">
        {viewMode === 'preview' ? (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{documentData.text_content?.slice(0, 5000)}</ReactMarkdown>
            {documentData.text_content?.length > 5000 && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-amber-700 dark:text-amber-400 text-sm">
                  📄 Document truncated (showing first 5000 characters)
                </p>
              </div>
            )}
          </div>
        ) : (
          <pre className="text-sm font-mono whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
            {documentData.text_content}
          </pre>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;