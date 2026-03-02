/**
 * WebGL Detection and Context Utilities
 * Validates browser WebGL support per Requirement 14.1
 */

export interface WebGLCapabilities {
  supported: boolean;
  version: 1 | 2 | null;
  renderer: string | null;
  vendor: string | null;
  maxTextureSize: number | null;
}

/**
 * Detects WebGL support and capabilities
 * @returns WebGLCapabilities object with support details
 */
export function detectWebGL(): WebGLCapabilities {
  const canvas = document.createElement('canvas');
  
  // Try WebGL 2.0 first (preferred per Requirement 11.6)
  let gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
  let version: 1 | 2 | null = null;
  
  if (gl) {
    version = 2;
  } else {
    // Fallback to WebGL 1.0
    gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    if (gl) {
      version = 1;
    }
  }
  
  if (!gl) {
    return {
      supported: false,
      version: null,
      renderer: null,
      vendor: null,
      maxTextureSize: null,
    };
  }
  
  // Get renderer info
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : gl.getParameter(gl.RENDERER);
  const vendor = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    : gl.getParameter(gl.VENDOR);
  
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  
  return {
    supported: true,
    version,
    renderer,
    vendor,
    maxTextureSize,
  };
}

/**
 * Checks if WebGL is supported
 * @returns true if WebGL is available
 */
export function isWebGLSupported(): boolean {
  return detectWebGL().supported;
}

/**
 * Gets recommended browser upgrade message per Requirement 14.1
 * @returns User-friendly error message with browser recommendations
 */
export function getWebGLErrorMessage(): string {
  return 'Your browser does not support WebGL, which is required for 3D rendering. Please upgrade to the latest version of Chrome, Firefox, Safari, or Edge to use Mr. Twinkle.';
}
