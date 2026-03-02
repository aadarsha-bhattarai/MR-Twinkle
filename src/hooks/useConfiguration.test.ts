/**
 * Tests for useConfiguration hook
 * 
 * Requirements: 15.7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConfiguration } from './useConfiguration';
import { clearConfiguration, saveConfiguration } from '../utils/configPersistence';
import { Configuration } from '../types/core';

describe('useConfiguration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default configuration when no saved config exists', () => {
    const { result } = renderHook(() => useConfiguration());

    expect(result.current.config.twinkleModeEnabled).toBe(false);
    expect(result.current.config.storytellingMode).toBe('kid');
  });

  it('should load saved configuration on mount', () => {
    const savedConfig: Configuration = {
      twinkleModeEnabled: true,
      storytellingMode: 'deepSpace',
    };
    saveConfiguration(savedConfig);

    const { result } = renderHook(() => useConfiguration());

    // Wait for the effect to run
    expect(result.current.config.twinkleModeEnabled).toBe(true);
    expect(result.current.config.storytellingMode).toBe('deepSpace');
  });

  it('should update configuration and persist to localStorage', () => {
    const { result } = renderHook(() => useConfiguration());

    act(() => {
      result.current.updateConfig({ twinkleModeEnabled: true });
    });

    expect(result.current.config.twinkleModeEnabled).toBe(true);
    
    // Verify it was persisted
    const stored = localStorage.getItem('mr-twinkle-config');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.twinkleModeEnabled).toBe(true);
  });

  it('should toggle Twinkle Mode', () => {
    const { result } = renderHook(() => useConfiguration());

    expect(result.current.config.twinkleModeEnabled).toBe(false);

    act(() => {
      result.current.toggleTwinkleMode();
    });

    expect(result.current.config.twinkleModeEnabled).toBe(true);

    act(() => {
      result.current.toggleTwinkleMode();
    });

    expect(result.current.config.twinkleModeEnabled).toBe(false);
  });

  it('should set storytelling mode', () => {
    const { result } = renderHook(() => useConfiguration());

    act(() => {
      result.current.setStorytellingMode('deepSpace');
    });

    expect(result.current.config.storytellingMode).toBe('deepSpace');

    act(() => {
      result.current.setStorytellingMode('kid');
    });

    expect(result.current.config.storytellingMode).toBe('kid');
  });

  it('should save view position', () => {
    const { result } = renderHook(() => useConfiguration());

    const viewPosition = {
      rotation: { x: 1.5, y: 2.3, z: 0.7 },
      zoom: 2.5,
    };

    act(() => {
      result.current.saveViewPosition(viewPosition);
    });

    expect(result.current.config.lastViewPosition).toEqual(viewPosition);
  });

  it('should save location', () => {
    const { result } = renderHook(() => useConfiguration());

    const location = {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 50,
    };

    act(() => {
      result.current.saveLocation(location);
    });

    expect(result.current.config.lastLocation).toEqual(location);
  });

  it('should reset configuration to defaults', () => {
    const { result } = renderHook(() => useConfiguration());

    // Set some custom values
    act(() => {
      result.current.updateConfig({
        twinkleModeEnabled: true,
        storytellingMode: 'deepSpace',
      });
    });

    expect(result.current.config.twinkleModeEnabled).toBe(true);

    // Reset
    act(() => {
      result.current.resetConfig();
    });

    expect(result.current.config.twinkleModeEnabled).toBe(false);
    expect(result.current.config.storytellingMode).toBe('kid');
    expect(localStorage.getItem('mr-twinkle-config')).toBeNull();
  });

  it('should indicate when configuration is loaded', () => {
    const { result } = renderHook(() => useConfiguration());

    // Initially should be loaded (after effect runs)
    expect(result.current.isLoaded).toBe(true);
  });

  it('should persist multiple configuration updates', () => {
    const { result } = renderHook(() => useConfiguration());

    act(() => {
      result.current.toggleTwinkleMode();
    });

    act(() => {
      result.current.setStorytellingMode('deepSpace');
    });

    act(() => {
      result.current.saveViewPosition({
        rotation: { x: 0, y: 0, z: 0 },
        zoom: 1.0,
      });
    });

    expect(result.current.config.twinkleModeEnabled).toBe(true);
    expect(result.current.config.storytellingMode).toBe('deepSpace');
    expect(result.current.config.lastViewPosition?.zoom).toBe(1.0);

    // Verify persistence
    const stored = localStorage.getItem('mr-twinkle-config');
    const parsed = JSON.parse(stored!);
    expect(parsed.twinkleModeEnabled).toBe(true);
    expect(parsed.storytellingMode).toBe('deepSpace');
    expect(parsed.lastViewPosition.zoom).toBe(1.0);
  });
});
