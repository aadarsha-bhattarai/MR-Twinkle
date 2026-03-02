/**
 * React hook for managing application configuration with localStorage persistence
 * 
 * Requirements: 15.7
 */

import { useState, useEffect, useCallback } from 'react';
import { Configuration } from '../types/core';
import {
  saveConfiguration,
  loadConfiguration,
  clearConfiguration,
} from '../utils/configPersistence';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Configuration = {
  twinkleModeEnabled: false,
  storytellingMode: 'kid',
};

/**
 * Hook for managing application configuration with automatic persistence
 * 
 * @returns Configuration state and update functions
 */
export function useConfiguration() {
  const [config, setConfig] = useState<Configuration>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    const result = loadConfiguration();
    if (result.success) {
      setConfig(result.data);
    }
    setIsLoaded(true);
  }, []);

  // Update configuration and persist to localStorage
  const updateConfig = useCallback((updates: Partial<Configuration>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };
      saveConfiguration(newConfig);
      return newConfig;
    });
  }, []);

  // Toggle Twinkle Mode
  const toggleTwinkleMode = useCallback(() => {
    updateConfig({ twinkleModeEnabled: !config.twinkleModeEnabled });
  }, [config.twinkleModeEnabled, updateConfig]);

  // Set storytelling mode
  const setStorytellingMode = useCallback(
    (mode: 'kid' | 'deepSpace') => {
      updateConfig({ storytellingMode: mode });
    },
    [updateConfig]
  );

  // Save last view position
  const saveViewPosition = useCallback(
    (position: Configuration['lastViewPosition']) => {
      updateConfig({ lastViewPosition: position });
    },
    [updateConfig]
  );

  // Save last location
  const saveLocation = useCallback(
    (location: Configuration['lastLocation']) => {
      updateConfig({ lastLocation: location });
    },
    [updateConfig]
  );

  // Reset configuration to defaults
  const resetConfig = useCallback(() => {
    clearConfiguration();
    setConfig(DEFAULT_CONFIG);
  }, []);

  return {
    config,
    isLoaded,
    updateConfig,
    toggleTwinkleMode,
    setStorytellingMode,
    saveViewPosition,
    saveLocation,
    resetConfig,
  };
}
