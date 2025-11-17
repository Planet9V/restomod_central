/**
 * Static Map Image Component
 *
 * Renders static map thumbnails for listings, emails, and previews.
 * Uses Mapbox Static Images API for fast, cacheable maps.
 */

import React from 'react';
import { generateStaticMapURL, MARKER_COLOR } from '@/lib/mapbox';
import type { Coordinates } from '@/lib/mapbox';

// ============================================================================
// TYPES
// ============================================================================

interface StaticMapImageProps {
  center: Coordinates;
  zoom?: number;
  width?: number;
  height?: number;
  style?: 'dark' | 'light' | 'satellite';
  markers?: Array<{
    coordinates: Coordinates;
    color?: string;
    label?: string;
  }>;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StaticMapImage({
  center,
  zoom = 14,
  width = 800,
  height = 600,
  style = 'dark',
  markers,
  alt = 'Map location',
  className = '',
  loading = 'lazy',
  onClick,
}: StaticMapImageProps) {
  try {
    const mapUrl = generateStaticMapURL({
      center,
      zoom,
      width,
      height,
      style,
      markers: markers || [{ coordinates: center, color: MARKER_COLOR }],
    });

    return (
      <img
        src={mapUrl}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={`rounded-lg ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
        onClick={onClick}
      />
    );
  } catch (error) {
    console.error('Failed to generate static map:', error);
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ width, height }}
      >
        <p className="text-sm text-muted-foreground">Map unavailable</p>
      </div>
    );
  }
}

// ============================================================================
// EVENT MAP THUMBNAIL
// ============================================================================

interface EventMapThumbnailProps {
  coordinates: Coordinates;
  eventName: string;
  onClick?: () => void;
  className?: string;
}

export function EventMapThumbnail({
  coordinates,
  eventName,
  onClick,
  className = '',
}: EventMapThumbnailProps) {
  return (
    <StaticMapImage
      center={coordinates}
      zoom={13}
      width={400}
      height={300}
      style="light"
      alt={`Map of ${eventName}`}
      className={className}
      onClick={onClick}
    />
  );
}

// ============================================================================
// CAR LOCATION THUMBNAIL
// ============================================================================

interface CarLocationThumbnailProps {
  coordinates: Coordinates;
  carName: string;
  onClick?: () => void;
  className?: string;
}

export function CarLocationThumbnail({
  coordinates,
  carName,
  onClick,
  className = '',
}: CarLocationThumbnailProps) {
  return (
    <StaticMapImage
      center={coordinates}
      zoom={12}
      width={400}
      height={200}
      style="satellite"
      alt={`Location of ${carName}`}
      className={className}
      onClick={onClick}
    />
  );
}

// ============================================================================
// MULTI-LOCATION MAP
// ============================================================================

interface MultiLocationMapProps {
  locations: Array<{
    coordinates: Coordinates;
    label?: string;
    color?: string;
  }>;
  center?: Coordinates;
  zoom?: number;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
}

export function MultiLocationMap({
  locations,
  center,
  zoom = 10,
  width = 800,
  height = 600,
  alt = 'Multiple locations',
  className = '',
}: MultiLocationMapProps) {
  // If no center provided, use the first location
  const mapCenter = center || locations[0]?.coordinates;

  if (!mapCenter) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ width, height }}
      >
        <p className="text-sm text-muted-foreground">No locations to display</p>
      </div>
    );
  }

  return (
    <StaticMapImage
      center={mapCenter}
      zoom={zoom}
      width={width}
      height={height}
      markers={locations.map((loc, index) => ({
        coordinates: loc.coordinates,
        color: loc.color,
        label: loc.label || (index + 1).toString(),
      }))}
      alt={alt}
      className={className}
    />
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default StaticMapImage;
