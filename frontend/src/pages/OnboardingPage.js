'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: '🛰️',
      title: 'NASA Weather Intelligence',
      description: 'Access real-time weather data from NASA Earth science satellites and advanced meteorological analysis.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: '🌍',
      title: 'Global Weather Monitoring',
      description: 'Monitor weather patterns, temperature, precipitation, and atmospheric conditions worldwide.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Analysis',
      description: 'Get intelligent insights and risk assessments powered by Google Gemini AI technology.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: '📊',
      title: 'Professional Reports',
      description: 'Generate detailed weather reports with visualizations for agriculture, health, and transportation.',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem('nasa_onboarding_complete', 'true');
      router.push('/login');
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('nasa_onboarding_complete', 'true');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950 flex flex-col">
      {/* Skip Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={skipOnboarding}
          className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Icon */}
        <div className={`w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${slides[currentSlide].gradient} rounded-3xl flex items-center justify-center shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-300`}>
          <span className="text-4xl sm:text-5xl">
            {slides[currentSlide].icon}
          </span>
        </div>

        {/* Content */}
        <div className="text-center max-w-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {slides[currentSlide].title}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Slide Indicators */}
        <div className="flex space-x-2 mt-12 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-blue-600 dark:bg-blue-400' 
                  : 'w-2 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation Button */}
        <button
          onClick={nextSlide}
          className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
        </button>
      </div>

      {/* Bottom Wave */}
      <div className="relative">
        <svg
          className="w-full h-16 fill-blue-600 dark:fill-blue-800"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
}
