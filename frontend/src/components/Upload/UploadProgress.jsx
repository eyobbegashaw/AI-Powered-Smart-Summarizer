import React from 'react';
import { Loader2, UploadCloud } from 'lucide-react';

const UploadProgress = ({ progress }) => {
  return (
    <div className="mt-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <UploadCloud className="h-4 w-4 text-primary-500 animate-pulse" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
        </div>
        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {progress === 100 && (
        <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing document...</span>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;