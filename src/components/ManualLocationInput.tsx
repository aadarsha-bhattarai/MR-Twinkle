/**
 * Manual location input form component
 * 
 * Provides a fallback form for users to manually enter their geographic coordinates
 * when browser geolocation is unavailable or denied.
 * 
 * Requirements: 1.3, 1.4
 */

import { useState, FormEvent } from 'react';
import { UserLocation } from '../types/core';

export interface ManualLocationInputProps {
  /** Callback function called when valid location is submitted */
  onLocationSubmit: (location: UserLocation) => void;
  /** Optional initial latitude value */
  initialLatitude?: number;
  /** Optional initial longitude value */
  initialLongitude?: number;
}

/**
 * Validates latitude coordinate
 * @param lat - Latitude value to validate
 * @returns true if valid, false otherwise
 */
export function isValidLatitude(lat: number): boolean {
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * Validates longitude coordinate
 * @param lon - Longitude value to validate
 * @returns true if valid, false otherwise
 */
export function isValidLongitude(lon: number): boolean {
  return !isNaN(lon) && lon >= -180 && lon <= 180;
}

/**
 * Manual location input form component
 * 
 * Displays when geolocation is denied or unavailable.
 * Validates coordinates: latitude (-90 to 90), longitude (-180 to 180)
 */
export function ManualLocationInput({
  onLocationSubmit,
  initialLatitude = 0,
  initialLongitude = 0,
}: ManualLocationInputProps) {
  const [latitude, setLatitude] = useState<string>(initialLatitude.toString());
  const [longitude, setLongitude] = useState<string>(initialLongitude.toString());
  const [errors, setErrors] = useState<{ latitude?: string; longitude?: string }>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    const newErrors: { latitude?: string; longitude?: string } = {};
    
    // Validate latitude
    if (latitude.trim() === '') {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(lat)) {
      newErrors.latitude = 'Latitude must be a valid number';
    } else if (!isValidLatitude(lat)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    
    // Validate longitude
    if (longitude.trim() === '') {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(lon)) {
      newErrors.longitude = 'Longitude must be a valid number';
    } else if (!isValidLongitude(lon)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    
    // If there are errors, update state and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors and submit valid location
    setErrors({});
    
    const location: UserLocation = {
      latitude: lat,
      longitude: lon,
      accuracy: 0, // Manual input has no accuracy measurement
    };
    
    onLocationSubmit(location);
  };

  const handleLatitudeChange = (value: string) => {
    setLatitude(value);
    // Clear error when user starts typing
    if (errors.latitude) {
      setErrors({ ...errors, latitude: undefined });
    }
  };

  const handleLongitudeChange = (value: string) => {
    setLongitude(value);
    // Clear error when user starts typing
    if (errors.longitude) {
      setErrors({ ...errors, longitude: undefined });
    }
  };

  return (
    <div className="manual-location-input bg-[#0B0F2A] bg-opacity-80 backdrop-blur-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-white mb-2">Enter Your Location</h2>
      <p className="text-gray-300 text-sm mb-4">
        Please enter your geographic coordinates to view the night sky from your location.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Latitude Input */}
        <div>
          <label htmlFor="latitude" className="block text-white text-sm font-medium mb-1">
            Latitude
          </label>
          <input
            type="text"
            id="latitude"
            value={latitude}
            onChange={(e) => handleLatitudeChange(e.target.value)}
            placeholder="e.g., 40.7128"
            className={`w-full px-3 py-2 bg-white bg-opacity-10 border ${
              errors.latitude ? 'border-red-500' : 'border-gray-600'
            } rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            aria-label="Latitude coordinate"
            aria-describedby={errors.latitude ? 'latitude-error' : undefined}
            aria-invalid={!!errors.latitude}
          />
          {errors.latitude && (
            <p id="latitude-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.latitude}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-1">Valid range: -90 to 90</p>
        </div>

        {/* Longitude Input */}
        <div>
          <label htmlFor="longitude" className="block text-white text-sm font-medium mb-1">
            Longitude
          </label>
          <input
            type="text"
            id="longitude"
            value={longitude}
            onChange={(e) => handleLongitudeChange(e.target.value)}
            placeholder="e.g., -74.0060"
            className={`w-full px-3 py-2 bg-white bg-opacity-10 border ${
              errors.longitude ? 'border-red-500' : 'border-gray-600'
            } rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            aria-label="Longitude coordinate"
            aria-describedby={errors.longitude ? 'longitude-error' : undefined}
            aria-invalid={!!errors.longitude}
          />
          {errors.longitude && (
            <p id="longitude-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.longitude}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-1">Valid range: -180 to 180</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0F2A]"
          aria-label="Submit location"
        >
          Set Location
        </button>
      </form>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>Tip: You can find your coordinates using online tools or map services.</p>
      </div>
    </div>
  );
}
