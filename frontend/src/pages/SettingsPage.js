'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Check if user is logged in and has profile
    const isLoggedIn = localStorage.getItem('nasa_logged_in');
    const profile = localStorage.getItem('nasa_user_profile');
    
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }
    setIsLoading(false);
  }, [router]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'data', label: 'Data & Privacy', icon: '🔒' }
  ];

  const purposes = [
    { id: 'daily_planning', label: 'Daily Planning', icon: '📅', desc: 'Plan your day ahead' },
    { id: 'sports', label: 'Sports & Fitness', icon: '⚽', desc: 'Outdoor activities' },
    { id: 'travel', label: 'Travel', icon: '✈️', desc: 'Trip planning' },
    { id: 'agriculture', label: 'Agriculture', icon: '🌾', desc: 'Farming decisions' },
    { id: 'events', label: 'Events', icon: '🎪', desc: 'Event planning' },
    { id: 'health', label: 'Health', icon: '🏥', desc: 'Health monitoring' },
    { id: 'business', label: 'Business', icon: '💼', desc: 'Business operations' },
    { id: 'research', label: 'Research', icon: '🔬', desc: 'Scientific research' }
  ];

  const dataTypes = [
    { id: 'temperature', label: 'Temperature', icon: '🌡️' },
    { id: 'precipitation', label: 'Precipitation', icon: '🌧️' },
    { id: 'humidity', label: 'Humidity', icon: '💧' },
    { id: 'wind', label: 'Wind', icon: '💨' },
    { id: 'air_quality', label: 'Air Quality', icon: '🌫️' },
    { id: 'uv_index', label: 'UV Index', icon: '☀️' },
    { id: 'drought', label: 'Drought Index', icon: '🌵' },
    { id: 'storms', label: 'Severe Weather', icon: '⛈️' }
  ];

  const activities = [
    { id: 'running', label: 'Running/Jogging', icon: '🏃' },
    { id: 'cycling', label: 'Cycling', icon: '🚴' },
    { id: 'hiking', label: 'Hiking', icon: '🥾' },
    { id: 'gardening', label: 'Gardening', icon: '🌱' },
    { id: 'photography', label: 'Photography', icon: '📸' },
    { id: 'beach', label: 'Beach Activities', icon: '🏖️' },
    { id: 'commuting', label: 'Commuting', icon: '🚗' },
    { id: 'outdoor_work', label: 'Outdoor Work', icon: '🔨' }
  ];

  const healthConditions = [
    { id: 'asthma', label: 'Asthma', icon: '🫁' },
    { id: 'allergies', label: 'Seasonal Allergies', icon: '🤧' },
    { id: 'arthritis', label: 'Arthritis', icon: '🦴' },
    { id: 'migraines', label: 'Migraines', icon: '🧠' },
    { id: 'heart_condition', label: 'Heart Condition', icon: '❤️' },
    { id: 'skin_sensitive', label: 'Skin Sensitivity', icon: '🧴' },
    { id: 'respiratory', label: 'Respiratory Issues', icon: '💨' },
    { id: 'none', label: 'None', icon: '✅' }
  ];

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSelection = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field].filter(item => item !== value)
        : [...(prev[field] || []), value]
    }));
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('nasa_user_profile', JSON.stringify(userProfile));
      
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const resetOnboarding = () => {
    if (confirm('This will reset your onboarding and you\'ll need to complete it again. Continue?')) {
      localStorage.removeItem('nasa_onboarding_complete');
      localStorage.removeItem('nasa_user_profile');
      router.push('/');
    }
  };

  const clearData = () => {
    if (confirm('This will clear all your data including login status. Continue?')) {
      localStorage.clear();
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">No Profile Found</h2>
          <p className="text-slate-600 mb-6">You need to complete onboarding first.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Go to Onboarding
          </button>
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
                  ⚙️ Settings
                </h1>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Manage your preferences
                </span>
              </div>
            </div>
            {saveMessage && (
              <div className={`px-3 py-1 rounded-lg text-sm ${
                saveMessage.includes('success') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {saveMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 dark:border-slate-700 px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={userProfile.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={userProfile.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Primary Purpose
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {purposes.map((purpose) => (
                      <button
                        key={purpose.id}
                        onClick={() => handleInputChange('purpose', purpose.id)}
                        className={`p-3 text-left rounded-xl border-2 transition-all duration-200 ${
                          userProfile.purpose === purpose.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{purpose.icon}</span>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white text-sm">
                              {purpose.label}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {purpose.desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Weather Data Interests
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dataTypes.map((dataType) => (
                      <button
                        key={dataType.id}
                        onClick={() => toggleSelection('dataInterests', dataType.id)}
                        className={`p-3 text-center rounded-xl border-2 transition-all duration-200 ${
                          userProfile.dataInterests?.includes(dataType.id)
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl block mb-2">{dataType.icon}</span>
                        <p className="text-xs font-medium text-slate-900 dark:text-white">
                          {dataType.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Activities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {activities.map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => toggleSelection('activities', activity.id)}
                        className={`p-3 text-center rounded-xl border-2 transition-all duration-200 ${
                          userProfile.activities?.includes(activity.id)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl block mb-2">{activity.icon}</span>
                        <p className="text-xs font-medium text-slate-900 dark:text-white">
                          {activity.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Health Conditions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {healthConditions.map((condition) => (
                      <button
                        key={condition.id}
                        onClick={() => toggleSelection('healthConditions', condition.id)}
                        className={`p-3 text-center rounded-xl border-2 transition-all duration-200 ${
                          userProfile.healthConditions?.includes(condition.id)
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl block mb-2">{condition.icon}</span>
                        <p className="text-xs font-medium text-slate-900 dark:text-white">
                          {condition.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Prediction Preferences
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Default Timeframe
                      </label>
                      <select
                        value={userProfile.predictionPreferences?.defaultTimeframe || '7days'}
                        onChange={(e) => handleInputChange('predictionPreferences', {
                          ...userProfile.predictionPreferences,
                          defaultTimeframe: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="3days">3 Days</option>
                        <option value="7days">7 Days</option>
                        <option value="14days">2 Weeks</option>
                        <option value="30days">1 Month</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Detail Level
                      </label>
                      <select
                        value={userProfile.predictionPreferences?.detailLevel || 'detailed'}
                        onChange={(e) => handleInputChange('predictionPreferences', {
                          ...userProfile.predictionPreferences,
                          detailLevel: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="simple">Simple</option>
                        <option value="detailed">Detailed</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="includeRecommendations"
                        checked={userProfile.predictionPreferences?.includeRecommendations ?? true}
                        onChange={(e) => handleInputChange('predictionPreferences', {
                          ...userProfile.predictionPreferences,
                          includeRecommendations: e.target.checked
                        })}
                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="includeRecommendations" className="text-sm text-slate-700 dark:text-slate-300">
                        Include personalized recommendations
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Notification Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Weather Alerts</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Get notified about severe weather conditions
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={userProfile.notifications ?? true}
                        onChange={(e) => handleInputChange('notifications', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Privacy Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Data Management
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                        Reset Onboarding
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                        This will clear your profile and require you to complete onboarding again.
                      </p>
                      <button
                        onClick={resetOnboarding}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                      >
                        Reset Onboarding
                      </button>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                        Clear All Data
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                        This will permanently delete all your data including login status.
                      </p>
                      <button
                        onClick={clearData}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                      >
                        Clear All Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex justify-end">
              <button
                onClick={saveProfile}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
