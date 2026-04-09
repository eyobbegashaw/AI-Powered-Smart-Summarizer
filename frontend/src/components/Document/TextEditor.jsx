import React, { useState, useEffect } from 'react';
import { Save, Edit2, X, Check, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

const TextEditor = ({ initialText, onSave, onCancel, readOnly = false }) => {
  const [text, setText] = useState(initialText || '');
  const [isEditing, setIsEditing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  }, [text]);

  const handleSave = () => {
    onSave?.(text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(initialText);
    setIsEditing(false);
    onCancel?.();
  };

  if (readOnly && !isEditing) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <pre className="whitespace-pre-wrap text-sm font-sans text-gray-700 dark:text-gray-300">{text}</pre>
        <button
          onClick={() => setIsEditing(true)}
          className="mt-4 flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium transition-colors"
        >
          <Edit2 className="h-4 w-4" />
          <span>Edit Document</span>
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            <Bold className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            <Italic className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            <AlignLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            <AlignCenter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            <AlignRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-5 focus:outline-none resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
        rows={12}
        placeholder="Enter or paste your text here..."
      />

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900/50">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg flex items-center space-x-2 font-medium"
        >
          <Save className="h-4 w-4" />
          <span>Save Document</span>
        </button>
      </div>
    </div>
  );
};

export default TextEditor;