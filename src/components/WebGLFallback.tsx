/**
 * WebGL Fallback Component
 * Displays error message when WebGL is not supported (Requirement 14.1)
 */

import React from 'react';

interface WebGLFallbackProps {
  message?: string;
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({ 
  message = 'Your browser does not support WebGL, which is required for 3D rendering. Please upgrade to the latest version of Chrome, Firefox, Safari, or Edge to use Mr. Twinkle.'
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F2A]">
      <div className="max-w-md p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-xl">
        <div className="flex flex-col items-center text-center">
          <svg 
            className="w-16 h-16 mb-4 text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            WebGL Not Supported
          </h1>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="text-sm text-gray-400">
            <p className="mb-2">Recommended browsers:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Google Chrome (latest)</li>
              <li>Mozilla Firefox (latest)</li>
              <li>Safari (latest)</li>
              <li>Microsoft Edge (latest)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
