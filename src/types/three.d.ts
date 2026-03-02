/**
 * Three.js Type Definitions
 * Extended type definitions for Three.js and React Three Fiber
 */

import { Object3D } from 'three';
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

/**
 * Celestial object types for the sky map
 */
export interface CelestialObject extends Object3D {
  userData: {
    type: 'star' | 'planet' | 'constellation';
    name?: string;
    magnitude?: number;
    distance?: number;
    temperature?: number;
    spectralType?: string;
  };
}

/**
 * Sky map configuration
 */
export interface SkyMapConfig {
  latitude: number;
  longitude: number;
  timestamp: Date;
  fov: number;
  minZoom: number;
  maxZoom: number;
}
