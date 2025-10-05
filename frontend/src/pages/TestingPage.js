'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestingPage() {
  const router = useRouter();
  const [status, setStatus] = useState({});

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('nasa_onboarding_complete');
    const isLoggedIn = localStorage.getItem('nasa_logged_in');
    const userProfile = localStorage.getItem('nasa_user_profile');
    
    setStatus({
      hasSeenOnboarding: !!hasSeenOnboarding,
      isLoggedIn: !!isLoggedIn,
      hasProfile: !!userProfile,
      profileData: userProfile ? JSON.parse(userProfile) : null
    });
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem('nasa_onboarding_complete');
    localStorage.removeItem('nasa_user_profile');
    alert('Onboarding reset! Redirecting to start fresh...');
    router.push('/');
  };

  const setDemoLogin = () => {
    localStorage.setItem('nasa_logged_in', 'demo');
    alert('Demo login set! You can now access all features.');
    router.push('/dashboard');
  };

  const clearAll = () => {
    localStorage.clear();
    alert('All data cleared! Starting fresh...');
    router.push('/');
  };

  const testPersonalizedPrediction = () => {
    if (status.hasProfile) {
      router.push('/prediction?demo=true');
    } else {
      alert('No profile found! Complete onboarding first.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            🧪 NASA Weather App - Testing Dashboard
          </h1>

          {/* Current Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Current Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border-2 ${
                status.hasSeenOnboarding 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="text-center">
                  <span className="text-2xl block mb-2">
                    {status.hasSeenOnboarding ? '✅' : '❌'}
                  </span>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Onboarding
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {status.hasSeenOnboarding ? 'Completed' : 'Not completed'}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                status.isLoggedIn 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="text-center">
                  <span className="text-2xl block mb-2">
                    {status.isLoggedIn ? '✅' : '❌'}
                  </span>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Login Status
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {status.isLoggedIn ? 'Logged in' : 'Not logged in'}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                status.hasProfile 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="text-center">
                  <span className="text-2xl block mb-2">
                    {status.hasProfile ? '✅' : '❌'}
                  </span>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    User Profile
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {status.hasProfile ? 'Available' : 'Missing'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Data */}
          {status.profileData && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Your Profile Data
              </h2>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Name:</strong> {status.profileData.name || 'Not set'}
                  </div>
                  <div>
                    <strong>Location:</strong> {status.profileData.location || 'Not set'}
                  </div>
                  <div>
                    <strong>Purpose:</strong> {status.profileData.purpose || 'Not set'}
                  </div>
                  <div>
                    <strong>Activities:</strong> {status.profileData.activities?.length || 0} selected
                  </div>
                  <div>
                    <strong>Health Conditions:</strong> {status.profileData.healthConditions?.length || 0} selected
                  </div>
                  <div>
                    <strong>Data Interests:</strong> {status.profileData.dataInterests?.length || 0} selected
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={resetOnboarding}
                className="p-4 bg-amber-100 dark:bg-amber-900/20 hover:bg-amber-200 dark:hover:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-medium rounded-xl transition-colors"
              >
                🔄 Reset Onboarding
                <span className="block text-sm mt-1 opacity-75">
                  Clear onboarding and profile data
                </span>
              </button>

              <button
                onClick={setDemoLogin}
                className="p-4 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium rounded-xl transition-colors"
              >
                🎭 Set Demo Login
                <span className="block text-sm mt-1 opacity-75">
                  Enable demo mode for testing
                </span>
              </button>

              <button
                onClick={testPersonalizedPrediction}
                disabled={!status.hasProfile}
                className="p-4 bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/30 disabled:bg-slate-100 disabled:text-slate-400 text-purple-800 dark:text-purple-200 font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                🔮 Test Personalized Prediction
                <span className="block text-sm mt-1 opacity-75">
                  Try the new prediction features
                </span>
              </button>

              <button
                onClick={clearAll}
                className="p-4 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-800 dark:text-red-200 font-medium rounded-xl transition-colors"
              >
                🗑️ Clear All Data
                <span className="block text-sm mt-1 opacity-75">
                  Reset everything to start fresh
                </span>
              </button>
            </div>
          </div>

          {/* Feature Access */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Feature Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
              >
                🏠 Home/Onboarding
              </button>

              <button
                onClick={() => router.push('/login')}
                className="p-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
              >
                🔐 Login Page
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="p-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
              >
                📊 Dashboard
              </button>

              <button
                onClick={() => router.push('/settings')}
                className="p-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
              📋 Testing Instructions
            </h3>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-decimal list-inside">
              <li>If you haven't completed onboarding, click "Reset Onboarding" to start fresh with the new features</li>
              <li>Complete the enhanced 9-step onboarding process</li>
              <li>Click "Set Demo Login" to enable testing mode</li>
              <li>Go to Dashboard and try "Personalized Prediction"</li>
              <li>Check out the Settings page to modify your profile</li>
              <li>Test different scenarios by updating your profile data</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
