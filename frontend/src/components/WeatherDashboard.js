'use client';

export default function WeatherDashboard() {
  const weatherFeatures = [
    {
      icon: '🌡️',
      title: 'Temperature Analysis',
      description: 'Real-time temperature data from NASA MERRA-2 reanalysis',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: '🌧️',
      title: 'Precipitation Tracking',
      description: 'Comprehensive rainfall and precipitation patterns',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '💨',
      title: 'Wind Patterns',
      description: 'Wind speed and direction visualization with vector fields',
      color: 'from-gray-500 to-blue-500'
    },
    {
      icon: '🌵',
      title: 'Drought Index',
      description: 'Soil moisture and drought risk assessment',
      color: 'from-yellow-500 to-red-500'
    },
    {
      icon: '🌫️',
      title: 'Aerosol Data',
      description: 'Atmospheric aerosol optical depth measurements',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🤖',
      title: 'AI Insights',
      description: 'Smart analysis and recommendations using Google Gemini',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Advanced Weather Analytics
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Powered by NASA's Earth Science datasets, our platform provides comprehensive 
          meteorological analysis with cutting-edge visualization and AI-driven insights.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weatherFeatures.map((feature, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            {/* Icon */}
            <div className="relative mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center text-white text-xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>

            {/* Hover Effect Border */}
            <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Data Variables</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">24/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Real-time Updates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Global</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">AI</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Powered</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Connect to NASA EarthAccess and start your first analysis</span>
        </div>
      </div>
    </div>
  );
}
