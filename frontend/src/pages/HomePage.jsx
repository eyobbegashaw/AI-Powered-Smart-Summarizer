import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Link2, Type, Zap, Shield, Globe, Clock } from 'lucide-react';
import FileUploader from '../components/Upload/FileUploader';
import UrlInput from '../components/Upload/UrlInput';
import TextInput from '../components/Upload/TextInput';
import DocumentViewer from '../components/Document/DocumentViewer';
import DocumentStats from '../components/Document/DocumentStats';
import SummaryPanel from '../components/Summary/SummaryPanel';
import SummaryControls from '../components/Summary/SummaryControls';
import { summarizeDocument, summarizeText } from '../services/api';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const { currentDocument, setCurrentDocument } = useDocument();
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryType, setSummaryType] = useState('paragraph');
  const [summaryLength, setSummaryLength] = useState('medium');

  const handleDocumentUpload = (doc) => {
    setCurrentDocument(doc);
    setSummary(null);
    navigate(`/documents/${doc.id}`);
  };

  const handleSummarize = async () => {
    if (!currentDocument && activeTab !== 'text') return;

    setLoading(true);
    try {
      let result;
      if (activeTab === 'text') {
        result = await summarizeText(currentDocument.text_content, summaryType, summaryLength);
      } else {
        result = await summarizeDocument(currentDocument.id, summaryType, summaryLength);
      }
      setSummary(result);
    } catch (error) {
      console.error('Summarization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleSummarize();
  };

  const tabs = [
    { id: 'upload', label: 'Upload File', icon: FileText, description: 'PDF, DOCX, TXT' },
    { id: 'url', label: 'URL', icon: Link2, description: 'Article or webpage' },
    { id: 'text', label: 'Paste Text', icon: Type, description: 'Direct input' }
  ];

  const features = [
    { icon: Globe, title: 'Amharic Support', description: 'Native support for Amharic and bilingual documents with proper Fidel rendering' },
    { icon: FileText, title: 'Multiple Formats', description: 'Upload PDFs, Word documents, or paste URLs and text directly' },
    { icon: Zap, title: 'Smart Summaries', description: 'Choose between bullet points, paragraphs, or section-based summaries' },
    { icon: Shield, title: 'Privacy First', description: 'Your documents are encrypted and never shared with third parties' },
    { icon: Clock, title: 'Fast Processing', description: 'Get summaries in seconds with our optimized AI pipeline' },
    { icon: Sparkles, title: 'AI Powered', description: 'Powered by GPT-4 for accurate and context-aware summaries' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4">
            AI Smart Summarizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform long documents into concise, actionable insights. 
            Support for Amharic, English, and bilingual content.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex p-1 bg-gray-100 dark:bg-gray-900">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        <span className="text-xs text-gray-400 hidden sm:inline">{tab.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-6">
                {activeTab === 'upload' && <FileUploader onUploadComplete={handleDocumentUpload} />}
                {activeTab === 'url' && <UrlInput onUrlProcessed={handleDocumentUpload} />}
                {activeTab === 'text' && <TextInput onTextInput={handleDocumentUpload} />}
              </div>
            </div>

            {currentDocument && (
              <>
                <DocumentViewer document={currentDocument} />
                <DocumentStats document={currentDocument} />
              </>
            )}
          </div>

          <div className="space-y-6">
            <SummaryControls
              summaryType={summaryType}
              summaryLength={summaryLength}
              onTypeChange={setSummaryType}
              onLengthChange={setSummaryLength}
              onSummarize={handleSummarize}
              loading={loading}
              disabled={!currentDocument && activeTab !== 'text'}
            />
            
            <SummaryPanel
              summary={summary?.summary}
              summaryAm={summary?.summary_am}
              keywords={summary?.keywords}
              onRegenerate={handleRegenerate}
              documentId={currentDocument?.id}
              loading={loading}
            />
          </div>
        </div>

        {!currentDocument && !summary && (
          <div className="mt-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Why Choose Smart Summarizer?</h2>
              <p className="text-gray-600 dark:text-gray-400">Powerful features to boost your productivity</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;