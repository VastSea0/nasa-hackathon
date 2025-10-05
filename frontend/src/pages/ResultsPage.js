'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api';

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('nasa_logged_in');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Load results from localStorage
    const storedResults = localStorage.getItem('analysis_results');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      router.push('/dashboard');
    }
  }, []);

  const handleImageError = (imagePath) => {
    console.error('Image load error for:', imagePath);
    setImageErrors(prev => ({ ...prev, [imagePath]: true }));
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API_BASE}/files/${path}`;
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading results...</p>
        </div>
      </div>
    );
  }

  const { summary, ai_analysis } = results;

  const summaryItems = [
    {
      icon: '🌡️',
      label: 'Avg Temperature',
      value: summary.temp_mean_C ? `${summary.temp_mean_C.toFixed(1)}°C` : 'N/A',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: '🌧️',
      label: 'Precipitation',
      value: summary.precip_mean_mm_per_day ? `${summary.precip_mean_mm_per_day.toFixed(2)} mm/day` : 'N/A',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: '💨',
      label: 'Wind Speed',
      value: summary.wind_mean_m_s ? `${summary.wind_mean_m_s.toFixed(1)} m/s` : 'N/A',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-700'
    },
    {
      icon: '🌵',
      label: 'Drought Index',
      value: summary.drought_index_mean ? `${(summary.drought_index_mean * 100).toFixed(0)}%` : 'N/A',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'charts', label: 'Charts', icon: '📈' },
    { id: 'ai', label: 'AI Insights', icon: '🤖' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Analysis Results
                </h1>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {summary.dates && `${summary.dates[0]} to ${summary.dates[1]}`}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/analysis')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm"
            >
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 sm:px-6">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summaryItems.map((item, index) => (
                <div key={index} className={`${item.bgColor} rounded-2xl p-4 border border-slate-200 dark:border-slate-600`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className={`text-lg font-bold ${item.color}`}>
                        {item.value}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {item.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Date Range Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Analysis Period
              </h3>
              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Start: {summary.dates?.[0] || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>End: {summary.dates?.[1] || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            {summary.map_path && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Weather Map
                </h3>
                {imageErrors[summary.map_path] ? (
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-8 text-center">
                    <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Image could not be loaded
                    </p>
                  </div>
                ) : (
                  <div 
                    className="cursor-pointer rounded-xl overflow-hidden"
                    onClick={() => setSelectedImage(getImageUrl(summary.map_path))}
                  >
                    <img
                      src={getImageUrl(summary.map_path)}
                      alt="Weather Map"
                      className="w-full h-auto hover:scale-105 transition-transform duration-200"
                      onError={() => handleImageError(summary.map_path)}
                    />
                  </div>
                )}
              </div>
            )}

            {summary.quick_plot_path && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Analysis Chart
                </h3>
                {imageErrors[summary.quick_plot_path] ? (
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-8 text-center">
                    <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Image could not be loaded
                    </p>
                  </div>
                ) : (
                  <div 
                    className="cursor-pointer rounded-xl overflow-hidden"
                    onClick={() => setSelectedImage(getImageUrl(summary.quick_plot_path))}
                  >
                    <img
                      src={getImageUrl(summary.quick_plot_path)}
                      alt="Analysis Chart"
                      className="w-full h-auto hover:scale-105 transition-transform duration-200"
                      onError={() => handleImageError(summary.quick_plot_path)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai' && (
          <div>
            {ai_analysis ? (
              <AIAnalysisDisplay aiAnalysis={ai_analysis} />
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No AI Analysis Available
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  AI analysis was not enabled for this weather analysis
                </p>
                <button
                  onClick={() => router.push('/analysis')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
                >
                  Run New Analysis with AI
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full Size Chart"
              className="max-w-full max-h-full rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
