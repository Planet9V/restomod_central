/**
 * Proximity Search Component
 *
 * "Find cars/events near me" with distance filtering.
 * Combines geolocation with radius search controls.
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, AlertCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useUserLocation } from './MapboxProvider';
import { formatDistance, calculateDistance } from '@/lib/mapbox';
import type { Coordinates } from '@/lib/mapbox';

// ============================================================================
// TYPES
// ============================================================================

interface ProximitySearchProps {
  onLocationChange?: (location: Coordinates | null) => void;
  onRadiusChange?: (radiusMeters: number) => void;
  defaultRadius?: number;
  showRadiusSlider?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProximitySearch({
  onLocationChange,
  onRadiusChange,
  defaultRadius = 50 * 1609.34, // 50 miles in meters
  showRadiusSlider = true,
  className = '',
}: ProximitySearchProps) {
  const { location, error, isLoading, refresh } = useUserLocation();

  const [radius, setRadius] = useState(defaultRadius);
  const [radiusUnit, setRadiusUnit] = useState<'mi' | 'km'>('mi');

  // Notify parent of location changes
  useEffect(() => {
    if (location) {
      onLocationChange?.(location.coordinates);
    } else {
      onLocationChange?.(null);
    }
  }, [location, onLocationChange]);

  // Notify parent of radius changes
  useEffect(() => {
    onRadiusChange?.(radius);
  }, [radius, onRadiusChange]);

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setRadius(newRadius);
  };

  const radiusInMiles = radius / 1609.34;
  const radiusInKm = radius / 1000;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Status */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : error ? (
            <AlertCircle className="w-5 h-5 text-destructive" />
          ) : location ? (
            <Navigation className="w-5 h-5 text-primary" />
          ) : (
            <MapPin className="w-5 h-5 text-muted-foreground" />
          )}

          <div>
            <p className="text-sm font-medium">
              {isLoading
                ? 'Getting your location...'
                : error
                ? 'Location unavailable'
                : location
                ? location.source === 'gps'
                  ? 'Your location'
                  : `Approximate location (${location.source})`
                : 'Location not set'}
            </p>

            {location && !isLoading && (
              <p className="text-xs text-muted-foreground">
                {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
                {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
              </p>
            )}

            {error && (
              <p className="text-xs text-destructive">
                {error.message}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span className="ml-2">
            {location ? 'Refresh' : 'Detect'}
          </span>
        </Button>
      </div>

      {/* Radius Slider */}
      {showRadiusSlider && location && (
        <div className="space-y-3 p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <Label htmlFor="radius">Search Radius</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {radiusUnit === 'mi'
                  ? `${radiusInMiles.toFixed(0)} mi`
                  : `${radiusInKm.toFixed(0)} km`}
              </span>
              <Select
                value={radiusUnit}
                onValueChange={(value: 'mi' | 'km') => setRadiusUnit(value)}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mi">mi</SelectItem>
                  <SelectItem value="km">km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Slider
            id="radius"
            min={1609.34} // 1 mile
            max={804672} // 500 miles
            step={1609.34} // 1 mile increments
            value={[radius]}
            onValueChange={handleRadiusChange}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{radiusUnit === 'mi' ? '1 mi' : '1.6 km'}</span>
            <span>{radiusUnit === 'mi' ? '500 mi' : '804 km'}</span>
          </div>
        </div>
      )}

      {/* Quick Radius Buttons */}
      {location && (
        <div className="flex flex-wrap gap-2">
          <Label className="w-full text-sm text-muted-foreground">Quick Select:</Label>
          {[10, 25, 50, 100, 250].map((miles) => (
            <Button
              key={miles}
              variant={Math.abs(radiusInMiles - miles) < 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRadius(miles * 1609.34)}
            >
              {miles} mi
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROXIMITY FILTER HOOK
// ============================================================================

/**
 * Hook to filter items by proximity to user location
 */
export function useProximityFilter<T extends { coordinates: Coordinates }>(
  items: T[],
  radiusMeters?: number
) {
  const { location } = useUserLocation();
  const [filteredItems, setFilteredItems] = useState<(T & { distance?: number })[]>(items);

  useEffect(() => {
    if (!location || !radiusMeters) {
      setFilteredItems(items);
      return;
    }

    const itemsWithDistance = items.map(item => {
      const distance = calculateDistance(location.coordinates, item.coordinates);
      return { ...item, distance };
    });

    const filtered = itemsWithDistance.filter(item => (item.distance || 0) <= radiusMeters);

    // Sort by distance (closest first)
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setFilteredItems(filtered);
  }, [items, location, radiusMeters]);

  return {
    items: filteredItems,
    userLocation: location,
    hasLocation: !!location,
  };
}

// ============================================================================
// DISTANCE BADGE COMPONENT
// ============================================================================

interface DistanceBadgeProps {
  coordinates: Coordinates;
  className?: string;
}

export function DistanceBadge({ coordinates, className = '' }: DistanceBadgeProps) {
  const { location } = useUserLocation();
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (location) {
      const dist = calculateDistance(location.coordinates, coordinates);
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, [location, coordinates]);

  if (!distance) return null;

  return (
    <div className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      <MapPin className="w-3 h-3" />
      <span>{formatDistance(distance)}</span>
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default ProximitySearch;
