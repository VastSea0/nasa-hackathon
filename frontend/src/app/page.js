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
    
    if (hasSeenOnboarding && isLoggedIn) {
      router.push('/dashboard');
    } else if (hasSeenOnboarding && !isLoggedIn) {
      router.push('/login');
    }
    // If no onboarding completed, show onboarding page
  }, [router]);

  return <OnboardingPage />;
}
