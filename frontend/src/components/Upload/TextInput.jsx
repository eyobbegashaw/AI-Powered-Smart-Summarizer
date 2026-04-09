import React, { useState } from 'react';
import { FileText, Send, AlertCircle, CheckCircle, Type } from 'lucide-react';
import { processText } from '../../services/api';

const TextInput = ({ onTextInput, className = '' }) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await processText(text, title);
      setSuccess(true);
      onTextInput?.(result);
      setText('');
      setTitle('');
    } catch (err) {
      setError(err.message || 'Failed to process text');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = text.length;

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this document"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Text Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm resize-y transition-colors"
          />
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex items-center space-x-1">
              <Type className="h-4 w-4" />
              <span>{wordCount} words</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">{charCount} characters</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center space-x-3 animate-fadeIn">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 text-sm font-medium">Text processed successfully!</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg font-medium"
        >
          <Send className="h-5 w-5" />
          <span>{loading ? 'Processing...' : 'Process Text'}</span>
        </button>
      </form>
    </div>
  );
};

export default TextInput;