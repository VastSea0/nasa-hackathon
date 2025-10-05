'use client';

import { useState } from 'react';

export default function LoginCard({ connectionStatus, earthAccessStatus, onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      alert('Lütfen kullanıcı adı ve şifrenizi girin');
      return;
    }
    
    setIsLoading(true);
    await onLogin(credentials);
    setIsLoading(false);
  };

  return (
    <div className="w-full">
      {!earthAccessStatus ? (
        <div className="space-y-4">
          {/* Status Banner */}
          <div className={`flex items-center space-x-3 p-3 rounded-xl border ${
            connectionStatus === 'connected' 
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              connectionStatus === 'connected'
                ? 'bg-amber-100 dark:bg-amber-800'
                : 'bg-red-100 dark:bg-red-800'
            }`}>
              <svg className={`w-4 h-4 ${
                connectionStatus === 'connected' 
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={connectionStatus === 'connected' 
                    ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                    : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  } 
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                connectionStatus === 'connected'
                  ? 'text-amber-800 dark:text-amber-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {connectionStatus === 'connected' 
                  ? 'NASA EarthAccess authentication required'
                  : 'Server connection failed'
                }
              </p>
              <p className={`text-xs ${
                connectionStatus === 'connected'
                  ? 'text-amber-600 dark:text-amber-300'
                  : 'text-red-600 dark:text-red-300'
              }`}>
                {connectionStatus === 'connected' 
                  ? 'Please login with your NASA EarthAccess credentials'
                  : 'Check your internet connection and try again'
                }
              </p>
            </div>
          </div>

          {/* Login Form */}
          {connectionStatus === 'connected' && (
            <div className="space-y-4">
              {!showCredentials ? (
                <button
                  onClick={() => setShowCredentials(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Connect to NASA EarthAccess</span>
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Credentials Form */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={credentials.username}
                          onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="NASA EarthAccess username"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors text-sm"
                          disabled={isLoading}
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={credentials.password}
                          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="NASA EarthAccess password"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors text-sm"
                          disabled={isLoading}
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowCredentials(false)}
                      className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogin}
                      disabled={isLoading || !credentials.username || !credentials.password}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Login</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Help Text */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Need an account?</span> Register at{' '}
                      <a href="https://urs.earthdata.nasa.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                        urs.earthdata.nasa.gov
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Success State */
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Connected to NASA EarthAccess
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-300">
                Ready for weather analysis
              </p>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}
