'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingPage from '../pages/OnboardingPage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasSeenOnboarding = localStorage.getItem('nasa_onboarding_complete');
    const isLoggedIn = localStorage.getItem('nasa_logged_in');
    const userProfile = localStorage.getItem('nasa_user_profile');
    
    // Debug logs to understand current state
    console.log('Onboarding Status:', {
      hasSeenOnboarding,
      isLoggedIn,
      hasProfile: !!userProfile,
      profileData: userProfile ? JSON.parse(userProfile) : null
    });
    
    if (hasSeenOnboarding && isLoggedIn) {
      router.push('/dashboard');
    } else if (hasSeenOnboarding && !isLoggedIn) {
      router.push('/login');
    }
    // If no onboarding completed, show onboarding page
  }, [router]);

  // Quick reset function for testing
  const resetOnboarding = () => {
    localStorage.removeItem('nasa_onboarding_complete');
    localStorage.removeItem('nasa_user_profile');
    window.location.reload();
  };

  // Check if user has already completed onboarding but wants to test
  const hasSeenOnboarding = localStorage.getItem('nasa_onboarding_complete');
  const userProfile = localStorage.getItem('nasa_user_profile');

  // If onboarding is complete but user is here, show option to test new onboarding
  if (hasSeenOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 max-w-md text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Onboarding Already Complete! 🎉
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You've already completed the onboarding process. {userProfile ? 'Your profile is ready!' : 'No profile found.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Go to Login
            </button>
            <button
              onClick={resetOnboarding}
              className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Reset & Try New Onboarding
            </button>
            {userProfile && (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Go to Dashboard (Demo Mode)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <OnboardingPage />;
}
