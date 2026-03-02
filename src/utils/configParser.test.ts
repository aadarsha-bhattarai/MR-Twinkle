/**
 * Unit tests for Configuration Parser
 * 
 * Tests validation logic, error messages, and performance requirements.
 * Requirements: 15.1, 15.2, 15.3, 15.6
 */

import { describe, it, expect } from 'vitest';
import { parseConfiguration, serializeConfiguration } from './configParser';
import type { Configuration } from '../types/core';

describe('parseConfiguration', () => {
  describe('valid configurations', () => {
    it('should parse minimal valid configuration', () => {
      const config = {
        twinkleModeEnabled: false,
        storytellingMode: 'kid' as const,
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.twinkleModeEnabled).toBe(false);
        expect(result.data.storytellingMode).toBe('kid');
        expect(result.data.lastViewPosition).toBeUndefined();
        expect(result.data.lastLocation).toBeUndefined();
      }
    });

    it('should parse configuration with all fields', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'deepSpace',
        lastViewPosition: {
          rotation: { x: 1.5, y: 2.3, z: 0.5 },
          zoom: 2.5,
        },
        lastLocation: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(config);
      }
    });

    it('should parse JSON string', () => {
      const jsonString = JSON.stringify({
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
      });

      const result = parseConfiguration(jsonString);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.twinkleModeEnabled).toBe(true);
        expect(result.data.storytellingMode).toBe('kid');
      }
    });

    it('should accept kid storytelling mode', () => {
      const config = {
        twinkleModeEnabled: false,
        storytellingMode: 'kid' as const,
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.storytellingMode).toBe('kid');
      }
    });

    it('should accept deepSpace storytelling mode', () => {
      const config = {
        twinkleModeEnabled: false,
        storytellingMode: 'deepSpace' as const,
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.storytellingMode).toBe('deepSpace');
      }
    });

    it('should handle null optional fields', () => {
      const config = {
        twinkleModeEnabled: false,
        storytellingMode: 'kid' as const,
        lastViewPosition: null,
        lastLocation: null,
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lastViewPosition).toBeUndefined();
        expect(result.data.lastLocation).toBeUndefined();
      }
    });
  });

  describe('required field validation', () => {
    it('should reject missing twinkleModeEnabled', () => {
      const config = {
        storytellingMode: 'kid',
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('twinkleModeEnabled');
        expect(result.error).toContain('required field is missing');
      }
    });

    it('should reject missing storytellingMode', () => {
      const config = {
        twinkleModeEnabled: true,
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('storytellingMode');
        expect(result.error).toContain('required field is missing');
      }
    });

    it('should reject non-boolean twinkleModeEnabled', () => {
      const config = {
        twinkleModeEnabled: 'true',
        storytellingMode: 'kid',
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('twinkleModeEnabled');
        expect(result.error).toContain('must be a boolean');
      }
    });

    it('should reject non-string storytellingMode', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 123,
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('storytellingMode');
        expect(result.error).toContain('must be a string');
      }
    });

    it('should reject invalid storytellingMode value', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'invalid',
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('storytellingMode');
        expect(result.error).toContain("must be 'kid' or 'deepSpace'");
        expect(result.error).toContain('invalid');
      }
    });
  });

  describe('lastViewPosition validation', () => {
    it('should reject non-object lastViewPosition', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastViewPosition: 'invalid',
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastViewPosition');
        expect(result.error).toContain('must be an object');
      }
    });

    it('should reject missing rotation', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastViewPosition: {
          zoom: 2.0,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastViewPosition.rotation');
        expect(result.error).toContain('required field is missing');
      }
    });

    it('should reject missing zoom', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastViewPosition: {
          rotation: { x: 0, y: 0, z: 0 },
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastViewPosition.zoom');
        expect(result.error).toContain('required field is missing');
      }
    });

    it('should reject missing rotation.x', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastViewPosition: {
          rotation: { y: 0, z: 0 },
          zoom: 1.0,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastViewPosition.rotation.x');
        expect(result.error).toContain('required field is missing');
      }
    });

    it('should reject zoom below 0.5', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastViewPosition: {
          rotation: { x: 0, y: 0, z: 0 },
          zoom: 0.3,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastViewPosition.zoom');
        expect(result.error).toContain('must be between 0.5 and 5.0');
        expect(result.error).toContain('0.3');
      }
    });

    it('should reject zoom above 5.0', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastViewPosition: {
          rotation: { x: 0, y: 0, z: 0 },
          zoom: 6.0,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastViewPosition.zoom');
        expect(result.error).toContain('must be between 0.5 and 5.0');
        expect(result.error).toContain('6');
      }
    });

    it('should accept zoom at boundary 0.5', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastViewPosition: {
          rotation: { x: 0, y: 0, z: 0 },
          zoom: 0.5,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
    });

    it('should accept zoom at boundary 5.0', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastViewPosition: {
          rotation: { x: 0, y: 0, z: 0 },
          zoom: 5.0,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
    });
  });

  describe('lastLocation validation', () => {
    it('should reject non-object lastLocation', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: 'invalid',
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastLocation');
        expect(result.error).toContain('must be an object');
      }
    });

    it('should reject missing latitude', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          longitude: 0,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastLocation.latitude');
        expect(result.error).toContain('required field is missing');
      }
    });

    it('should reject latitude below -90', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: -91,
          longitude: 0,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastLocation.latitude');
        expect(result.error).toContain('must be between -90 and 90');
        expect(result.error).toContain('-91');
      }
    });

    it('should reject latitude above 90', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: 91,
          longitude: 0,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastLocation.latitude');
        expect(result.error).toContain('must be between -90 and 90');
        expect(result.error).toContain('91');
      }
    });

    it('should reject longitude below -180', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: 0,
          longitude: -181,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastLocation.longitude');
        expect(result.error).toContain('must be between -180 and 180');
        expect(result.error).toContain('-181');
      }
    });

    it('should reject longitude above 180', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: 0,
          longitude: 181,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastLocation.longitude');
        expect(result.error).toContain('must be between -180 and 180');
        expect(result.error).toContain('181');
      }
    });

    it('should reject negative accuracy', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: 0,
          longitude: 0,
          accuracy: -10,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastLocation.accuracy');
        expect(result.error).toContain('must be non-negative');
        expect(result.error).toContain('-10');
      }
    });

    it('should accept latitude at boundary -90', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: -90,
          longitude: 0,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
    });

    it('should accept latitude at boundary 90', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: 90,
          longitude: 0,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
    });

    it('should accept longitude at boundary -180', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: 0,
          longitude: -180,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
    });

    it('should accept longitude at boundary 180', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: 0,
          longitude: 180,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
    });
  });

  describe('JSON parsing', () => {
    it('should reject invalid JSON string', () => {
      const invalidJson = '{ invalid json }';

      const result = parseConfiguration(invalidJson);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('JSON parsing failed');
      }
    });

    it('should reject non-object root', () => {
      const result = parseConfiguration('[]');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Configuration must be an object');
      }
    });

    it('should reject primitive values', () => {
      const result = parseConfiguration('"string"');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Configuration must be an object');
      }
    });
  });

  describe('performance requirement', () => {
    it('should parse configuration within 500ms', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'deepSpace',
        lastViewPosition: {
          rotation: { x: 1.5, y: 2.3, z: 0.5 },
          zoom: 2.5,
        },
        lastLocation: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 50,
        },
      };

      const startTime = performance.now();
      const result = parseConfiguration(config);
      const elapsedTime = performance.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(elapsedTime).toBeLessThan(500);
    });

    it('should parse large JSON string within 500ms', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'deepSpace',
        lastViewPosition: {
          rotation: { x: 1.5, y: 2.3, z: 0.5 },
          zoom: 2.5,
        },
        lastLocation: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 50,
        },
      };
      const jsonString = JSON.stringify(config);

      const startTime = performance.now();
      const result = parseConfiguration(jsonString);
      const elapsedTime = performance.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(elapsedTime).toBeLessThan(500);
    });
  });

  describe('edge cases', () => {
    it('should reject NaN values', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: NaN,
          longitude: 0,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastLocation.latitude');
        expect(result.error).toContain('must be a number');
      }
    });

    it('should reject Infinity values', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: 0,
          longitude: Infinity,
          accuracy: 50,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lastLocation.longitude');
        expect(result.error).toContain('must be a number');
      }
    });

    it('should accept zero accuracy', () => {
      const config = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid' as const,
        lastLocation: {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
        },
      };

      const result = parseConfiguration(config);
      
      expect(result.success).toBe(true);
    });
  });
});

