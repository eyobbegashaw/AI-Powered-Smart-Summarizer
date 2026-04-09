import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext(null);

// Translation dictionary
const translations = {
  en: {
    // Common
    backToHome: '← Back to Home',
    welcomeBack: 'Welcome back',
    signInToContinue: 'Sign in to your account to continue summarizing',
    emailAddress: 'Email address',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign in',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    createAccount: 'Create an account',
    startSummarizing: 'Start summarizing documents with AI power',
    fullName: 'Full Name',
    companyOptional: 'Company (Optional)',
    preferredLanguage: 'Preferred Language',
    confirmPassword: 'Confirm Password',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordMinLength: 'Password must be at least 8 characters',
    passwordMinLengthMessage: 'Must be at least 8 characters',
    registrationFailed: 'Registration failed',
    alreadyHaveAccount: 'Already have an account?',
    
    // Welcome Page
    welcomeTitle: 'Transform Long Documents into Actionable Insights',
    welcomeDescription: 'AI-powered document summarization with support for Amharic and bilingual documents. Get concise summaries in seconds.',
    getStarted: 'Get Started',
    viewPricing: 'View Pricing',
    whyChooseUs: 'Why Choose Smart Summarizer?',
    featuresDescription: 'Powerful features to boost your productivity',
    readyToStart: 'Ready to transform your document workflow?',
    readyDescription: 'Join thousands of users who are saving hours of reading time every day.',
    startNow: 'Start Now',
    
    // Theme
    lightMode: 'Light',
    darkMode: 'Dark',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
  },
  am: {
    // Common
    backToHome: '← ወደ መነሻ ተመለስ',
    welcomeBack: 'እንኳን ደህና መጡ',
    signInToContinue: 'ለመቀጠል ወደ መለያዎ ይግቡ',
    emailAddress: 'ኢሜይል አድራሻ',
    password: 'ይለፍ ቃል',
    rememberMe: 'አስታውሰኝ',
    forgotPassword: 'ይለፍ ቃል ረሳሁት?',
    signIn: 'ግባ',
    noAccount: 'መለያ የለዎትም?',
    signUp: 'ተመዝገብ',
    createAccount: 'መለያ ፍጠር',
    startSummarizing: 'በአይ ኃይል ሰነዶችን ማጠቃለል ይጀምሩ',
    fullName: 'ሙሉ ስም',
    companyOptional: 'ድርጅት (አማራጭ)',
    preferredLanguage: 'የሚመረጥ ቋንቋ',
    confirmPassword: 'ይለፍ ቃል አረጋግጥ',
    passwordsDoNotMatch: 'የይለፍ ቃሎች አይዛመዱም',
    passwordMinLength: 'ይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት',
    passwordMinLengthMessage: 'ቢያንስ 8 ቁምፊዎች መሆን አለበት',
    registrationFailed: 'ምዝገባ አልተሳካም',
    alreadyHaveAccount: 'አስቀድመው መለያ አለዎት?',
    
    // Welcome Page
    welcomeTitle: 'ረጅም ሰነዶችን ወደ ተግባራዊ ማጠቃለያዎች ይቀይሩ',
    welcomeDescription: 'ለአማርኛ እና ሁለት ቋንቋ ሰነዶች ድጋፍ ያለው በአይ ኃይል የሚሰራ ሰነድ ማጠቃለያ። በሰከንዶች ጊዜ ውስጥ አጭር ማጠቃለያዎችን ያግኙ።',
    getStarted: 'ይጀምሩ',
    viewPricing: 'ዋጋ ይመልከቱ',
    whyChooseUs: 'ለምን ስማርት ሰማራይዘርን ይመርጣሉ?',
    featuresDescription: 'ምርታማነትዎን ለማሳደግ ኃይለኛ ባህሪያት',
    readyToStart: 'የሰነድ ስራዎትን ለመለወጥ ዝግጁ ነዎት?',
    readyDescription: 'በየቀኑ ሰዓታት የማንበብ ጊዜን ከሚቆጥቡ በሺዎች ከሚቆጠሩ ተጠቃሚዎች ጋር ይቀላቀሉ።',
    startNow: 'አሁን ይጀምሩ',
    
    // Theme
    lightMode: 'ብርሃን',
    darkMode: 'ጨለማ',
    switchToLight: 'ወደ ብርሃን ሁነታ ቀይር',
    switchToDark: 'ወደ ጨለማ ሁነታ ቀይር',
  }
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('preferred_language');
    return savedLanguage && (savedLanguage === 'en' || savedLanguage === 'am') ? savedLanguage : 'en';
  });

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'am') {
      setLanguage(newLang);
      localStorage.setItem('preferred_language', newLang);
      document.documentElement.lang = newLang === 'am' ? 'am' : 'en';
      
      // Dispatch event for components to react
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: newLang } }));
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'am' : 'en';
    changeLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};