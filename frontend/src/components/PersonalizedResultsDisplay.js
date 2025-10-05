'use client';

import { useState } from 'react';

export default function PersonalizedResultsDisplay({ results, userProfile, onNewPrediction }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'forecast', label: 'Detailed Forecast', icon: '🌤️' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡' },
    { id: 'alerts', label: 'Health & Safety', icon: '⚠️' }
  ];

  const parseAnalysisContent = (content) => {
    // Try to parse structured content from AI response
    if (!content) return null;
    
    // Look for sections in the content
    const sections = {
      numerical: [],
      insights: [],
      recommendations: [],
      warnings: []
    };

    const lines = content.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect sections
      if (trimmed.toLowerCase().includes('numerical forecast') || trimmed.toLowerCase().includes('forecast data')) {
        currentSection = 'numerical';
      } else if (trimmed.toLowerCase().includes('personalized insights') || trimmed.toLowerCase().includes('insights')) {
        currentSection = 'insights';
      } else if (trimmed.toLowerCase().includes('recommendations') || trimmed.toLowerCase().includes('actionable')) {
        currentSection = 'recommendations';
      } else if (trimmed.toLowerCase().includes('warnings') || trimmed.toLowerCase().includes('alerts')) {
        currentSection = 'warnings';
      } else if (currentSection && trimmed.length > 0) {
        sections[currentSection].push(trimmed);
      }
    }

    return sections;
  };

  const parsedContent = parseAnalysisContent(results?.personalized_analysis);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (!results) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">No prediction results available</p>
      </div>
    );
  }

  const period = results.prediction_period;
  const dayCount = getDaysDifference(period.start_date, period.end_date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              🔮 Your Personalized Weather Prediction
            </h2>
            <p className="text-violet-100">
              {formatDate(period.start_date)} - {formatDate(period.end_date)} ({dayCount} days)
            </p>
            <p className="text-violet-200 text-sm mt-1">
              Tailored for {userProfile?.name} in {userProfile?.location}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-xl p-3">
              <span className="text-2xl block mb-1">🎯</span>
              <span className="text-sm">Personalized</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Context Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">👤</span>
          Your Profile Context
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Purpose</h4>
            <p className="text-slate-600 dark:text-slate-400 capitalize">
              {userProfile?.purpose?.replace('_', ' ') || 'General use'}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Activities</h4>
            <p className="text-slate-600 dark:text-slate-400">
              {userProfile?.activities?.length ? `${userProfile.activities.length} activities tracked` : 'None specified'}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Health Considerations</h4>
            <p className="text-slate-600 dark:text-slate-400">
              {userProfile?.healthConditions?.includes('none') ? 'None' : 
               userProfile?.healthConditions?.length ? `${userProfile.healthConditions.length} conditions` : 'None specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700 px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Quick Summary
                </h3>
                {results.base_data && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {results.base_data.temp_mean_C && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">🌡️</span>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {Math.round(results.base_data.temp_mean_C)}°C
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              Avg Temperature
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {results.base_data.precip_mean_mm_per_day !== undefined && (
                      <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">🌧️</span>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                              {results.base_data.precip_mean_mm_per_day.toFixed(1)}mm
                            </p>
                            <p className="text-sm text-cyan-600 dark:text-cyan-400">
                              Daily Precipitation
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {results.base_data.wind_mean_m_s && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">💨</span>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              {results.base_data.wind_mean_m_s.toFixed(1)}m/s
                            </p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">
                              Wind Speed
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  AI Analysis Summary
                </h3>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {results.personalized_analysis || 'No analysis available'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Forecast Tab */}
          {activeTab === 'forecast' && parsedContent && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Numerical Forecast Data
              </h3>
              {parsedContent.numerical.length > 0 ? (
                <div className="space-y-3">
                  {parsedContent.numerical.map((item, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                      <p className="text-slate-700 dark:text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                    {results.personalized_analysis}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && parsedContent && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Personalized Recommendations
              </h3>
              {parsedContent.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {parsedContent.recommendations.map((item, index) => (
                    <div key={index} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border-l-4 border-emerald-500">
                      <p className="text-slate-700 dark:text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              ) : parsedContent.insights.length > 0 ? (
                <div className="space-y-3">
                  {parsedContent.insights.map((item, index) => (
                    <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-slate-700 dark:text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                    {results.personalized_analysis}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Health & Safety Alerts
              </h3>
              {parsedContent && parsedContent.warnings.length > 0 ? (
                <div className="space-y-3">
                  {parsedContent.warnings.map((item, index) => (
                    <div key={index} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-l-4 border-amber-500">
                      <div className="flex items-start space-x-3">
                        <span className="text-amber-600 dark:text-amber-400 text-xl">⚠️</span>
                        <p className="text-slate-700 dark:text-slate-300">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    No specific health or safety alerts for your profile during this period.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onNewPrediction}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          Create New Prediction
        </button>
        <button
          onClick={() => window.print()}
          className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-xl transition-colors"
        >
          Export/Print
        </button>
      </div>
    </div>
  );
}
