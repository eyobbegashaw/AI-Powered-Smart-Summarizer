import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, FileText, History, Star, Settings, ChevronLeft, ChevronRight,
  TrendingUp, BookOpen, Clock, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [recentDocs, setRecentDocs] = useState([]);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem('recent_documents');
    if (stored) {
      setRecentDocs(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: 'Summarize' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/favorites', icon: Star, label: 'Favorites' },
  ];

  const stats = [
    { icon: TrendingUp, label: 'Total Summaries', value: user?.summary_count || 0 },
    { icon: BookOpen, label: 'Documents', value: recentDocs.length },
    { icon: Clock, label: 'This Month', value: user?.summary_count || 0 },
  ];

  return (
    <aside 
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex flex-col h-full sticky top-16">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <nav className="flex-1 py-6">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'group-hover:text-gray-900 dark:group-hover:text-gray-200'}`} />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {!isCollapsed && recentDocs.length > 0 && (
            <div className="mt-8 px-3">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Recent Documents
              </h3>
              <div className="space-y-2">
                {recentDocs.map((doc, idx) => (
                  <Link
                    key={idx}
                    to={`/documents/${doc.id}`}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <FileText className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate group-hover:text-gray-900 dark:group-hover:text-white">{doc.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!isCollapsed && (
            <div className="mt-8 px-3">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Statistics
              </h3>
              <div className="space-y-3">
                {stats.map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <StatIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                  Upgrade to Pro
                </p>
              </div>
              <p className="text-xs text-primary-600 dark:text-primary-400 mb-3">
                Get unlimited summaries and advanced features
              </p>
              <Link
                to="/pricing"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 inline-flex items-center space-x-1"
              >
                <span>View Plans</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;