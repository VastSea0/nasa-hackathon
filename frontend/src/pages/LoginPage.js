'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('Lütfen kullanıcı adı ve şifrenizi girin');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store login status
        localStorage.setItem('nasa_logged_in', 'true');
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login başarısız');
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 flex flex-col">
      {/* Header */}
      <div className="pt-8 pb-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
          <span className="text-2xl">🛰️</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          NASA EarthAccess
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          Sign in to access weather intelligence
        </p>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <form onSubmit={handleLogin} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
            {/* Username Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors text-base disabled:opacity-50"
                  placeholder="NASA username"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors text-base disabled:opacity-50"
                  placeholder="Password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !credentials.username || !credentials.password}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Connecting...</span>
                </div>
              ) : (
                'Sign In to NASA'
              )}
            </button>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Use your NASA EarthAccess credentials to access satellite weather data
              </p>
            </div>
          </form>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              ← Back to Welcome
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
