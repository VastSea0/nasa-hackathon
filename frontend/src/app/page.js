'use client';

import { useState, useEffect } from 'react';
import WeatherDashboard from '../components/WeatherDashboard';
import LoginCard from '../components/LoginCard';
import AnalysisForm from '../components/AnalysisForm';
import ResultsSection from '../components/ResultsSection';
import HistorySection from '../components/HistorySection';
import NotificationSnackbar from '../components/NotificationSnackbar';

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [earthAccessStatus, setEarthAccessStatus] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [notification, setNotification] = useState(null);

  // API base URL
  const API_BASE = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api';

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      setConnectionStatus('connected');
      setEarthAccessStatus(data.earthaccess_logged_in);
    } catch (error) {
      setConnectionStatus('disconnected');
      showNotification('Sunucuya bağlanılamıyor!', 'error');
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ message, severity });
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEarthAccessStatus(true);
        showNotification('NASA EarthAccess bağlantısı başarılı! 🎉', 'success');
      } else {
        showNotification(`Login başarısız: ${data.message}`, 'error');
      }
    } catch (error) {
      showNotification('Login sırasında hata oluştu!', 'error');
    }
  };

  const handleAnalysisStart = async (formData) => {
    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setCurrentAnalysis(data.analysis_id);
        showNotification('Analiz başlatıldı! İlerleme takip ediliyor...', 'info');
      } else {
        showNotification(`Analiz başlatılamadı: ${data.message}`, 'error');
      }
    } catch (error) {
      showNotification('Analiz başlatılırken hata oluştu!', 'error');
    }
  };

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
    setCurrentAnalysis(null);
    showNotification('Analiz başarıyla tamamlandı! 🎉', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* App Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🛰️</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                NASA Weather Analysis
              </h1>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' 
                  ? earthAccessStatus 
                    ? 'bg-green-500' 
                    : 'bg-yellow-500'
                  : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {connectionStatus === 'connected' 
                  ? earthAccessStatus 
                    ? 'NASA Connected'
                    : 'Login Required'
                  : 'Disconnected'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Real-time Weather Analysis
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Analyze meteorological data using NASA's Earth science datasets with AI-powered insights
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <LoginCard 
              connectionStatus={connectionStatus}
              earthAccessStatus={earthAccessStatus}
              onLogin={handleLogin}
            />
            
            <AnalysisForm 
              earthAccessStatus={earthAccessStatus}
              currentAnalysis={currentAnalysis}
              onAnalysisStart={handleAnalysisStart}
              apiBase={API_BASE}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {analysisResults ? (
              <ResultsSection results={analysisResults} />
            ) : (
              <WeatherDashboard />
            )}
            
            <HistorySection apiBase={API_BASE} />
          </div>
        </div>
      </div>

      {/* Notification Snackbar */}
      {notification && (
        <NotificationSnackbar 
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
