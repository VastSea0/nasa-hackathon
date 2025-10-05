'use client';

import { useState } from 'react';
import Image from 'next/image';
import AIAnalysisDisplay from './AIAnalysisDisplay';

export default function ResultsSection({ results }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  if (!results) return null;

  const { summary, ai_analysis } = results;

  const handleImageError = (imagePath) => {
    console.error('Image load error for:', imagePath);
    setImageErrors(prev => ({ ...prev, [imagePath]: true }));
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${window.location.protocol}//${window.location.hostname}:5000/api/files/${path}`;
  };

  const summaryItems = [
    {
      icon: '🌡️',
      label: 'Temperature',
      value: summary.temp_mean_C ? `${summary.temp_mean_C.toFixed(1)}°C` : 'N/A',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: '🌧️',
      label: 'Precipitation',
      value: summary.precip_mean_mm_per_day ? `${summary.precip_mean_mm_per_day.toFixed(2)} mm/day` : 'N/A',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: '💨',
      label: 'Wind Speed',
      value: summary.wind_mean_m_s ? `${summary.wind_mean_m_s.toFixed(1)} m/s` : 'N/A',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-700'
    },
    {
      icon: '🌵',
      label: 'Drought Index',
      value: summary.drought_index_mean ? `${(summary.drought_index_mean * 100).toFixed(0)}%` : 'N/A',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Analysis Results
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {summary.dates && `${summary.dates[0]} to ${summary.dates[1]}`}
            </p>
          </div>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryItems.map((item, index) => (
            <div key={index} className={`${item.bgColor} rounded-xl p-4 border border-gray-200 dark:border-gray-600`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className={`text-lg font-bold ${item.color}`}>
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {item.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Maps */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Weather Visualizations
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {summary.map_path && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Comprehensive Weather Map
              </h4>
              {imageErrors[summary.map_path] ? (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Resim yüklenemedi
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {summary.map_path}
                  </p>
                </div>
              ) : (
                <div 
                  className="relative rounded-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => setSelectedImage(getImageUrl(summary.map_path))}
                >
                  <img
                    src={getImageUrl(summary.map_path)}
                    alt="Weather Map"
                    className="w-full h-auto"
                    onError={() => handleImageError(summary.map_path)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {summary.quick_plot_path && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Analysis View
              </h4>
              {imageErrors[summary.quick_plot_path] ? (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Resim yüklenemedi
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {summary.quick_plot_path}
                  </p>
                </div>
              ) : (
                <div 
                  className="relative rounded-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => setSelectedImage(getImageUrl(summary.quick_plot_path))}
                >
                  <img
                    src={getImageUrl(summary.quick_plot_path)}
                    alt="Quick Plot"
                    className="w-full h-auto"
                    onError={() => handleImageError(summary.quick_plot_path)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      {ai_analysis && (
        <AIAnalysisDisplay aiAnalysis={ai_analysis} />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Weather Map Full Size"
              className="max-w-full max-h-full rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
