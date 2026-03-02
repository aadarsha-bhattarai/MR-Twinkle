# Configuration Persistence - Usage Examples

This document provides examples of how to use the configuration persistence system in Mr. Twinkle.

## Overview

The configuration persistence system saves user preferences to browser localStorage, including:
- Twinkle Mode state (enabled/disabled)
- Storytelling mode (kid/deepSpace)
- Last view position (camera rotation and zoom)
- Last known location (latitude, longitude, accuracy)

## Using the React Hook (Recommended)

The easiest way to use configuration persistence is through the `useConfiguration` hook:

```typescript
import { useConfiguration } from './hooks/useConfiguration';

function MyComponent() {
  const {
    config,
    isLoaded,
    toggleTwinkleMode,
    setStorytellingMode,
    saveViewPosition,
    saveLocation,
    resetConfig,
  } = useConfiguration();

  // Wait for configuration to load
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Current Configuration</h1>
      <p>Twinkle Mode: {config.twinkleModeEnabled ? 'On' : 'Off'}</p>
      <p>Storytelling Mode: {config.storytellingMode}</p>
      
      <button onClick={toggleTwinkleMode}>
        Toggle Twinkle Mode
      </button>
      
      <button onClick={() => setStorytellingMode('deepSpace')}>
        Switch to Deep Space Mode
      </button>
      
      <button onClick={() => saveViewPosition({
        rotation: { x: 0, y: 0, z: 0 },
        zoom: 1.5,
      })}>
        Save Current View
      </button>
      
      <button onClick={resetConfig}>
        Reset to Defaults
      </button>
    </div>
  );
}
```

## Using the Utility Functions Directly

For more control, you can use the utility functions directly:

```typescript
import {
  saveConfiguration,
  loadConfiguration,
  clearConfiguration,
  hasConfiguration,
} from './utils/configPersistence';
import { Configuration } from './types/core';

// Check if configuration exists
if (hasConfiguration()) {
  console.log('Configuration found in localStorage');
}

// Load configuration
const result = loadConfiguration();
if (result.success) {
  console.log('Loaded config:', result.data);
} else {
  console.error('Failed to load:', result.error);
}

// Save configuration
const config: Configuration = {
  twinkleModeEnabled: true,
  storytellingMode: 'kid',
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

const saved = saveConfiguration(config);
if (saved) {
  console.log('Configuration saved successfully');
}

// Clear configuration
clearConfiguration();
```

## Integration with Sky Map Engine

Example of saving view position when the camera moves:

```typescript
import { useConfiguration } from './hooks/useConfiguration';
import { useThree } from '@react-three/fiber';

function SkyMapControls() {
  const { saveViewPosition } = useConfiguration();
  const { camera } = useThree();

  const handleCameraChange = () => {
    saveViewPosition({
      rotation: {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z,
      },
      zoom: camera.zoom,
    });
  };

  return (
    <OrbitControls onChange={handleCameraChange} />
  );
}
```

## Integration with Geolocation

Example of saving user location:

```typescript
import { useConfiguration } from './hooks/useConfiguration';

function LocationDetector() {
  const { saveLocation } = useConfiguration();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
      }
    );
  }, [saveLocation]);

  return null;
}
```

## Error Handling

The configuration system handles errors gracefully:

```typescript
import { loadConfiguration } from './utils/configPersistence';

const result = loadConfiguration();

if (!result.success) {
  // Handle different error cases
  if (result.error.includes('No configuration found')) {
    // First time user - use defaults
    console.log('No saved configuration, using defaults');
  } else if (result.error.includes('JSON parsing failed')) {
    // Corrupted data - clear and use defaults
    console.error('Corrupted configuration data');
    clearConfiguration();
  } else {
    // Other errors
    console.error('Configuration error:', result.error);
  }
}
```

## Testing

When testing components that use configuration:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useConfiguration } from './hooks/useConfiguration';

beforeEach(() => {
  localStorage.clear();
});

test('should save Twinkle Mode state', () => {
  const { result } = renderHook(() => useConfiguration());

  act(() => {
    result.current.toggleTwinkleMode();
  });

  expect(result.current.config.twinkleModeEnabled).toBe(true);
});
```

## Requirements Satisfied

This implementation satisfies **Requirement 15.7**:
- ✅ Saves Twinkle Mode state
- ✅ Saves storytelling mode selection
- ✅ Saves last viewed sky position
- ✅ Loads configuration on application startup
- ✅ Uses browser localStorage for persistence
