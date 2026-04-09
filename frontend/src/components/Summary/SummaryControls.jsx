import React from 'react';
import { Zap, FileText, AlignLeft, List, BookOpen, Loader2, Settings2 } from 'lucide-react';

const SummaryControls = ({
  summaryType,
  summaryLength,
  onTypeChange,
  onLengthChange,
  onSummarize,
  loading,
  disabled
}) => {
  const types = [
    { id: 'paragraph', label: 'Paragraph', icon: AlignLeft, description: 'Concise paragraph summary', color: 'from-blue-500 to-blue-600' },
    { id: 'bullets', label: 'Bullet Points', icon: List, description: 'Key points in list format', color: 'from-green-500 to-green-600' },
    { id: 'section', label: 'Section-Based', icon: BookOpen, description: 'Organized by sections', color: 'from-purple-500 to-purple-600' }
  ];

  const lengths = [
    { id: 'short', label: 'Short', value: '~150 words', description: 'Quick overview', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
    { id: 'medium', label: 'Medium', value: '~400 words', description: 'Balanced detail', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    { id: 'long', label: 'Long', value: '~800 words', description: 'Comprehensive', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 dark:border-gray-700">
        <Settings2 className="h-5 w-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Summary Settings</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Summary Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {types.map((type) => {
            const Icon = type.icon;
            const isActive = summaryType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => onTypeChange(type.id)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${isActive 
                    ? `border-${type.id === 'paragraph' ? 'blue' : type.id === 'bullets' ? 'green' : 'purple'}-500 bg-gradient-to-br ${type.color} bg-opacity-10`
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-800'
                  }
                `}
              >
                <Icon className={`h-5 w-5 mb-2 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {type.label}
                </p>
                <p className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Summary Length
        </label>
        <div className="flex space-x-3">
          {lengths.map((length) => (
            <button
              key={length.id}
              onClick={() => onLengthChange(length.id)}
              className={`
                flex-1 py-3 rounded-xl text-center transition-all duration-200
                ${summaryLength === length.id
                  ? length.color + ' ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-800'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <p className="font-semibold">{length.label}</p>
              <p className="text-xs opacity-75 mt-1">{length.value}</p>
              <p className="text-xs opacity-60 mt-0.5">{length.description}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSummarize}
        disabled={disabled || loading}
        className={`
          w-full py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2
          ${disabled || loading
            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400'
            : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transform hover:scale-[1.02]'
          }
          text-white
        `}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating Summary...</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            <span>Generate Summary</span>
          </>
        )}
      </button>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        Powered by GPT-4 • Supports Amharic & English
      </div>
    </div>
  );
};

export default SummaryControls;