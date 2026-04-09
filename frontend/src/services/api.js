import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        localStorage.setItem('access_token', response.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file); // 'file' ከባክኤንዱ የ Parameter ስም ጋር አንድ አይነት መሆኑን አረጋግጥ
  
  // ቶክኑን ከ localStorage (ወይም ከምትጠቀምበት ቦታ) አውጣ
  const token = localStorage.getItem('access_token'); 

  const response = await api.post('/documents/upload', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      // ይህ Header ለባክኤንዱ በጣም አስፈላጊ ነው
      'Authorization': `Bearer ${token}` 
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  
  return response.data;
};

export const processUrl = async (url) => {
  const formData = new FormData();
  formData.append('url', url);
  
  const response = await api.post('/documents/url', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
};

export const processText = async (text, title) => {
  const formData = new FormData();
  formData.append('text', text);
  if (title) formData.append('title', title);
  
  const response = await api.post('/documents/text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
};

export const getDocuments = async (skip = 0, limit = 50) => {
  const response = await api.get('/documents/', { params: { skip, limit } });
  return response.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

export const summarizeDocument = async (documentId, summaryType, summaryLength) => {
  const response = await api.post(`/summarize/document/${documentId}`, {
    summary_type: summaryType,
    summary_length: summaryLength,
  });
  return response.data;
};

export const summarizeText = async (text, summaryType, summaryLength) => {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('summary_type', summaryType);
  formData.append('summary_length', summaryLength);
  
  const response = await api.post('/summarize/text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
};

export const getHistory = async (page = 1, limit = 20, filters = {}) => {
  const params = { page, limit, ...filters };
  const response = await api.get('/history/summaries', { params });
  return response.data;
};

export const getSummary = async (id) => {
  const response = await api.get(`/history/summaries/${id}`);
  return response.data;
};

export const deleteSummary = async (id) => {
  const response = await api.delete(`/history/summaries/${id}`);
  return response.data;
};

export const toggleFavorite = async (id) => {
  const response = await api.post(`/history/summaries/${id}/favorite`);
  return response.data;
};

export const submitFeedback = async (id, score) => {
  const response = await api.post(`/history/summaries/${id}/feedback`, null, {
    params: { score },
  });
  return response.data;
};

export const exportSummary = async (id, format) => {
  const response = await api.get(`/history/summaries/${id}/export`, {
    params: { format },
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `summary_${id}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response.data;
};

export const getHistoryStats = async () => {
  const response = await api.get('/history/stats');
  return response.data;
};

export default api;