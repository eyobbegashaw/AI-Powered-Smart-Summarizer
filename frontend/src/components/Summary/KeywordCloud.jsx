import React, { useState } from 'react';
import { Hash, TrendingUp } from 'lucide-react';

const KeywordCloud = ({ keywords, onKeywordClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!keywords || keywords.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
        <Hash className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">No keywords extracted</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Generate a summary to see keywords</p>
      </div>
    );
  }

  const getFontSize = (index, total) => {
    const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];
    const position = Math.floor((index / total) * sizes.length);
    return sizes[Math.min(position, sizes.length - 1)];
  };

  const getColor = (index) => {
    const colors = [
      'text-primary-600 dark:text-primary-400',
      'text-blue-600 dark:text-blue-400',
      'text-green-600 dark:text-green-400',
      'text-purple-600 dark:text-purple-400',
      'text-orange-600 dark:text-orange-400',
      'text-red-600 dark:text-red-400',
      'text-teal-600 dark:text-teal-400',
      'text-pink-600 dark:text-pink-400'
    ];
    return colors[index % colors.length];
  };

  const getRotation = (index) => {
    const rotations = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1', 'rotate-0'];
    return rotations[index % rotations.length];
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Most Frequent Topics</h3>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {keywords.map((keyword, idx) => (
          <button
            key={idx}
            onClick={() => onKeywordClick?.(keyword)}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              ${getFontSize(idx, keywords.length)} 
              ${getColor(idx)} 
              ${getRotation(idx)}
              hover:scale-110 transition-all duration-200
              px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800
              font-medium
            `}
            style={{
              transform: hoveredIndex === idx ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s ease'
            }}
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
};

export default KeywordCloud;