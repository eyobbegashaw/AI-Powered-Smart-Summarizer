import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, FileText, Star, Download, Trash2, ChevronLeft, ChevronRight,
  Filter, Calendar, Type, Search, Sparkles, Eye
} from 'lucide-react';
import { getHistory, deleteSummary, exportSummary } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const HistoryPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ type: null, date: null });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadHistory();
  }, [page, filter, searchTerm]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await getHistory(page, 20, { ...filter, search: searchTerm });
      setSummaries(response.summaries);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this summary?')) {
      try {
        await deleteSummary(id);
        loadHistory();
      } catch (error) {
        console.error('Failed to delete summary:', error);
      }
    }
  };

  const handleExport = async (id, format) => {
    try {
      await exportSummary(id, format);
    } catch (error) {
      console.error('Failed to export summary:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bullets': return '•';
      case 'paragraph': return '📝';
      case 'section': return '📑';
      default: return '📄';
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      bullets: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      paragraph: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      section: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    };
    return badges[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Summary History</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-16">View and manage all your past summaries</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by document name..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Summary Type
                </label>
                <select
                  value={filter.type || ''}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="bullets">Bullet Points</option>
                  <option value="section">Section-Based</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={filter.date || ''}
                  onChange={(e) => setFilter({ ...filter, date: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading history...</p>
            </div>
          </div>
        ) : summaries.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No summaries yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start summarizing documents to see your history here</p>
            <Link to="/" className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md">
              <Sparkles className="h-4 w-4" />
              <span>Create Summary</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {summaries.map((summary) => (
                <div key={summary.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                          <span className="text-2xl">{getTypeIcon(summary.summary_type)}</span>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{summary.document_name}</h3>
                          {summary.is_favorite && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                              <Star className="h-3 w-3 fill-current" />
                              <span>Favorite</span>
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadge(summary.summary_type)}`}>
                            {summary.summary_type}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {summary.summary_preview}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(summary.created_at).toLocaleDateString()}</span>
                          </span>
                          {summary.keywords?.length > 0 && (
                            <span className="truncate max-w-md">
                              {summary.keywords.slice(0, 3).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-4">
                        <Link
                          to={`/summary/${summary.id}`}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="View Summary"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <div className="relative group">
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-1">
                              <button onClick={() => handleExport(summary.id, 'pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">PDF</button>
                              <button onClick={() => handleExport(summary.id, 'docx')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Word</button>
                              <button onClick={() => handleExport(summary.id, 'txt')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Text</button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(summary.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;