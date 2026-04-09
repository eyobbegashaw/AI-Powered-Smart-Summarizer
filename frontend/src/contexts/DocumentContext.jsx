import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';

const DocumentContext = createContext(null);

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadDocument = useCallback(async (file, onProgress) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.uploadDocument(file, onProgress);
      setCurrentDocument(result);
      setDocuments(prev => [result, ...prev]);
      
      // Save to recent documents
      const recent = JSON.parse(localStorage.getItem('recent_documents') || '[]');
      const updated = [{ id: result.id, name: result.original_filename }, ...recent.filter(d => d.id !== result.id)].slice(0, 5);
      localStorage.setItem('recent_documents', JSON.stringify(updated));
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processUrl = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.processUrl(url);
      setCurrentDocument(result);
      setDocuments(prev => [result, ...prev]);
      
      const recent = JSON.parse(localStorage.getItem('recent_documents') || '[]');
      const updated = [{ id: result.id, name: result.original_filename }, ...recent.filter(d => d.id !== result.id)].slice(0, 5);
      localStorage.setItem('recent_documents', JSON.stringify(updated));
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processText = useCallback(async (text, title) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.processText(text, title);
      setCurrentDocument(result);
      setDocuments(prev => [result, ...prev]);
      
      const recent = JSON.parse(localStorage.getItem('recent_documents') || '[]');
      const updated = [{ id: result.id, name: result.original_filename }, ...recent.filter(d => d.id !== result.id)].slice(0, 5);
      localStorage.setItem('recent_documents', JSON.stringify(updated));
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocument = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/documents/${id}`);
      setCurrentDocument(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      if (currentDocument?.id === id) {
        setCurrentDocument(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentDocument]);

  const value = {
    currentDocument,
    documents,
    loading,
    error,
    uploadDocument,
    processUrl,
    processText,
    loadDocuments,
    getDocument,
    deleteDocument,
    setCurrentDocument
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};