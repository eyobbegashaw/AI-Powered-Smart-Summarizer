// import React from 'react';
// import { Sun, Moon } from 'lucide-react';
// import { useTheme } from '../../contexts/ThemeContext';

// const ThemeToggle = () => {
//   const { theme, toggleTheme } = useTheme();

//   return (
//     <button
//       onClick={toggleTheme}
//       className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//       title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
//     >
//       {theme === 'dark' ? (
//         <Sun className="h-5 w-5 text-yellow-500" />
//       ) : (
//         <Moon className="h-5 w-5 text-gray-600" />
//       )}
//       <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
//         {theme === 'dark' ? 'Light' : 'Dark'}
//       </span>
//     </button>
//   );
// };

// export default ThemeToggle;  

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600" />
      )}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
        {theme === 'dark' ? t('lightMode') : t('darkMode')}
      </span>
    </button>
  );
};

export default ThemeToggle;