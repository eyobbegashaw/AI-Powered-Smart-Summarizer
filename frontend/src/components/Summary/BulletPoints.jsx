import React from 'react';
import { CheckCircle, Circle, Sparkles } from 'lucide-react';

const BulletPoints = ({ summary, variant = 'default' }) => {
  if (!summary) return null;

  const bullets = summary.split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[•\-*\d+.]\s*/, '').trim());

  const variants = {
    default: {
      icon: Circle,
      iconColor: 'text-primary-500 dark:text-primary-400',
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700'
    },
    checklist: {
      icon: CheckCircle,
      iconColor: 'text-green-500 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800'
    },
    minimal: {
      icon: Sparkles,
      iconColor: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10',
      border: 'border-amber-200 dark:border-amber-800'
    }
  };

  const config = variants[variant] || variants.default;
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.bg} ${config.border} overflow-hidden`}>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
          <span>Key Points</span>
        </h3>
        <ul className="space-y-3">
          {bullets.map((point, idx) => (
            <li key={idx} className="flex items-start space-x-3 group">
              <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110`} />
              <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BulletPoints;