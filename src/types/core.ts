/**
 * Core TypeScript interfaces for Mr. Twinkle - AI Constellation Explorer
 * 
 * These interfaces define the fundamental data models used throughout the application.
 */

/**
 * User's geographic location
 * Requirements: 1.4, 1.5
 */
export interface UserLocation {
  /** Latitude in degrees (-90 to 90) */
  latitude: number;
  /** Longitude in degrees (-180 to 180) */
  longitude: number;
  /** Location accuracy in meters */
  accuracy: number;
}

/**
 * Base interface for all celestial objects
 * Requirements: 2.1, 4.2
 */
export interface CelestialObject {
  /** Unique identifier for the celestial object */
  id: string;
  /** Common name or catalog designation */
  name: string;
  /** Position in celestial coordinates */
  position: {
    /** Right Ascension in degrees (0-360) */
    rightAscension: number;
    /** Declination in degrees (-90 to 90) */
    declination: number;
    /** Altitude in degrees (-90 to 90) - calculated based on observer location */
    altitude?: number;
    /** Azimuth in degrees (0-360) - calculated based on observer location */
    azimuth?: number;
  };
  /** Visual magnitude (brightness) - lower is brighter */
  magnitude: number;
  /** Type of celestial object (star, planet, constellation, etc.) */
  type: 'star' | 'planet' | 'constellation' | 'nebula' | 'galaxy';
}

/**
 * Star-specific data extending CelestialObject
 * Requirements: 4.2-4.7
 */
export interface Star extends CelestialObject {
  type: 'star';
  /** Surface temperature in Kelvin */
  temperature: number;
  /** Spectral classification (O, B, A, F, G, K, M) */
  spectralType: string;
  /** Distance from Earth in light-years */
  distance: number;
  /** Size relative to the Sun (1.0 = Sun's size) */
  size: number;
  /** Constellation containing this star */
  constellation?: string;
  /** Educational fact about the star */
  fact?: string;
}

/**
 * Constellation data structure
 * Requirements: 5.1, 5.3, 5.4
 */
export interface Constellation {
  /** Name of the constellation */
  name: string;
  /** Array of stars that form the constellation */
  stars: Star[];
  /** Lines connecting stars to form the constellation pattern */
  boundaryLines: Array<{
    /** Index of the first star in the stars array */
    startStarIndex: number;
    /** Index of the second star in the stars array */
    endStarIndex: number;
  }>;
  /** Mythological and cultural information */
  mythology: {
    /** Mythological background story */
    story: string;
    /** Cultural significance from historical civilizations */
    culturalSignificance: string;
    /** Scientific information about notable stars */
    scientificInfo: string;
  };
}

/**
 * Application configuration and user preferences
 * Requirements: 15.1, 15.7
 */
export interface Configuration {
  /** Whether Twinkle Mode visual enhancement is enabled */
  twinkleModeEnabled: boolean;
  /** Current storytelling mode (kid-friendly or scientific) */
  storytellingMode: 'kid' | 'deepSpace';
  /** Last viewed sky position for restoring user's view */
  lastViewPosition?: {
    /** Camera rotation in radians */
    rotation: {
      x: number;
      y: number;
      z: number;
    };
    /** Camera zoom level (0.5 to 5.0) */
    zoom: number;
  };
  /** User's last known location */
  lastLocation?: UserLocation;
}
