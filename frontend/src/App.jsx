import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DocumentProvider } from './contexts/DocumentContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import AuthCallback from './components/Auth/AuthCallback';
import HistoryPage from './pages/HistoryPage';
import DocumentPage from './pages/DocumentPage';
// import PricingPage from './pages/PricingPage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/app" />;
};

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {isAuthenticated && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/app" element={
        <AppLayout>
          <HomePage />
        </AppLayout>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/history" element={
        <PrivateRoute>
          <AppLayout>
            <HistoryPage />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/documents" element={
        <PrivateRoute>
          <AppLayout>
            <DocumentPage />
          </AppLayout>
        </PrivateRoute>
      } />
      <Route path="/documents/:id" element={
        <PrivateRoute>
          <AppLayout>
            <DocumentPage />
          </AppLayout>
        </PrivateRoute>
      } />
      {/* <Route path="/pricing" element={
        <AppLayout>
          <PricingPage />
        </AppLayout>
      } /> */}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <DocumentProvider>
              <AppRoutes />
            </DocumentProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;