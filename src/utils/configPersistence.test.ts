/**
 * Tests for Configuration Persistence
 * 
 * Validates localStorage operations for user preferences.
 * Requirements: 15.7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Configuration } from '../types/core';
import {
  saveConfiguration,
  loadConfiguration,
  clearConfiguration,
  hasConfiguration,
} from './configPersistence';

describe('Configuration Persistence', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveConfiguration', () => {
    it('should save a valid configuration to localStorage', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
        lastViewPosition: {
          rotation: { x: 0, y: 0, z: 0 },
          zoom: 1.0,
        },
      };

      const result = saveConfiguration(config);

      expect(result).toBe(true);
      expect(localStorage.getItem('mr-twinkle-config')).not.toBeNull();
    });

    it('should save configuration with all optional fields', () => {
      const config: Configuration = {
        twinkleModeEnabled: false,
        storytellingMode: 'deepSpace',
        lastViewPosition: {
          rotation: { x: 1.5, y: 2.3, z: 0.7 },
          zoom: 2.5,
        },
        lastLocation: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 50,
        },
      };

      const result = saveConfiguration(config);

      expect(result).toBe(true);
      const stored = localStorage.getItem('mr-twinkle-config');
      expect(stored).not.toBeNull();
      
      // Verify the stored data is valid JSON
      const parsed = JSON.parse(stored!);
      expect(parsed.twinkleModeEnabled).toBe(false);
      expect(parsed.storytellingMode).toBe('deepSpace');
      expect(parsed.lastLocation.latitude).toBe(37.7749);
    });

    it('should return false when localStorage is unavailable', () => {
      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
      };

      const result = saveConfiguration(config);

      expect(result).toBe(false);
      
      localStorage.setItem = originalSetItem;
    });
  });

  describe('loadConfiguration', () => {
    it('should load a previously saved configuration', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
        lastViewPosition: {
          rotation: { x: 0.5, y: 1.0, z: 0.2 },
          zoom: 1.5,
        },
      };

      saveConfiguration(config);
      const result = loadConfiguration();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.twinkleModeEnabled).toBe(true);
        expect(result.data.storytellingMode).toBe('kid');
        expect(result.data.lastViewPosition?.rotation.x).toBe(0.5);
        expect(result.data.lastViewPosition?.zoom).toBe(1.5);
      }
    });

    it('should return error when no configuration exists', () => {
      const result = loadConfiguration();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('No configuration found');
      }
    });

    it('should return error when stored data is invalid JSON', () => {
      localStorage.setItem('mr-twinkle-config', 'invalid json {');

      const result = loadConfiguration();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('JSON parsing failed');
      }
    });

    it('should return error when stored data is missing required fields', () => {
      localStorage.setItem('mr-twinkle-config', JSON.stringify({
        twinkleModeEnabled: true,
        // Missing storytellingMode
      }));

      const result = loadConfiguration();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('storytellingMode');
      }
    });

    it('should validate loaded configuration structure', () => {
      localStorage.setItem('mr-twinkle-config', JSON.stringify({
        twinkleModeEnabled: 'not a boolean',
        storytellingMode: 'kid',
      }));

      const result = loadConfiguration();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('boolean');
      }
    });
  });

  describe('clearConfiguration', () => {
    it('should remove configuration from localStorage', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
      };

      saveConfiguration(config);
      expect(localStorage.getItem('mr-twinkle-config')).not.toBeNull();

      const result = clearConfiguration();

      expect(result).toBe(true);
      expect(localStorage.getItem('mr-twinkle-config')).toBeNull();
    });

    it('should return true even when no configuration exists', () => {
      const result = clearConfiguration();

      expect(result).toBe(true);
      expect(localStorage.getItem('mr-twinkle-config')).toBeNull();
    });

    it('should return false when localStorage is unavailable', () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      const result = clearConfiguration();

      expect(result).toBe(false);
      
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('hasConfiguration', () => {
    it('should return true when configuration exists', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
      };

      saveConfiguration(config);

      expect(hasConfiguration()).toBe(true);
    });

    it('should return false when no configuration exists', () => {
      expect(hasConfiguration()).toBe(false);
    });

    it('should return false when localStorage is unavailable', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      const result = hasConfiguration();

      expect(result).toBe(false);
      
      localStorage.getItem = originalGetItem;
    });
  });

  describe('Integration: Save and Load cycle', () => {
    it('should preserve Twinkle Mode state', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
      };

      saveConfiguration(config);
      const loaded = loadConfiguration();

      expect(loaded.success).toBe(true);
      if (loaded.success) {
        expect(loaded.data.twinkleModeEnabled).toBe(true);
      }
    });

    it('should preserve storytelling mode', () => {
      const config: Configuration = {
        twinkleModeEnabled: false,
        storytellingMode: 'deepSpace',
      };

      saveConfiguration(config);
      const loaded = loadConfiguration();

      expect(loaded.success).toBe(true);
      if (loaded.success) {
        expect(loaded.data.storytellingMode).toBe('deepSpace');
      }
    });

    it('should preserve last view position', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
        lastViewPosition: {
          rotation: { x: 1.2, y: 3.4, z: 5.6 },
          zoom: 2.8,
        },
      };

      saveConfiguration(config);
      const loaded = loadConfiguration();

      expect(loaded.success).toBe(true);
      if (loaded.success) {
        expect(loaded.data.lastViewPosition).toBeDefined();
        expect(loaded.data.lastViewPosition?.rotation.x).toBe(1.2);
        expect(loaded.data.lastViewPosition?.rotation.y).toBe(3.4);
        expect(loaded.data.lastViewPosition?.rotation.z).toBe(5.6);
        expect(loaded.data.lastViewPosition?.zoom).toBe(2.8);
      }
    });

    it('should preserve last location', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
        lastLocation: {
          latitude: 51.5074,
          longitude: -0.1278,
          accuracy: 100,
        },
      };

      saveConfiguration(config);
      const loaded = loadConfiguration();

      expect(loaded.success).toBe(true);
      if (loaded.success) {
        expect(loaded.data.lastLocation).toBeDefined();
        expect(loaded.data.lastLocation?.latitude).toBe(51.5074);
        expect(loaded.data.lastLocation?.longitude).toBe(-0.1278);
        expect(loaded.data.lastLocation?.accuracy).toBe(100);
      }
    });

    it('should handle multiple save/load cycles', () => {
      const config1: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
      };

      saveConfiguration(config1);
      let loaded = loadConfiguration();
      expect(loaded.success).toBe(true);

      const config2: Configuration = {
        twinkleModeEnabled: false,
        storytellingMode: 'deepSpace',
        lastViewPosition: {
          rotation: { x: 0, y: 0, z: 0 },
          zoom: 3.0,
        },
      };

      saveConfiguration(config2);
      loaded = loadConfiguration();

      expect(loaded.success).toBe(true);
      if (loaded.success) {
        expect(loaded.data.twinkleModeEnabled).toBe(false);
        expect(loaded.data.storytellingMode).toBe('deepSpace');
        expect(loaded.data.lastViewPosition?.zoom).toBe(3.0);
      }
    });
  });
});
