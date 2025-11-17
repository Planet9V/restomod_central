/**
 * Mapbox Context Provider
 *
 * Provides Mapbox configuration and user location to child components.
 * Manages geolocation state and provides location-aware features.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserLocation, type GeolocationResult, type GeolocationError } from '@/lib/geolocation';
import { MAPBOX_ACCESS_TOKEN, isMapboxConfigured } from '@/lib/mapbox';

// ============================================================================
// TYPES
// ============================================================================

interface MapboxContextValue {
  // Configuration
  accessToken: string;
  isConfigured: boolean;

  // User Location
  userLocation: GeolocationResult | null;
  locationError: GeolocationError | null;
  isLoadingLocation: boolean;

  // Actions
  refreshLocation: () => Promise<void>;
  clearLocation: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const MapboxContext = createContext<MapboxContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface MapboxProviderProps {
  children: ReactNode;
  autoDetectLocation?: boolean;
}

export function MapboxProvider({
  children,
  autoDetectLocation = false
}: MapboxProviderProps) {
  const [userLocation, setUserLocation] = useState<GeolocationResult | null>(null);
  const [locationError, setLocationError] = useState<GeolocationError | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Auto-detect location on mount (if enabled)
  useEffect(() => {
    if (autoDetectLocation) {
      refreshLocation();
    }
  }, [autoDetectLocation]);

  /**
   * Refresh user location
   */
  const refreshLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const location = await getUserLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Failed to get user location:', error);
      setLocationError(error as GeolocationError);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  /**
   * Clear user location
   */
  const clearLocation = () => {
    setUserLocation(null);
    setLocationError(null);
  };

  const value: MapboxContextValue = {
    accessToken: MAPBOX_ACCESS_TOKEN,
    isConfigured: isMapboxConfigured(),
    userLocation,
    locationError,
    isLoadingLocation,
    refreshLocation,
    clearLocation,
  };

  return (
    <MapboxContext.Provider value={value}>
      {children}
    </MapboxContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Use Mapbox context
 */
export function useMapbox() {
  const context = useContext(MapboxContext);

  if (context === undefined) {
    throw new Error('useMapbox must be used within a MapboxProvider');
  }

  if (!context.isConfigured) {
    console.warn('⚠️ Mapbox is not configured. Set VITE_MAPBOX_ACCESS_TOKEN in .env');
  }

  return context;
}

/**
 * Use user location (auto-fetches on mount)
 */
export function useUserLocation() {
  const { userLocation, locationError, isLoadingLocation, refreshLocation } = useMapbox();

  // Auto-fetch location on mount
  useEffect(() => {
    if (!userLocation && !locationError && !isLoadingLocation) {
      refreshLocation();
    }
  }, []);

  return {
    location: userLocation,
    error: locationError,
    isLoading: isLoadingLocation,
    refresh: refreshLocation,
  };
}
