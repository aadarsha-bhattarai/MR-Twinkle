/**
 * Tests for useGeolocation hook
 * 
 * Requirements: 1.1, 1.2, 1.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';

describe('useGeolocation', () => {
  let mockGeolocation: {
    getCurrentPosition: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Create mock geolocation
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };

    // Replace navigator.geolocation with mock
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Requirement 1.1: Request location on mount', () => {
    it('should request geolocation when hook mounts', () => {
      renderHook(() => useGeolocation());

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      );
    });

    it('should start with loading status', () => {
      const { result } = renderHook(() => useGeolocation());

      expect(result.current.status).toBe('loading');
      expect(result.current.location).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Requirement 1.2: Handle permission granted and retrieve coordinates', () => {
    it('should store location when permission is granted', async () => {
      const mockPosition = {
        coords: {
          latitude: 47.6062,
          longitude: -122.3321,
          accuracy: 50, // Within 100m requirement
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.status).toBe('granted');
      });

      expect(result.current.location).toEqual({
        latitude: 47.6062,
        longitude: -122.3321,
        accuracy: 50,
      });
      expect(result.current.error).toBeNull();
    });

    it('should accept location with accuracy exactly at 100m', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 100, // Exactly at requirement
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.status).toBe('granted');
      });

      expect(result.current.location).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 100,
      });
    });

    it('should accept location even if accuracy exceeds 100m with warning', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
          accuracy: 150, // Exceeds 100m requirement
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.status).toBe('granted');
      });

      expect(result.current.location).toEqual({
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 150,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Location accuracy (150m) exceeds 100m requirement')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Requirement 1.5: Store location for sky calculations', () => {
    it('should store complete UserLocation object with all required fields', async () => {
      const mockPosition = {
        coords: {
          latitude: 35.6762,
          longitude: 139.6503,
          accuracy: 25,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.location).not.toBeNull();
      });

      // Verify all required fields are present
      expect(result.current.location).toHaveProperty('latitude');
      expect(result.current.location).toHaveProperty('longitude');
      expect(result.current.location).toHaveProperty('accuracy');
      
      // Verify types
      expect(typeof result.current.location!.latitude).toBe('number');
      expect(typeof result.current.location!.longitude).toBe('number');
      expect(typeof result.current.location!.accuracy).toBe('number');
    });
  });

  describe('Permission denied handling', () => {
    it('should set status to denied when permission is denied', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.status).toBe('denied');
      });

      expect(result.current.location).toBeNull();
      expect(result.current.error).toBe('Location permission denied');
    });
  });

  describe('Error handling', () => {
    it('should handle position unavailable error', async () => {
      const mockError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe('Location information unavailable');
    });

    it('should handle timeout error', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe('Location request timed out');
    });

    it('should handle unknown errors', async () => {
      const mockError = {
        code: 999, // Unknown error code
        message: 'Unknown error',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe('An unknown error occurred while requesting location');
    });

    it('should handle missing geolocation API', () => {
      // Remove geolocation from navigator
      Object.defineProperty(globalThis.navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Geolocation is not supported by your browser');
      expect(result.current.location).toBeNull();
    });
  });

  describe('Retry functionality', () => {
    it('should allow retrying after permission denied', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      // First call fails
      mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.status).toBe('denied');
      });

      // Second call succeeds
      const mockPosition = {
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
          accuracy: 30,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      // Trigger retry
      result.current.retry();

      await waitFor(() => {
        expect(result.current.status).toBe('granted');
      });

      expect(result.current.location).toEqual({
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 30,
      });
      expect(result.current.error).toBeNull();
    });

    it('should clear previous error when retrying', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.error).toBe('Location request timed out');
      });

      // Mock successful retry
      const mockPosition = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 45,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      result.current.retry();

      await waitFor(() => {
        expect(result.current.status).toBe('granted');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('High accuracy configuration', () => {
    it('should request high accuracy to meet 100m requirement', () => {
      renderHook(() => useGeolocation());

      const options = mockGeolocation.getCurrentPosition.mock.calls[0][2];
      expect(options).toEqual({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  });
});
