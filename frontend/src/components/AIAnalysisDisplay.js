'use client';

import { useState } from 'react';

export default function AIAnalysisDisplay({ aiAnalysis }) {
  const [activeTab, setActiveTab] = useState('summary');

  // Parse AI analysis if it's a string
  let analysisData = null;
  try {
    if (typeof aiAnalysis === 'string') {
      // Clean up the JSON string - remove any markdown formatting
      let cleanJson = aiAnalysis
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Check if it starts with a valid JSON character
      if (!cleanJson.startsWith('{') && !cleanJson.startsWith('[')) {
        // Try to find JSON within the string
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanJson = jsonMatch[0];
        } else {
          throw new Error('No valid JSON found in string');
        }
      }
      
      analysisData = JSON.parse(cleanJson);
    } else {
      analysisData = aiAnalysis;
    }
  } catch (error) {
    console.error('AI Analysis parse error:', error);
    console.log('Raw AI Analysis:', aiAnalysis);
    
    // Try to extract JSON manually if auto-parsing fails
    if (typeof aiAnalysis === 'string') {
      try {
        // Look for specific patterns in Turkish AI output
        const ozet = aiAnalysis.match(/"ozet":\s*"([^"]+)"/)?.[1];
        const tarim = aiAnalysis.match(/"tarim":\s*"([^"]+)"/)?.[1];
        const saglik = aiAnalysis.match(/"saglik":\s*"([^"]+)"/)?.[1];
        const ulasim = aiAnalysis.match(/"ulasim":\s*"([^"]+)"/)?.[1];
        
        if (ozet || tarim || saglik || ulasim) {
          analysisData = {
            ozet: ozet || 'Analiz sonucu mevcut değil',
            riskler: {
              tarim: tarim || 'Risk analizi mevcut değil',
              saglik: saglik || 'Risk analizi mevcut değil',
              ulasim: ulasim || 'Risk analizi mevcut değil'
            },
            oneriler: ['Detaylı analiz için lütfen tekrar deneyin']
          };
        }
      } catch (manualParseError) {
        console.error('Manual parse also failed:', manualParseError);
      }
    }
  }

  if (!analysisData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Analysis
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by Google Gemini
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200">
              AI analizi parse edilemedi. Ham veri konsola yazdırıldı.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { ozet, riskler, oneriler } = analysisData;

  const tabs = [
    { id: 'summary', label: 'Özet', icon: '📋' },
    { id: 'risks', label: 'Riskler', icon: '⚠️' },
    { id: 'recommendations', label: 'Öneriler', icon: '💡' }
  ];

  const riskCategories = [
    { id: 'tarim', label: 'Tarım', icon: '🌱', color: 'green' },
    { id: 'saglik', label: 'Sağlık', icon: '🏥', color: 'red' },
    { id: 'ulasim', label: 'Ulaşım', icon: '🚗', color: 'blue' }
  ];

  const getRiskColor = (category) => {
    const colors = {
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
    };
    return colors[category] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Weather Analysis
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by Google Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Genel Durum Özeti
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                    {ozet}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-4">
            {riskCategories.map((category) => (
              <div key={category.id} className={`p-4 border rounded-lg ${getRiskColor(category.color)}`}>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl flex-shrink-0">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2 text-lg">
                      {category.label} Riskleri
                    </h4>
                    <p className="leading-relaxed">
                      {riskler[category.id]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            {oneriler.map((oneri, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="w-6 h-6 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-green-800 dark:text-green-200 leading-relaxed">
                    {oneri}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>AI analizi Google Gemini tarafından oluşturulmuştur</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Güncel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
