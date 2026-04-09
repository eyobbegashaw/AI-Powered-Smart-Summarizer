// import React, { useState, useEffect } from 'react';
// import { Globe } from 'lucide-react';

// const LanguageToggle = () => {
//   const [language, setLanguage] = useState(() => {
//     return localStorage.getItem('preferred_language') || 'en';
//   });

//   useEffect(() => {
//     localStorage.setItem('preferred_language', language);
//     document.documentElement.lang = language === 'am' ? 'am' : 'en';
//     document.documentElement.dir = 'ltr';
    
//     window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }));
//   }, [language]);

//   const toggleLanguage = () => {
//     const newLang = language === 'en' ? 'am' : 'en';
//     setLanguage(newLang);
//   };

//   return (
//     <button
//       onClick={toggleLanguage}
//       className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//       title={language === 'en' ? 'Switch to Amharic' : 'ወደ እንግሊዝኛ ቀይር'}
//     >
//       <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
//       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//         {language === 'en' ? 'EN' : 'አማ'}
//       </span>
//     </button>
//   );
// };

// export default LanguageToggle;

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={language === 'en' ? 'Switch to Amharic' : 'ወደ እንግሊዝኛ ቀይር'}
    >
      <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {language === 'en' ? 'EN' : 'አማ'}
      </span>
    </button>
  );
};

export default LanguageToggle;