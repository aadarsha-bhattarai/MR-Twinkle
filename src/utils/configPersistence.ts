/**
 * Configuration Persistence for Mr. Twinkle - AI Constellation Explorer
 * 
 * Handles saving and loading user preferences to/from browser localStorage.
 * Requirements: 15.7
 */

import { Configuration } from '../types/core';
import { parseConfiguration, serializeConfiguration, ParseResult } from './configParser';

const STORAGE_KEY = 'mr-twinkle-config';

/**
 * Saves configuration to localStorage
 * 
 * @param config - Configuration object to save
 * @returns true if save was successful, false otherwise
 */
export function saveConfiguration(config: Configuration): boolean {
  try {
    const serialized = serializeConfiguration(config);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save configuration:', error);
    return false;
  }
}

/**
 * Loads configuration from localStorage
 * 
 * @returns ParseResult with either the loaded Configuration or an error message
 */
export function loadConfiguration(): ParseResult<Configuration> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored === null) {
      return {
        success: false,
        error: 'No configuration found in localStorage',
      };
    }

    return parseConfiguration(stored);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to load configuration: ${errorMessage}`,
    };
  }
}

/**
 * Clears configuration from localStorage
 * 
 * @returns true if clear was successful, false otherwise
 */
export function clearConfiguration(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear configuration:', error);
    return false;
  }
}

/**
 * Checks if a configuration exists in localStorage
 * 
 * @returns true if configuration exists, false otherwise
 */
export function hasConfiguration(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check configuration:', error);
    return false;
  }
}
