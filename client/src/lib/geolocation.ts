/**
 * Geolocation Service
 *
 * Browser geolocation with IP-based fallbacks and caching.
 * Handles permissions, errors, and provides user-friendly location access.
 */

import type { Coordinates } from './mapbox';

// ============================================================================
// TYPES
// ============================================================================

export interface GeolocationResult {
  coordinates: Coordinates;
  accuracy?: number; // meters
  source: 'gps' | 'ip' | 'cache' | 'default';
  timestamp: number;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
  message: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default location (Kansas City, MO - center of Restomod Central operations)
 */
const DEFAULT_LOCATION: Coordinates = {
  latitude: 39.0997,
  longitude: -94.5786,
};

/**
 * Cache key for localStorage
 */
const CACHE_KEY = 'restomod_user_location';

/**
 * Cache duration (24 hours)
 */
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// ============================================================================
// MAIN GEOLOCATION FUNCTION
// ============================================================================

/**
 * Get user's current location with fallbacks
 *
 * Attempts in order:
 * 1. Browser Geolocation API (GPS)
 * 2. Cached location (if recent)
 * 3. IP-based geolocation
 * 4. Default location (Kansas City, MO)
 */
export async function getUserLocation(options?: {
  useCache?: boolean;
  timeout?: number;
}): Promise<GeolocationResult> {
  const { useCache = true, timeout = 10000 } = options || {};

  // Try cached location first (if enabled and recent)
  if (useCache) {
    const cached = getCachedLocation();
    if (cached) {
      console.log('Using cached location');
      return cached;
    }
  }

  // Try browser geolocation
  try {
    const gpsLocation = await getBrowserLocation(timeout);
    cacheLocation(gpsLocation);
    return gpsLocation;
  } catch (error) {
    console.warn('GPS geolocation failed:', error);
  }

  // Try IP-based geolocation
  try {
    const ipLocation = await getIPLocation();
    cacheLocation(ipLocation);
    return ipLocation;
  } catch (error) {
    console.warn('IP geolocation failed:', error);
  }

  // Fallback to default location
  console.log('Using default location (Kansas City, MO)');
  return {
    coordinates: DEFAULT_LOCATION,
    source: 'default',
    timestamp: Date.now(),
  };
}

// ============================================================================
// BROWSER GEOLOCATION (GPS)
// ============================================================================

/**
 * Get location from browser Geolocation API
 */
export function getBrowserLocation(timeout: number = 10000): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by this browser',
      } as GeolocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          source: 'gps',
          timestamp: Date.now(),
        });
      },
      (error) => {
        const errorMap: Record<number, GeolocationError> = {
          1: {
            code: 'PERMISSION_DENIED',
            message: 'Location permission denied. Please enable location access in your browser.',
          },
          2: {
            code: 'POSITION_UNAVAILABLE',
            message: 'Location information unavailable. Check your device settings.',
          },
          3: {
            code: 'TIMEOUT',
            message: 'Location request timed out. Please try again.',
          },
        };
        reject(errorMap[error.code] || {
          code: 'POSITION_UNAVAILABLE',
          message: 'Failed to get location',
        });
      },
      {
        enableHighAccuracy: true,
        timeout,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Check if geolocation is available
 */
export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<PermissionState | 'unsupported'> {
  if (!navigator.permissions) {
    return 'unsupported';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return 'unsupported';
  }
}

// ============================================================================
// IP-BASED GEOLOCATION
// ============================================================================

/**
 * Get approximate location from IP address
 * Uses ipapi.co free service (30,000 requests/month)
 */
export async function getIPLocation(): Promise<GeolocationResult> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('IP geolocation request failed');

    const data = await response.json();

    return {
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      source: 'ip',
      timestamp: Date.now(),
    };
  } catch (error) {
    throw new Error('Failed to get IP-based location');
  }
}

// ============================================================================
// CACHING
// ============================================================================

/**
 * Cache location in localStorage
 */
function cacheLocation(location: GeolocationResult): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(location));
  } catch (error) {
    console.warn('Failed to cache location:', error);
  }
}

/**
 * Get cached location from localStorage
 */
function getCachedLocation(): GeolocationResult | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const location: GeolocationResult = JSON.parse(cached);

    // Check if cache is still valid
    const age = Date.now() - location.timestamp;
    if (age > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return {
      ...location,
      source: 'cache',
    };
  } catch (error) {
    console.warn('Failed to get cached location:', error);
    return null;
  }
}

/**
 * Clear cached location
 */
export function clearLocationCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear location cache:', error);
  }
}

// ============================================================================
// LOCATION WATCHING
// ============================================================================

/**
 * Watch user's location for continuous updates
 */
export function watchLocation(
  onUpdate: (location: GeolocationResult) => void,
  onError?: (error: GeolocationError) => void
): () => void {
  if (!navigator.geolocation) {
    onError?.({
      code: 'NOT_SUPPORTED',
      message: 'Geolocation is not supported',
    });
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location: GeolocationResult = {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        accuracy: position.coords.accuracy,
        source: 'gps',
        timestamp: Date.now(),
      };
      cacheLocation(location);
      onUpdate(location);
    },
    (error) => {
      const errorMap: Record<number, GeolocationError> = {
        1: {
          code: 'PERMISSION_DENIED',
          message: 'Location permission denied',
        },
        2: {
          code: 'POSITION_UNAVAILABLE',
          message: 'Location unavailable',
        },
        3: {
          code: 'TIMEOUT',
          message: 'Location timeout',
        },
      };
      onError?.(errorMap[error.code] || {
        code: 'POSITION_UNAVAILABLE',
        message: 'Failed to get location',
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );

  // Return cleanup function
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

// ============================================================================
// DISTANCE CALCULATIONS
// ============================================================================

/**
 * Calculate distance from user to a point
 */
export async function getDistanceFromUser(
  destination: Coordinates,
  userLocation?: GeolocationResult
): Promise<number> {
  const location = userLocation || await getUserLocation();

  const R = 6371000; // Earth radius in meters
  const lat1 = location.coordinates.latitude * Math.PI / 180;
  const lat2 = destination.latitude * Math.PI / 180;
  const dLat = (destination.latitude - location.coordinates.latitude) * Math.PI / 180;
  const dLon = (destination.longitude - location.coordinates.longitude) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

// ============================================================================
// GEOCODING HELPERS
// ============================================================================

/**
 * Geocode address using Mapbox API
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();
    return data.coordinates;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(coordinates: Coordinates): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/reverse-geocode?lat=${coordinates.latitude}&lng=${coordinates.longitude}`
    );
    if (!response.ok) throw new Error('Reverse geocoding failed');

    const data = await response.json();
    return data.address;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format location for display
 */
export function formatLocation(location: GeolocationResult): string {
  const { coordinates, accuracy, source } = location;
  const lat = coordinates.latitude.toFixed(4);
  const lng = coordinates.longitude.toFixed(4);

  let display = `${lat}, ${lng}`;

  if (accuracy) {
    display += ` (±${Math.round(accuracy)}m)`;
  }

  if (source !== 'gps') {
    display += ` [${source}]`;
  }

  return display;
}

/**
 * Check if location is default
 */
export function isDefaultLocation(location: GeolocationResult): boolean {
  return location.source === 'default';
}

/**
 * Check if location is accurate
 */
export function isAccurateLocation(location: GeolocationResult): boolean {
  return location.source === 'gps' && (location.accuracy || Infinity) < 1000;
}
