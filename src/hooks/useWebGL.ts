/**
 * WebGL Detection Hook
 * React hook for checking WebGL support and capabilities
 */

import { useEffect, useState } from 'react';
import { detectWebGL, type WebGLCapabilities } from '@utils/webgl';

/**
 * Hook to detect WebGL support and capabilities
 * @returns WebGLCapabilities object
 */
export function useWebGL(): WebGLCapabilities {
  const [capabilities, setCapabilities] = useState<WebGLCapabilities>(() => detectWebGL());
  
  useEffect(() => {
    // Re-check on mount in case of dynamic changes
    const detected = detectWebGL();
    setCapabilities(detected);
    
    // Log capabilities for debugging (Requirement 14.6)
    if (!detected.supported) {
      console.error('WebGL is not supported on this browser');
    } else {
      console.log('WebGL detected:', {
        version: detected.version,
        renderer: detected.renderer,
        vendor: detected.vendor,
      });
    }
  }, []);
  
  return capabilities;
}
