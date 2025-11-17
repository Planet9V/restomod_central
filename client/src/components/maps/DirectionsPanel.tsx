/**
 * Directions Panel Component
 *
 * Displays driving directions with turn-by-turn navigation.
 * Integrates with Mapbox Directions API via server.
 */

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  TrendingRight,
  Loader2,
  AlertCircle,
  Car,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { useUserLocation } from './MapboxProvider';
import { formatDistance, formatDuration } from '@/lib/mapbox';
import type { Coordinates } from '@/lib/mapbox';

// ============================================================================
// TYPES
// ============================================================================

interface Route {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lon, lat] pairs
  };
  steps: RouteStep[];
  summary: string;
}

interface RouteStep {
  distance: number; // meters
  duration: number; // seconds
  instruction: string;
  name: string; // street name
  maneuver: {
    type: string; // 'turn', 'arrive', 'depart', etc.
    modifier?: string; // 'left', 'right', 'straight', etc.
    location: [number, number]; // [lon, lat]
  };
}

interface DirectionsPanelProps {
  destination: Coordinates;
  destinationName: string;
  onRouteLoad?: (route: Route) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DirectionsPanel({
  destination,
  destinationName,
  onRouteLoad,
  className = '',
}: DirectionsPanelProps) {
  const { location: userLocation } = useUserLocation();

  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (userLocation) {
      fetchDirections();
    }
  }, [userLocation, destination]);

  const fetchDirections = async () => {
    if (!userLocation) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mapbox/directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: userLocation.coordinates,
          destination,
          profile: 'driving-traffic',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch directions');
      }

      const data: Route = await response.json();
      setRoute(data);
      onRouteLoad?.(data);
    } catch (err) {
      console.error('Directions error:', err);
      setError('Unable to get directions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get maneuver icon
  const getManeuverIcon = (type: string, modifier?: string) => {
    if (type === 'arrive') return '🏁';
    if (type === 'depart') return '🚗';
    if (modifier?.includes('left')) return '↰';
    if (modifier?.includes('right')) return '↱';
    if (modifier?.includes('straight')) return '↑';
    return '→';
  };

  if (!userLocation) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Enable location to get directions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-sm">Getting directions...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchDirections}>
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!route) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              Directions to {destinationName}
            </CardTitle>
            <CardDescription className="mt-2">
              {route.summary}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSteps(!showSteps)}
          >
            {showSteps ? 'Hide' : 'Show'} Steps
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Route Summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatDistance(route.distance)}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatDuration(route.duration)}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Driving</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.coordinates.latitude},${userLocation.coordinates.longitude}&destination=${destination.latitude},${destination.longitude}`;
              window.open(url, '_blank');
            }}
          >
            Open in Google Maps
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = `https://maps.apple.com/?saddr=${userLocation.coordinates.latitude},${userLocation.coordinates.longitude}&daddr=${destination.latitude},${destination.longitude}`;
              window.open(url, '_blank');
            }}
          >
            Open in Apple Maps
          </Button>
        </div>

        {/* Turn-by-turn Steps */}
        {showSteps && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Turn-by-turn Directions</h4>
              <div className="space-y-2">
                {route.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">
                      {getManeuverIcon(step.maneuver.type, step.maneuver.modifier)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {step.instruction}
                      </p>
                      {step.name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          on {step.name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {formatDistance(step.distance)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {formatDuration(step.duration)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPACT DIRECTIONS
// ============================================================================

interface CompactDirectionsProps {
  destination: Coordinates;
  destinationName: string;
  className?: string;
}

export function CompactDirections({
  destination,
  destinationName,
  className = '',
}: CompactDirectionsProps) {
  const { location: userLocation } = useUserLocation();
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userLocation) {
      fetchDirections();
    }
  }, [userLocation, destination]);

  const fetchDirections = async () => {
    if (!userLocation) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/mapbox/directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: userLocation.coordinates,
          destination,
          profile: 'driving-traffic',
        }),
      });

      if (response.ok) {
        const data: Route = await response.json();
        setRoute(data);
      }
    } catch (err) {
      console.error('Directions error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userLocation || !route) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Navigation className="w-4 h-4 text-primary" />
      <span className="font-medium">{formatDistance(route.distance)}</span>
      <span className="text-muted-foreground">•</span>
      <span className="text-muted-foreground">{formatDuration(route.duration)}</span>
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default DirectionsPanel;
