import React, { useState } from 'react';
import { Link, Loader2, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import { processUrl } from '../../services/api';

const UrlInput = ({ onUrlProcessed, className = '' }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await processUrl(url);
      setSuccess(true);
      onUrlProcessed?.(result);
      setUrl('');
    } catch (err) {
      setError(err.message || 'Failed to process URL. Please check the link and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Article URL
          </label>
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md font-medium"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Link className="h-4 w-4" />
                  <span>Fetch</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Extracts and summarizes content from articles, blog posts, and news pages
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-3 animate-fadeIn">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center space-x-3 animate-fadeIn">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 text-sm font-medium">URL processed successfully!</span>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 Tip: Works best with news articles, blog posts, and public documents. Some websites may block automated access.
          </p>
        </div>
      </form>
    </div>
  );
};

export default UrlInput;