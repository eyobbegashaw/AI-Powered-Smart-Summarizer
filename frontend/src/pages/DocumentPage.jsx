import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, Trash2, Download, Share2, ArrowLeft, 
  Loader2, AlertCircle, Calendar, Clock, User, Sparkles
} from 'lucide-react';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';
import DocumentViewer from '../components/Document/DocumentViewer';
import DocumentStats from '../components/Document/DocumentStats';
import SummaryPanel from '../components/Summary/SummaryPanel';
import SummaryControls from '../components/Summary/SummaryControls';
import { summarizeDocument } from '../services/api';

const DocumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentDocument, getDocument, deleteDocument, setCurrentDocument } = useDocument();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryType, setSummaryType] = useState('paragraph');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadDocument();
    }
    return () => {
      setCurrentDocument(null);
    };
  }, [id]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    try {
      await getDocument(parseInt(id));
    } catch (err) {
      setError(err.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!currentDocument) return;
    
    setSummarizing(true);
    try {
      const result = await summarizeDocument(currentDocument.id, summaryType, summaryLength);
      setSummary(result);
    } catch (error) {
      console.error('Summarization failed:', error);
      setError(error.message || 'Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(currentDocument.id);
      navigate('/documents');
    } catch (error) {
      setError(error.message || 'Failed to delete document');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentDocument?.original_filename,
          text: 'Check out this document',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !currentDocument) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Document Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The document you\'re looking for doesn\'t exist or has been deleted.'}</p>
          <button
            onClick={() => navigate('/documents')}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Documents</span>
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentDocument.original_filename}</h1>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{user?.full_name || 'You'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(currentDocument.created_at).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{currentDocument.word_count?.toLocaleString()} words</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <DocumentViewer document={currentDocument} />
            <DocumentStats document={currentDocument} />
          </div>

          <div className="space-y-6">
            <SummaryControls
              summaryType={summaryType}
              summaryLength={summaryLength}
              onTypeChange={setSummaryType}
              onLengthChange={setSummaryLength}
              onSummarize={handleSummarize}
              loading={summarizing}
              disabled={false}
            />
            
            <SummaryPanel
              summary={summary?.summary}
              summaryAm={summary?.summary_am}
              keywords={summary?.keywords}
              onRegenerate={handleSummarize}
              documentId={currentDocument.id}
              summaryId={summary?.summary_id}
              loading={summarizing}
            />
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Document</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{currentDocument.original_filename}"? 
                This action cannot be undone and will also delete all associated summaries.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPage;