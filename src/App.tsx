/**
 * Main Application Component
 * Integrates WebGL detection, geolocation, and fallback handling
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.7, 14.1, 14.2
 */

import { useWebGL } from '@hooks/useWebGL';
import { useGeolocation } from '@hooks/useGeolocation';
import { WebGLFallback } from '@components/WebGLFallback';
import { ManualLocationInput } from '@components/ManualLocationInput';
import { getWebGLErrorMessage } from '@utils/webgl';
import { UserLocation } from '@types/core';
import { useState } from 'react';

function App() {
  const webgl = useWebGL();
  const geolocation = useGeolocation();
  const [manualLocation, setManualLocation] = useState<UserLocation | null>(null);
  
  // Display fallback if WebGL is not supported (Requirement 14.1)
  if (!webgl.supported) {
    return <WebGLFallback message={getWebGLErrorMessage()} />;
  }
  
  // Determine the current location (from geolocation or manual input)
  const currentLocation = geolocation.location || manualLocation;
  
  // Show manual location input when geolocation is denied (Requirements 1.3, 14.2)
  const showManualInput = geolocation.status === 'denied' && !manualLocation;
  
  const handleManualLocationSubmit = (location: UserLocation) => {
    setManualLocation(location);
  };
  
  return (
    <div className="w-screen h-screen bg-[#0B0F2A] flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-white text-4xl font-sans text-center mb-4">
          Mr. Twinkle - Constellation Explorer
        </h1>
        
        {/* WebGL Status */}
        <p className="text-white/60 text-sm text-center mb-8">
          WebGL {webgl.version} Ready
        </p>
        
        {/* Geolocation Status */}
        <div className="text-center mb-8">
          {geolocation.status === 'loading' && (
            <p className="text-white/80">Requesting your location...</p>
          )}
          
          {geolocation.status === 'granted' && geolocation.location && (
            <div className="text-white/80">
              <p className="text-green-400 mb-2">✓ Location detected</p>
              <p className="text-sm">
                Latitude: {geolocation.location.latitude.toFixed(4)}°, 
                Longitude: {geolocation.location.longitude.toFixed(4)}°
              </p>
              <p className="text-xs text-white/60 mt-1">
                Accuracy: {geolocation.location.accuracy.toFixed(0)}m
              </p>
            </div>
          )}
          
          {geolocation.status === 'error' && (
            <div className="text-red-400">
              <p>⚠ {geolocation.error}</p>
              <button
                onClick={geolocation.retry}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          
          {manualLocation && (
            <div className="text-white/80">
              <p className="text-blue-400 mb-2">✓ Manual location set</p>
              <p className="text-sm">
                Latitude: {manualLocation.latitude.toFixed(4)}°, 
                Longitude: {manualLocation.longitude.toFixed(4)}°
              </p>
            </div>
          )}
        </div>
        
        {/* Manual Location Input Form (shown when geolocation is denied) */}
        {showManualInput && (
          <div className="mt-8">
            <ManualLocationInput onLocationSubmit={handleManualLocationSubmit} />
          </div>
        )}
        
        {/* Sky View Placeholder (will be replaced with actual sky rendering) */}
        {currentLocation && (
          <div className="mt-8 text-center text-white/60">
            <p>Sky view will render here based on your location</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
