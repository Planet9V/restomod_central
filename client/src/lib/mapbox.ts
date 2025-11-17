/**
 * Mapbox Client Utilities
 *
 * Client-side utilities for Mapbox GL JS integration.
 * Provides map styling, marker clustering, and transformation helpers.
 */

import type { LngLatBoundsLike, LngLatLike } from 'mapbox-gl';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Mapbox access token from environment variables
 */
export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

/**
 * Check if Mapbox is configured
 */
export function isMapboxConfigured(): boolean {
  return !!MAPBOX_ACCESS_TOKEN;
}

// ============================================================================
// CUSTOM MAP STYLES
// ============================================================================

/**
 * Luxury dark theme for Restomod Central
 * Based on Mapbox dark-v11 with Rolls-Royce purple accents
 */
export const LUXURY_DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';

/**
 * Light theme for daytime viewing
 */
export const LUXURY_LIGHT_STYLE = 'mapbox://styles/mapbox/streets-v12';

/**
 * Satellite hybrid for location context
 */
export const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

/**
 * Get style URL by name
 */
export function getMapStyle(style: 'dark' | 'light' | 'satellite' = 'dark'): string {
  const styles = {
    dark: LUXURY_DARK_STYLE,
    light: LUXURY_LIGHT_STYLE,
    satellite: SATELLITE_STYLE,
  };
  return styles[style];
}

// ============================================================================
// MARKER STYLES
// ============================================================================

/**
 * Rolls-Royce purple color for markers
 */
export const MARKER_COLOR = '#6B2C91';

/**
 * Secondary gold color for selected markers
 */
export const MARKER_COLOR_SELECTED = '#C9A770';

/**
 * Marker color for events
 */
export const EVENT_MARKER_COLOR = '#7D2027'; // Burgundy

/**
 * Marker color for cars
 */
export const CAR_MARKER_COLOR = '#5D7A94'; // Steel blue

/**
 * Create custom marker HTML with glassmorphism effect
 */
export function createCustomMarker(options: {
  color?: string;
  label?: string;
  selected?: boolean;
  size?: 'small' | 'medium' | 'large';
}): HTMLDivElement {
  const {
    color = MARKER_COLOR,
    label,
    selected = false,
    size = 'medium'
  } = options;

  const sizes = {
    small: { width: 30, height: 40, fontSize: '12px' },
    medium: { width: 40, height: 50, fontSize: '14px' },
    large: { width: 50, height: 60, fontSize: '16px' },
  };

  const { width, height, fontSize } = sizes[size];

  const el = document.createElement('div');
  el.className = 'custom-marker';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.cursor = 'pointer';
  el.style.position = 'relative';

  // SVG marker with glassmorphism
  el.innerHTML = `
    <svg width="${width}" height="${height}" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path
        d="M20,2 C12,2 6,8 6,16 C6,26 20,46 20,46 C20,46 34,26 34,16 C34,8 28,2 20,2 Z"
        fill="${color}"
        stroke="${selected ? MARKER_COLOR_SELECTED : '#fff'}"
        stroke-width="${selected ? '3' : '2'}"
        filter="${selected ? 'url(#glow)' : ''}"
        opacity="0.9"
      />
      ${label ? `
        <text
          x="20"
          y="18"
          text-anchor="middle"
          font-family="sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="#fff"
        >${label}</text>
      ` : ''}
    </svg>
  `;

  return el;
}

// ============================================================================
// CLUSTERING CONFIGURATION
// ============================================================================

/**
 * Cluster configuration for 100+ markers
 */
export const CLUSTER_CONFIG = {
  cluster: true,
  clusterMaxZoom: 14, // Max zoom to cluster points on
  clusterRadius: 50, // Radius of each cluster in pixels
  clusterProperties: {
    // Sum the total count of items in cluster
    sum: ['+', ['get', 'count']],
  },
};

/**
 * Cluster layer style with glassmorphism
 */
export const CLUSTER_LAYER_STYLE = {
  id: 'clusters',
  type: 'circle' as const,
  source: 'events',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      MARKER_COLOR, // <10 events
      10,
      '#C9A770', // 10-30 events (gold)
      30,
      '#7D2027', // 30+ events (burgundy)
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20, // <10 events
      10,
      30, // 10-30 events
      30,
      40, // 30+ events
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff',
    'circle-opacity': 0.8,
  },
};

/**
 * Cluster count layer style
 */
export const CLUSTER_COUNT_LAYER_STYLE = {
  id: 'cluster-count',
  type: 'symbol' as const,
  source: 'events',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 14,
  },
  paint: {
    'text-color': '#ffffff',
  },
};

/**
 * Unclustered point layer style
 */
export const UNCLUSTERED_POINT_LAYER_STYLE = {
  id: 'unclustered-point',
  type: 'circle' as const,
  source: 'events',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': MARKER_COLOR,
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff',
    'circle-opacity': 0.9,
  },
};

// ============================================================================
// GEOCODING HELPERS
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Convert to Mapbox LngLatLike format
 */
export function toLngLat(coords: Coordinates): LngLatLike {
  return [coords.longitude, coords.latitude];
}

/**
 * Convert from Mapbox LngLatLike format
 */
