import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ParagraphSummary = ({ summary, isExpanded = true }) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const summaryPreview = summary?.slice(0, 400) + (summary?.length > 400 ? '...' : '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Executive Summary</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Copy summary"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>
            {expanded ? summary : summaryPreview}
          </ReactMarkdown>
        </div>
        
        {!expanded && summary?.length > 400 && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium inline-flex items-center space-x-1"
          >
            <span>Read more</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ParagraphSummary;