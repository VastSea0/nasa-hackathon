'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);

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

    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load recent analyses or weather summary
      // This would be implemented based on your backend
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const quickActions = [
    {
      title: 'New Analysis',
      description: 'Start weather data analysis',
      icon: '📊',
      color: 'from-blue-500 to-indigo-600',
      action: () => router.push('/analysis')
    },
    {
      title: 'View History',
      description: 'Past analysis results',
      icon: '📋',
      color: 'from-emerald-500 to-teal-600',
      action: () => router.push('/history')
    },
    {
      title: 'AI Insights',
      description: 'Latest AI recommendations',
      icon: '🤖',
      color: 'from-purple-500 to-pink-600',
      action: () => router.push('/insights')
    },
    {
      title: 'Settings',
      description: 'Account and preferences',
      icon: '⚙️',
      color: 'from-slate-500 to-slate-600',
      action: () => router.push('/settings')
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('nasa_logged_in');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🛰️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  NASA Weather
                </h1>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Dashboard
                </span>
              </div>
            </div>
            
            {/* Profile Menu */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome Back! 👋
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Ready to analyze weather data and get AI-powered insights?
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  NASA EarthAccess Connected
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  All systems operational
                </p>
              </div>
            </div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 text-left hover:shadow-xl transition-all duration-200 transform hover:scale-105 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-xl">{action.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {action.description}
                  </p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            {/* Placeholder for recent analyses */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No recent analyses yet
              </p>
              <button
                onClick={() => router.push('/analysis')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
              >
                Start Your First Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