export function fromLngLat(lngLat: [number, number]): Coordinates {
  return {
    longitude: lngLat[0],
    latitude: lngLat[1],
  };
}

/**
 * Calculate bounding box from array of coordinates
 */
export function calculateBounds(
  coordinates: Coordinates[]
): LngLatBoundsLike | null {
  if (coordinates.length === 0) return null;

  const lngs = coordinates.map(c => c.longitude);
  const lats = coordinates.map(c => c.latitude);

  return [
    [Math.min(...lngs), Math.min(...lats)], // Southwest
    [Math.max(...lngs), Math.max(...lats)], // Northeast
  ];
}

/**
 * Add padding to bounds
 */
export function padBounds(
  bounds: LngLatBoundsLike,
  padding: number = 0.1
): LngLatBoundsLike {
  const [[west, south], [east, north]] = bounds as [[number, number], [number, number]];

  const lngPad = (east - west) * padding;
  const latPad = (north - south) * padding;

  return [
    [west - lngPad, south - latPad],
    [east + lngPad, north + latPad],
  ];
}

// ============================================================================
// DISTANCE UTILITIES
// ============================================================================

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371000; // Earth radius in meters
  const lat1 = point1.latitude * Math.PI / 180;
  const lat2 = point2.latitude * Math.PI / 180;
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number, unit: 'mi' | 'km' = 'mi'): string {
  if (unit === 'mi') {
    const miles = meters / 1609.34;
    return miles < 1
      ? `${Math.round(meters * 3.281)} ft`
      : `${miles.toFixed(1)} mi`;
  } else {
    const km = meters / 1000;
    return km < 1
      ? `${Math.round(meters)} m`
      : `${km.toFixed(1)} km`;
  }
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

// ============================================================================
// RESPONSIVE MAP SETTINGS
// ============================================================================

/**
 * Get optimal zoom level based on screen size
 */
export function getResponsiveZoom(isMobile: boolean = false): number {
  return isMobile ? 10 : 12;
}

/**
 * Get optimal pitch for 3D effect
 */
export function getResponsivePitch(isMobile: boolean = false): number {
  return isMobile ? 0 : 45; // No pitch on mobile for performance
}

/**
 * Map container style for mobile responsiveness
 */
export function getMapContainerStyle(isMobile: boolean = false) {
  return {
    width: '100%',
    height: isMobile ? '300px' : '500px',
    borderRadius: '8px',
    overflow: 'hidden',
  };
}

// ============================================================================
// STATIC MAP URLS
// ============================================================================

/**
 * Generate static map image URL
 */
export function generateStaticMapURL(options: {
  center: Coordinates;
  zoom: number;
  width?: number;
  height?: number;
  style?: 'dark' | 'light' | 'satellite';
  markers?: Array<{
    coordinates: Coordinates;
    color?: string;
    label?: string;
  }>;
}): string {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox access token not configured');
  }

  const {
    center,
    zoom,
    width = 800,
    height = 600,
    style = 'dark',
    markers = [],
  } = options;

  const styleMap = {
    dark: 'dark-v11',
    light: 'streets-v12',
    satellite: 'satellite-streets-v12',
  };

  let url = `https://api.mapbox.com/styles/v1/mapbox/${styleMap[style]}/static/`;

  // Add markers
  if (markers.length > 0) {
    const markerString = markers
      .map(m => {
        const color = (m.color || MARKER_COLOR).replace('#', '');
        const pin = m.label
          ? `pin-s-${m.label}+${color}`
          : `pin-s+${color}`;
        return `${pin}(${m.coordinates.longitude},${m.coordinates.latitude})`;
      })
      .join(',');
    url += `${markerString}/`;
  }

  // Add center and zoom
  url += `${center.longitude},${center.latitude},${zoom}`;

  // Add dimensions
  url += `/${width}x${height}`;

  // Add retina support
  url += '@2x';

  // Add access token
  url += `?access_token=${MAPBOX_ACCESS_TOKEN}`;

  return url;
}

// ============================================================================
// GEOJSON UTILITIES
// ============================================================================

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: Record<string, any>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Convert coordinates array to GeoJSON FeatureCollection
 */
export function toGeoJSON(
  items: Array<{ coordinates: Coordinates; [key: string]: any }>
): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: items.map((item, index) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [item.coordinates.longitude, item.coordinates.latitude],
      },
      properties: {
        ...item,
        id: item.id || index,
      },
    })),
  };
}

/**
 * Convert GeoJSON feature to coordinates
 */
export function fromGeoJSON(feature: GeoJSONFeature): Coordinates {
  return {
    longitude: feature.geometry.coordinates[0],
    latitude: feature.geometry.coordinates[1],
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle Mapbox errors gracefully
 */
export function handleMapError(error: Error): void {
  console.error('Mapbox error:', error);

  if (error.message.includes('access token')) {
    console.error('⚠️ Mapbox access token not configured. Set VITE_MAPBOX_ACCESS_TOKEN in .env');
  } else if (error.message.includes('quota')) {
    console.error('⚠️ Mapbox quota exceeded. Check usage at https://account.mapbox.com/');
  } else {
    console.error('⚠️ Map failed to load. Check network connection and Mapbox status.');
  }
}