describe('serializeConfiguration', () => {
  describe('valid serialization', () => {
    it('should serialize minimal configuration to valid JSON', () => {
      const config: Configuration = {
        twinkleModeEnabled: false,
        storytellingMode: 'kid',
      };

      const json = serializeConfiguration(config);
      
      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed.twinkleModeEnabled).toBe(false);
      expect(parsed.storytellingMode).toBe('kid');
    });

    it('should serialize configuration with all fields', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'deepSpace',
        lastViewPosition: {
          rotation: { x: 1.5, y: 2.3, z: 0.5 },
          zoom: 2.5,
        },
        lastLocation: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 50,
        },
      };

      const json = serializeConfiguration(config);
      
      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(config);
    });

    it('should serialize configuration with optional fields as undefined', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
        lastViewPosition: undefined,
        lastLocation: undefined,
      };

      const json = serializeConfiguration(config);
      
      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed.twinkleModeEnabled).toBe(true);
      expect(parsed.storytellingMode).toBe('kid');
    });

    it('should produce formatted JSON with indentation', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
      };

      const json = serializeConfiguration(config);
      
      // Check that JSON is formatted with newlines and indentation
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });
  });

  describe('round-trip consistency', () => {
    it('should maintain data integrity after serialize then parse', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'deepSpace',
        lastViewPosition: {
          rotation: { x: 1.5, y: 2.3, z: 0.5 },
          zoom: 2.5,
        },
        lastLocation: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 50,
        },
      };

      const json = serializeConfiguration(config);
      const result = parseConfiguration(json);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(config);
      }
    });

    it('should handle minimal configuration round-trip', () => {
      const config: Configuration = {
        twinkleModeEnabled: false,
        storytellingMode: 'kid',
      };

      const json = serializeConfiguration(config);
      const result = parseConfiguration(json);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.twinkleModeEnabled).toBe(config.twinkleModeEnabled);
        expect(result.data.storytellingMode).toBe(config.storytellingMode);
      }
    });

    it('should handle boundary values in round-trip', () => {
      const config: Configuration = {
        twinkleModeEnabled: true,
        storytellingMode: 'kid',
        lastViewPosition: {
          rotation: { x: 0, y: 0, z: 0 },
          zoom: 0.5, // minimum zoom
        },
        lastLocation: {
          latitude: -90, // minimum latitude
          longitude: -180, // minimum longitude
          accuracy: 0, // minimum accuracy
        },
      };

      const json = serializeConfiguration(config);
      const result = parseConfiguration(json);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(config);
      }
    });

    it('should handle maximum boundary values in round-trip', () => {
      const config: Configuration = {
        twinkleModeEnabled: false,
        storytellingMode: 'deepSpace',
        lastViewPosition: {
          rotation: { x: Math.PI, y: Math.PI, z: Math.PI },
          zoom: 5.0, // maximum zoom
        },
        lastLocation: {
          latitude: 90, // maximum latitude
          longitude: 180, // maximum longitude
          accuracy: 1000,
        },
      };

      const json = serializeConfiguration(config);
      const result = parseConfiguration(json);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(config);
      }
    });
  });
});
