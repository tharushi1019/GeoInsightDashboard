import React from 'react';

const AirQualityCard = ({ airQuality, className = '' }) => {
  const getAQIColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unhealthy for sensitive':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'very unhealthy':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'hazardous':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAQIIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'good':
        return '✅';
      case 'moderate':
        return '⚠️';
      case 'unhealthy for sensitive':
      case 'unhealthy':
        return '🔶';
      case 'very unhealthy':
        return '🔴';
      case 'hazardous':
        return '☠️';
      default:
        return '🌫️';
    }
  };

  const getHealthRecommendation = (status) => {
    switch (status?.toLowerCase()) {
      case 'good':
        return 'Air quality is good. Enjoy outdoor activities!';
      case 'moderate':
        return 'Air quality is acceptable for most people.';
      case 'unhealthy for sensitive':
        return 'Sensitive individuals should limit outdoor activities.';
      case 'unhealthy':
        return 'Everyone should limit prolonged outdoor activities.';
      case 'very unhealthy':
        return 'Avoid outdoor activities. Stay indoors if possible.';
      case 'hazardous':
        return 'Health warnings of emergency conditions. Stay indoors.';
      default:
        return 'Air quality data not available.';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          🌫️ Air Quality
        </h3>
        <span className="text-2xl">{getAQIIcon(airQuality.status)}</span>
      </div>
      
      <div className="space-y-4">
        {/* AQI Value Display */}
        <div className="text-center py-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl font-bold text-gray-800">
              {airQuality.value}
            </span>
            {airQuality.unit && (
              <span className="text-sm text-gray-600">{airQuality.unit}</span>
            )}
          </div>
          {airQuality.parameter && airQuality.parameter !== 'N/A' && (
            <p className="text-xs text-gray-500 mt-1">{airQuality.parameter}</p>
          )}
        </div>

        {/* Status Badge */}
        <div className={`px-3 py-2 rounded-lg border text-center ${getAQIColor(airQuality.status)}`}>
          <span className="text-sm font-semibold">
            {airQuality.status || 'Unknown'}
          </span>
        </div>

        {/* Health Recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800 text-center">
            💡 {getHealthRecommendation(airQuality.status)}
          </p>
        </div>

        {/* Additional Info */}
        {airQuality.parameter && airQuality.parameter !== 'N/A' && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
            Measuring: {airQuality.parameter}
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQualityCard;