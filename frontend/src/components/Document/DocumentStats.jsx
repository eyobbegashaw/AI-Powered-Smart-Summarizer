import React from 'react';
import { FileText, Clock, Languages, BarChart3, Type, Calendar } from 'lucide-react';

const DocumentStats = ({ document }) => {
  if (!document) return null;

  const readingTime = Math.ceil((document.word_count || 0) / 200);
  const characters = document.text_content?.length || 0;

  const stats = [
    {
      icon: Type,
      label: 'Word Count',
      value: document.word_count?.toLocaleString() || '0',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Clock,
      label: 'Reading Time',
      value: `${readingTime} min`,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Languages,
      label: 'Language',
      value: document.language === 'am' ? 'Amharic (አማርኛ)' : document.language === 'bilingual' ? 'Bilingual' : 'English',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: BarChart3,
      label: 'Characters',
      value: characters.toLocaleString(),
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Document Statistics</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`${stat.bg} rounded-xl p-4 transition-all hover:scale-105`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {document.file_size && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">File Size:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {(document.file_size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          {document.created_at && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Uploaded:</span>
              </span>
              <span className="text-gray-900 dark:text-white">{formatDate(document.created_at)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentStats;