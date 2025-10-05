'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PersonalizedResultsDisplay from '../components/PersonalizedResultsDisplay';

export default function PersonalizedPredictionPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [step, setStep] = useState(1);
  const [predictionData, setPredictionData] = useState({
    startDate: '',
    endDate: '',
    timeframe: '',
    customQuery: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [progress, setProgress] = useState(0);

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api';

  useEffect(() => {
    // Check if user is logged in and has profile
    const isLoggedIn = localStorage.getItem('nasa_logged_in');
    const profile = localStorage.getItem('nasa_user_profile');
    
    // For demo purposes, allow access if profile exists even without login
    const demoMode = window.location.search.includes('demo=true');
    
    if (!isLoggedIn && !demoMode) {
      router.push('/login');
      return;
    }
    
    if (!profile) {
      router.push('/');
      return;
    }

    const parsedProfile = JSON.parse(profile);
    setUserProfile(parsedProfile);

    // Set default dates based on user's preferred timeframe
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let endDate = new Date(tomorrow);
    const defaultTimeframe = parsedProfile.predictionPreferences?.defaultTimeframe || '7days';
    
    switch (defaultTimeframe) {
      case '3days':
        endDate.setDate(tomorrow.getDate() + 2);
        break;
      case '7days':
        endDate.setDate(tomorrow.getDate() + 6);
        break;
      case '14days':
        endDate.setDate(tomorrow.getDate() + 13);
        break;
      case '30days':
        endDate.setDate(tomorrow.getDate() + 29);
        break;
    }

    setPredictionData({
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      timeframe: defaultTimeframe,
      customQuery: ''
    });
  }, [router]);

  const timeframeOptions = [
    { id: '3days', label: '3 Days', icon: '🌤️', desc: 'Short-term planning' },
    { id: '7days', label: '7 Days', icon: '📅', desc: 'Weekly planning' },
    { id: '14days', label: '2 Weeks', icon: '📊', desc: 'Extended planning' },
    { id: '30days', label: '1 Month', icon: '📈', desc: 'Long-term trends' },
    { id: 'custom', label: 'Custom Range', icon: '⚙️', desc: 'Choose your own dates' }
  ];

  const commonQueries = [
    { id: 'general', text: 'General weather forecast for my activities', icon: '🌈' },
    { id: 'outdoor', text: 'Best days for outdoor activities', icon: '🏃' },
    { id: 'travel', text: 'Weather conditions for travel planning', icon: '✈️' },
    { id: 'health', text: 'Weather alerts for my health conditions', icon: '🏥' },
    { id: 'events', text: 'Weather suitability for planned events', icon: '🎉' },
    { id: 'agriculture', text: 'Agricultural weather insights', icon: '🌾' }
  ];

  const handleTimeframeChange = (timeframeId) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let endDate = new Date(tomorrow);
    
    if (timeframeId !== 'custom') {
      switch (timeframeId) {
        case '3days':
          endDate.setDate(tomorrow.getDate() + 2);
          break;
        case '7days':
          endDate.setDate(tomorrow.getDate() + 6);
          break;
        case '14days':
          endDate.setDate(tomorrow.getDate() + 13);
          break;
        case '30days':
          endDate.setDate(tomorrow.getDate() + 29);
          break;
      }

      setPredictionData(prev => ({
        ...prev,
        timeframe: timeframeId,
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }));
    } else {
      setPredictionData(prev => ({
        ...prev,
        timeframe: timeframeId
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setPredictionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectCommonQuery = (queryText) => {
    setPredictionData(prev => ({
      ...prev,
      customQuery: queryText
    }));
  };

  const generatePrediction = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const response = await fetch(`${API_BASE}/personalized-prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...predictionData,
          userProfile: userProfile
        })
      });

      const data = await response.json();

      if (data.success) {
        // Start polling for progress
        pollProgress(data.analysisId);
      } else {
        throw new Error(data.message || 'Failed to start prediction');
      }

    } catch (error) {
      console.error('Prediction error:', error);
      setIsGenerating(false);
      alert('Failed to generate prediction: ' + error.message);
    }
  };

  const pollProgress = async (analysisId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/prediction-progress/${analysisId}`);
        const data = await response.json();
        
        if (data.success) {
          setProgress(data.data.progress);
          
          if (data.data.status === 'completed') {
            setPredictions(data.data.result);
            setIsGenerating(false);
            setStep(3);
            clearInterval(interval);
          } else if (data.data.status === 'error') {
            setIsGenerating(false);
            alert('Prediction failed');
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Progress polling error:', error);
      }
    }, 2000);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return predictionData.timeframe.length > 0;
      case 2:
        return predictionData.startDate && predictionData.endDate;
      default:
        return true;
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  🔮 Personalized Prediction
                </h1>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Hello, {userProfile.name}!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm">
        <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500" 
             style={{ width: isGenerating ? `${progress}%` : `${(step / 3) * 100}%` }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Timeframe Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                When do you need predictions?
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Choose your prediction timeframe
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {timeframeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleTimeframeChange(option.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                    predictionData.timeframe === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-105'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:scale-102'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-4xl mb-3 block">{option.icon}</span>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {option.label}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {option.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {predictionData.timeframe && (
              <div className="text-center">
                <button
                  onClick={() => setStep(2)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date Selection and Query */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Specify your prediction details
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Fine-tune your weather forecast request
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Prediction Period
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={predictionData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={predictionData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={predictionData.startDate}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Common Queries */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  What would you like to know?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {commonQueries.map((query) => (
                    <button
                      key={query.id}
                      onClick={() => selectCommonQuery(query.text)}
                      className={`p-3 text-left rounded-xl border-2 transition-all duration-200 ${
                        predictionData.customQuery === query.text
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{query.icon}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {query.text}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Query */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Or ask your own question
                </h3>
                <textarea
                  value={predictionData.customQuery}
                  onChange={(e) => handleInputChange('customQuery', e.target.value)}
                  placeholder="e.g., Will it be good weather for my morning runs this week? Should I plan my garden work for the weekend?"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={generatePrediction}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                Generate Prediction
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generating/Results */}
        {(isGenerating || step === 3) && (
          <div className="space-y-6">
            {isGenerating ? (
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-4 animate-pulse">
                    <span className="text-4xl">🔮</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Generating Your Personalized Prediction
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Analyzing weather data and tailoring insights to your profile...
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-center text-slate-600 dark:text-slate-400">
                    {progress}% Complete
                  </p>
                </div>
              </div>
            ) : predictions && (
              <PersonalizedResultsDisplay 
                results={predictions}
                userProfile={userProfile}
                onNewPrediction={() => {
                  setStep(1);
                  setPredictions(null);
                  setProgress(0);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
