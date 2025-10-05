'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalysisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    include_ai: false
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

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

    // Set default dates
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
          const response = await fetch(`${API_BASE}/progress/${currentAnalysis}`);
          const data = await response.json();
          
          if (data.success) {
            setProgress(data.data.progress);
            setProgressMessage(data.data.message);
            
            if (data.data.status === 'completed') {
              // Store results and navigate to results page
              localStorage.setItem('analysis_results', JSON.stringify(data.data.result));
              router.push('/results');
              clearInterval(interval);
            } else if (data.data.status === 'error') {
              setProgressMessage('Analysis failed');
              setIsAnalyzing(false);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Progress tracking error:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentAnalysis, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setProgressMessage('Starting analysis...');

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setCurrentAnalysis(data.analysis_id);
        setStep(3); // Move to progress step
      } else {
        setProgressMessage(`Analysis failed: ${data.message}`);
        setIsAnalyzing(false);
      }
    } catch (error) {
      setProgressMessage('Failed to start analysis');
      setIsAnalyzing(false);
    }
  };

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
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Weather Analysis
              </h1>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    stepNum === step
                      ? 'bg-blue-600 text-white'
                      : stepNum < step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {stepNum < step ? '✓' : stepNum}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6">
        {/* Step 1: Date Selection */}
        {step === 1 && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Select Date Range
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Choose the time period for weather analysis
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors text-base"
                />
              </div>

              <button
                onClick={nextStep}
                disabled={!formData.start_date || !formData.end_date}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Analysis Options */}
        {step === 2 && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Analysis Options
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Configure your weather analysis settings
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              {/* AI Analysis Toggle */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                <input
                  type="checkbox"
                  name="include_ai"
                  id="include_ai"
                  checked={formData.include_ai}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="include_ai" className="cursor-pointer">
                    <div className="font-semibold text-slate-900 dark:text-white mb-1">
                      Include AI Analysis
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Get intelligent insights and risk assessments using Google Gemini AI
                    </div>
                  </label>
                </div>
                <div className="text-2xl">🧠</div>
              </div>

              {/* Date Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Analysis Summary
                </h4>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <p>📅 From: {formData.start_date}</p>
                  <p>📅 To: {formData.end_date}</p>
                  <p>🤖 AI Analysis: {formData.include_ai ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={prevStep}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-4 px-6 rounded-2xl transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Back
                </button>
                <button
                  onClick={startAnalysis}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Progress */}
        {step === 3 && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Analyzing Data
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Processing NASA satellite data...
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              {/* Progress Circle */}
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                      className="text-blue-600 transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Message */}
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {progressMessage}
                </p>
                
                {/* Animated dots */}
                <div className="flex justify-center space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 bg-blue-600 rounded-full animate-pulse`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
