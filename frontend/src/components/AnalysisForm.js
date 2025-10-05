'use client';

import { useState, useEffect } from 'react';

export default function AnalysisForm({ 
  earthAccessStatus, 
  currentAnalysis, 
  onAnalysisStart,
  apiBase,
  onAnalysisComplete 
}) {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    include_ai: false
  });
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setFormData({
      start_date: lastMonth.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
      include_ai: false
    });
  }, []);

  // Track analysis progress
  useEffect(() => {
    if (currentAnalysis) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${apiBase}/progress/${currentAnalysis}`);
          const data = await response.json();
          
          if (data.success) {
            setProgress(data.data.progress);
            setProgressMessage(data.data.message);
            
            if (data.data.status === 'completed') {
              onAnalysisComplete(data.data.result);
              clearInterval(interval);
            } else if (data.data.status === 'error') {
              setProgressMessage('Analysis failed');
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Progress tracking error:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentAnalysis, apiBase, onAnalysisComplete]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date) return;
    
    setProgress(0);
    setProgressMessage('Starting analysis...');
    onAnalysisStart(formData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Card Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weather Analysis
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure your analysis parameters
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              disabled={!!currentAnalysis}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              disabled={!!currentAnalysis}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              required
            />
          </div>
        </div>

        {/* AI Analysis Toggle */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <input
            type="checkbox"
            name="include_ai"
            id="include_ai"
            checked={formData.include_ai}
            onChange={handleInputChange}
            disabled={!!currentAnalysis}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
          />
          <label htmlFor="include_ai" className="flex-1 cursor-pointer">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              Include AI Analysis
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Generate insights using Google Gemini AI (requires API key)
            </div>
          </label>
          <div className="text-2xl">🤖</div>
        </div>

        {/* Progress Bar */}
        {currentAnalysis && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {progressMessage}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!earthAccessStatus || !!currentAnalysis}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {currentAnalysis ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Start Analysis</span>
            </div>
          )}
        </button>

        {!earthAccessStatus && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
            ⚠️ Please connect to NASA EarthAccess first
          </p>
        )}
      </form>
    </div>
  );
}
