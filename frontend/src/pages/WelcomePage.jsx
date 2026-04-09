import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// መስመር 4 ላይ ይሄን ተካው
import { 
    Sparkles, FileText, Globe, Zap, Shield, Clock, Users, 
    ArrowRight, CheckCircle, Headphones // <--- Headphones እዚህ ጋር ተጨምሯል
  } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const WelcomePage = () => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const features = [
    { icon: Globe, title: 'Amharic Support', description: 'Native support for Amharic and bilingual documents with proper Fidel rendering', color: 'from-emerald-500 to-teal-500' },
    { icon: FileText, title: 'Multiple Formats', description: 'Upload PDFs, Word documents, or paste URLs and text directly', color: 'from-blue-500 to-cyan-500' },
    { icon: Zap, title: 'Smart Summaries', description: 'Choose between bullet points, paragraphs, or section-based summaries', color: 'from-purple-500 to-pink-500' },
    { icon: Shield, title: 'Privacy First', description: 'Your documents are encrypted and never shared with third parties', color: 'from-orange-500 to-red-500' },
    { icon: Clock, title: 'Fast Processing', description: 'Get summaries in seconds with our optimized AI pipeline', color: 'from-green-500 to-emerald-500' },
    { icon: Sparkles, title: 'AI Powered', description: 'Powered by GPT-4 for accurate and context-aware summaries', color: 'from-indigo-500 to-purple-500' }
  ];

  const stats = [
    { value: '1K+', label: 'Active Users', icon: Users },
    { value: '1M+', label: 'Documents Processed', icon: FileText },
    { value: '99.9%', label: 'Uptime Guarantee', icon: Shield },
    { value: '24/7', label: 'Customer Support', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 dark:from-primary-500/5 dark:to-purple-500/5"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-2xl mb-8 animate-bounce">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent mb-6">
              {t('welcomeTitle')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('welcomeDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg font-semibold"
              >
                <span>{t('getStarted')}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              {/* <Link
                to="/pricing"
                className="inline-flex items-center justify-center space-x-2 px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 text-lg font-semibold"
              >
                <span>{t('viewPricing')}</span>
              </Link> */}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('whyChooseUs')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('featuresDescription')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-700 dark:to-purple-700 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <Icon className="h-10 w-10 text-white/80 mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('readyToStart')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('readyDescription')}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl text-lg font-semibold"
          >
            <span>{t('startNow')}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;