/**
 * Configuration Parser for Mr. Twinkle - AI Constellation Explorer
 * 
 * Validates and parses JSON configuration files containing user preferences.
 * Requirements: 15.1, 15.2, 15.3, 15.6
 */

import { Configuration, UserLocation } from '../types/core';

/**
 * Result type for configuration parsing
 */
export type ParseResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Validates that a value is a boolean
 */
function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Validates that a value is a string
 */
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Validates that a value is a number
 */
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Validates that a value is a plain object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates UserLocation structure
 */
function validateUserLocation(location: unknown, path: string): ParseResult<UserLocation> {
  if (!isObject(location)) {
    return { success: false, error: `${path}: must be an object` };
  }

  if (!('latitude' in location)) {
    return { success: false, error: `${path}.latitude: required field is missing` };
  }
  if (!isNumber(location.latitude)) {
    return { success: false, error: `${path}.latitude: must be a number` };
  }
  if (location.latitude < -90 || location.latitude > 90) {
    return { success: false, error: `${path}.latitude: must be between -90 and 90, got ${location.latitude}` };
  }

  if (!('longitude' in location)) {
    return { success: false, error: `${path}.longitude: required field is missing` };
  }
  if (!isNumber(location.longitude)) {
    return { success: false, error: `${path}.longitude: must be a number` };
  }
  if (location.longitude < -180 || location.longitude > 180) {
    return { success: false, error: `${path}.longitude: must be between -180 and 180, got ${location.longitude}` };
  }

  if (!('accuracy' in location)) {
    return { success: false, error: `${path}.accuracy: required field is missing` };
  }
  if (!isNumber(location.accuracy)) {
    return { success: false, error: `${path}.accuracy: must be a number` };
  }
  if (location.accuracy < 0) {
    return { success: false, error: `${path}.accuracy: must be non-negative, got ${location.accuracy}` };
  }

  return {
    success: true,
    data: {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
    },
  };
}

/**
 * Validates lastViewPosition structure
 */
function validateLastViewPosition(position: unknown, path: string): ParseResult<Configuration['lastViewPosition']> {
  if (!isObject(position)) {
    return { success: false, error: `${path}: must be an object` };
  }

  // Validate rotation
  if (!('rotation' in position)) {
    return { success: false, error: `${path}.rotation: required field is missing` };
  }
  if (!isObject(position.rotation)) {
    return { success: false, error: `${path}.rotation: must be an object` };
  }

  const rotation = position.rotation;
  if (!('x' in rotation)) {
    return { success: false, error: `${path}.rotation.x: required field is missing` };
  }
  if (!isNumber(rotation.x)) {
    return { success: false, error: `${path}.rotation.x: must be a number` };
  }

  if (!('y' in rotation)) {
    return { success: false, error: `${path}.rotation.y: required field is missing` };
  }
  if (!isNumber(rotation.y)) {
    return { success: false, error: `${path}.rotation.y: must be a number` };
  }

  if (!('z' in rotation)) {
    return { success: false, error: `${path}.rotation.z: required field is missing` };
  }
  if (!isNumber(rotation.z)) {
    return { success: false, error: `${path}.rotation.z: must be a number` };
  }

  // Validate zoom
  if (!('zoom' in position)) {
    return { success: false, error: `${path}.zoom: required field is missing` };
  }
  if (!isNumber(position.zoom)) {
    return { success: false, error: `${path}.zoom: must be a number` };
  }
  if (position.zoom < 0.5 || position.zoom > 5.0) {
    return { success: false, error: `${path}.zoom: must be between 0.5 and 5.0, got ${position.zoom}` };
  }

  return {
    success: true,
    data: {
      rotation: {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z,
      },
      zoom: position.zoom,
    },
  };
}

/**
 * Parses and validates a Configuration object from JSON string or object
 * 
 * Requirements:
 * - 15.1: Parse JSON configuration files containing user preferences
 * - 15.2: Parse valid configuration within 500 milliseconds
 * - 15.3: Return descriptive error messages for invalid configurations
 * - 15.6: Validate that all required configuration fields are present
 * 
 * @param input - JSON string or object to parse
 * @returns ParseResult with either the validated Configuration or an error message
 */
export function parseConfiguration(input: string | unknown): ParseResult<Configuration> {
  const startTime = performance.now();

  try {
    // Parse JSON string if needed
    let data: unknown;
    if (isString(input)) {
      try {
        data = JSON.parse(input);
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Unknown JSON parsing error';
        return { success: false, error: `JSON parsing failed: ${error}` };
      }
    } else {
      data = input;
    }

    // Validate root is an object
    if (!isObject(data)) {
      return { success: false, error: 'Configuration must be an object' };
    }

    // Validate required field: twinkleModeEnabled
    if (!('twinkleModeEnabled' in data)) {
      return { success: false, error: 'twinkleModeEnabled: required field is missing' };
    }
    if (!isBoolean(data.twinkleModeEnabled)) {
      return { success: false, error: 'twinkleModeEnabled: must be a boolean' };
    }

    // Validate required field: storytellingMode
    if (!('storytellingMode' in data)) {
      return { success: false, error: 'storytellingMode: required field is missing' };
    }
    if (!isString(data.storytellingMode)) {
      return { success: false, error: 'storytellingMode: must be a string' };
    }
    if (data.storytellingMode !== 'kid' && data.storytellingMode !== 'deepSpace') {
      return { 
        success: false, 
        error: `storytellingMode: must be 'kid' or 'deepSpace', got '${data.storytellingMode}'` 
      };
    }

    // Validate optional field: lastViewPosition
    let lastViewPosition: Configuration['lastViewPosition'] = undefined;
    if ('lastViewPosition' in data && data.lastViewPosition !== undefined && data.lastViewPosition !== null) {
      const result = validateLastViewPosition(data.lastViewPosition, 'lastViewPosition');
      if (!result.success) {
        return result;
      }
      lastViewPosition = result.data;
    }

    // Validate optional field: lastLocation
    let lastLocation: UserLocation | undefined = undefined;
    if ('lastLocation' in data && data.lastLocation !== undefined && data.lastLocation !== null) {
      const result = validateUserLocation(data.lastLocation, 'lastLocation');
      if (!result.success) {
        return result;
      }
      lastLocation = result.data;
    }

    // Check performance requirement (500ms)
    const elapsedTime = performance.now() - startTime;
    if (elapsedTime > 500) {
      console.warn(`Configuration parsing took ${elapsedTime.toFixed(2)}ms, exceeding 500ms requirement`);
    }

    // Return validated configuration
    return {
      success: true,
      data: {
        twinkleModeEnabled: data.twinkleModeEnabled,
        storytellingMode: data.storytellingMode,
        lastViewPosition,
        lastLocation,
      },
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: `Unexpected error during parsing: ${error}` };
  }
}

/**
 * Serializes a Configuration object to JSON string
 * 
 * Requirements:
 * - 15.4: Format Configuration objects into valid JSON files
 * 
 * @param config - Configuration object to serialize
 * @returns JSON string representation of the configuration
 */
export function serializeConfiguration(config: Configuration): string {
  return JSON.stringify(config, null, 2);
}
