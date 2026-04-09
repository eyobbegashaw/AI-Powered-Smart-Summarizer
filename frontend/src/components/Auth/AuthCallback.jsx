import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const error = params.get('error');
    const isNew = params.get('is_new') === 'true';
    const redirectPath = localStorage.getItem('oauth_redirect_path') || '/';

    if (error) {
      setStatus('error');
      let errorMessage = 'Authentication failed';
      
      switch(error) {
        case 'google_auth_failed':
          errorMessage = 'Google authentication failed. Please try again.';
          break;
        case 'github_auth_failed':
          errorMessage = 'GitHub authentication failed. Please try again.';
          break;
        case 'access_denied':
          errorMessage = 'Access denied. Please allow access to continue.';
          break;
        default:
          errorMessage = error;
      }
      
      setMessage(errorMessage);
      
      // Clear stored redirect path
      localStorage.removeItem('oauth_redirect_path');
      
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      // Clear stored redirect path
      localStorage.removeItem('oauth_redirect_path');
      
      setStatus('success');
      
      if (isNew) {
        setMessage('Account created successfully! Welcome aboard! 🎉');
      } else {
        setMessage('Login successful! Redirecting you to the dashboard...');
      }
      
      // Redirect to home or stored path
      setTimeout(() => navigate(redirectPath), 2000);
    } else {
      setStatus('error');
      setMessage('Invalid authentication response. Please try again.');
      localStorage.removeItem('oauth_redirect_path');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center px-4">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6 animate-pulse">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <Loader2 className="h-12 w-12 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Completing Authentication...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your credentials
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6 animate-bounce">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {message.includes('created') ? 'Welcome!' : 'Welcome Back!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-8 border-t-2 border-primary-500 rounded-full animate-spin"></div>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
              <XCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;