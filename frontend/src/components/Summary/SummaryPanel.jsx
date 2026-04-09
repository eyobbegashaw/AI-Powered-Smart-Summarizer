import React, { useState } from 'react';
import { Copy, Share2, ThumbsUp, ThumbsDown, RefreshCw, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import KeywordCloud from './KeywordCloud';
import ExportButtons from './ExportButtons';
import BulletPoints from './BulletPoints';
import ParagraphSummary from './ParagraphSummary';
import { submitFeedback } from '../../services/api';

const SummaryPanel = ({ summary, summaryAm, keywords, onRegenerate, documentId, summaryId, loading = false }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('en');

  const handleCopy = async () => {
    const textToCopy = activeLanguage === 'am' && summaryAm ? summaryAm : summary;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (type) => {
    if (feedbackSubmitted) return;
    
    setFeedback(type);
    try {
      await submitFeedback(summaryId || documentId, type === 'positive' ? 5 : 1);
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Summary',
          text: summary?.slice(0, 500),
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      await handleCopy();
      alert('Link copied to clipboard!');
    }
  };

  const renderSummaryContent = () => {
    const content = activeLanguage === 'am' && summaryAm ? summaryAm : summary;
    
    if (!content) return null;

    const isBulletFormat = content.includes('•') || content.includes('-') || content.includes('*');
    
    if (isBulletFormat) {
      return <BulletPoints summary={content} variant="checklist" />;
    }
    
    return <ParagraphSummary summary={content} />;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Generating summary...</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (!summary && !summaryAm) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Summary Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            Select a document and click "Generate Summary" to see the AI-powered summary here.
          </p>
          <div className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">✓ Supports Amharic & English</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {summaryAm && (
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-1.5 flex justify-between items-center">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveLanguage('en')}
              className={`flex-1 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeLanguage === 'en'
                  ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLanguage('am')}
              className={`flex-1 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeLanguage === 'am'
                  ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              አማርኛ
            </button>
          </div>
          <div className="px-3 py-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Bilingual summary</span>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-primary-500" />
            <span>{activeLanguage === 'am' ? 'ማጠቃለያ' : 'Summary'}</span>
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleCopy}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Regenerate summary"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <ExportButtons documentId={documentId} summaryId={summaryId} summary={summary} />
          </div>
        </div>
        
        <div className="p-5">
          {renderSummaryContent()}
        </div>
      </div>

      {keywords && keywords.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {activeLanguage === 'am' ? 'ቁልፍ ቃላት' : 'Key Topics'}
            </h3>
          </div>
          <KeywordCloud keywords={keywords} />
        </div>
      )}

      {summary && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {summary.split(/\s+/).length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Words</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {Math.ceil(summary.split(/\s+/).length / 200)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Min Read</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {keywords?.length || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Keywords</p>
            </div>
          </div>
        </div>
      )}

      {!feedbackSubmitted && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
            Was this summary helpful?
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleFeedback('positive')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                feedback === 'positive' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-2 ring-green-500' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm font-medium">Helpful</span>
            </button>
            <button
              onClick={() => handleFeedback('negative')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                feedback === 'negative' 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-2 ring-red-500' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="text-sm font-medium">Not Helpful</span>
            </button>
          </div>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center justify-center space-x-2 animate-fadeIn">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300 font-medium">Thank you for your feedback!</span>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;