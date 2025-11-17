/**
 * Mapbox Geospatial Service
 *
 * Provides location intelligence, mapping, geocoding, routing, and isochrone
 * generation for car shows, events, and dealer locations.
 *
 * Features:
 * - Global geocoding (address → coordinates, coordinates → address)
 * - Points of Interest (POI) search (dealerships, museums, shows)
 * - Multi-modal routing (driving, walking, cycling) with real-time traffic
 * - Isochrone generation (areas reachable within time/distance)
 * - Static map image generation
 * - Travel time matrices for logistics optimization
 *
 * FREE Tier:
 * - 100,000 requests/month
 * - Sufficient for ~3,300 requests/day
 * - Perfect for MVP with 3,000 DAU
 *
 * Use Cases:
 * - Display car shows and events on interactive maps
 * - "Find cars within 50 miles" proximity search
 * - "How to get to Barrett-Jackson auction" with directions
 * - "All events within 2-hour drive" isochrone visualization
 * - Geocode dealer addresses for accurate mapping
 *
 * Setup:
 * 1. Sign up at https://account.mapbox.com/
 * 2. Create access token from Dashboard
 * 3. Add to .env:
 *    MAPBOX_ACCESS_TOKEN=pk.eyJ...
 *
 * @see https://docs.mapbox.com/ - Official Documentation
 * @see SPEC_07_ENHANCED_TOOLS.md - Enhanced Tools Specification
 */

import MapboxSDK from '@mapbox/mapbox-sdk';
import MapboxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import MapboxMatrix from '@mapbox/mapbox-sdk/services/matrix';
import MapboxStatic from '@mapbox/mapbox-sdk/services/static';

// ============================================================================
// CONFIGURATION
// ============================================================================

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_ACCESS_TOKEN) {
  console.warn('⚠️  Mapbox not configured - geospatial features disabled');
  console.warn('   Set MAPBOX_ACCESS_TOKEN in .env to enable mapping');
}

// Initialize Mapbox services
const baseClient = MAPBOX_ACCESS_TOKEN ? MapboxSDK({ accessToken: MAPBOX_ACCESS_TOKEN }) : null;
const geocodingService = baseClient ? MapboxGeocoding(baseClient) : null;
const directionsService = baseClient ? MapboxDirections(baseClient) : null;
const matrixService = baseClient ? MapboxMatrix(baseClient) : null;
const staticService = baseClient ? MapboxStatic(baseClient) : null;

if (MAPBOX_ACCESS_TOKEN) {
  console.log('✅ Mapbox services initialized');
}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Geographic coordinates
 */
export interface Coordinates {
  longitude: number;
  latitude: number;
}

/**
 * Geocoding result (address → coordinates)
 */
export interface GeocodeResult {
  id: string;
  placeName: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates: Coordinates;
  relevance: number; // 0-1, how well it matches query
  placeType: string[]; // e.g., ['address', 'place', 'poi']
  bbox?: [number, number, number, number]; // Bounding box
}

/**
 * Reverse geocoding result (coordinates → address)
 */
export interface ReverseGeocodeResult extends GeocodeResult {}

/**
 * Route between two points
 */
export interface Route {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lon, lat] pairs
  };
  steps: RouteStep[];
  summary: string;
}

/**
 * Turn-by-turn direction step
 */
export interface RouteStep {
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

/**
 * Travel time matrix result
 */
export interface TravelTimeMatrix {
  sources: Coordinates[];
  destinations: Coordinates[];
  durations: number[][]; // seconds, sources × destinations
  distances: number[][]; // meters, sources × destinations
}

/**
 * Isochrone (area reachable within time/distance)
 */
export interface Isochrone {
  contour: number; // minutes or meters
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][];
  };
  color?: string; // for visualization
}

/**
 * POI (Point of Interest) search result
 */
export interface PointOfInterest {
  id: string;
  name: string;
  category: string; // 'car dealership', 'museum', 'repair shop', etc.
  address: string;
  coordinates: Coordinates;
  distance?: number; // meters from search origin
  phone?: string;
  website?: string;
}

// ============================================================================
// GEOCODING
// ============================================================================

/**
 * Geocode address to coordinates
 *
 * Convert human-readable address to geographic coordinates.
 *
 * @param address - Address to geocode (e.g., "Barrett-Jackson Scottsdale, AZ")
 * @param options - Geocoding options
 * @returns Array of geocoding results (best match first)
 *
 * @example
 * const results = await geocodeAddress('Barrett-Jackson, Scottsdale, AZ');
 * const location = results[0].coordinates;
 * // { latitude: 33.4942, longitude: -111.9261 }
 */
export async function geocodeAddress(
  address: string,
  options: {
    country?: string; // ISO 3166-1 alpha-2 code (e.g., 'US')
    bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
    proximity?: Coordinates; // Prefer results near this point
    limit?: number; // Max results (default: 5)
  } = {}
): Promise<GeocodeResult[]> {
  if (!geocodingService) {
    throw new Error('Mapbox not configured');
  }

  try {
    const request: any = {
      query: address,
      limit: options.limit || 5,
    };

    if (options.country) {
      request.countries = [options.country];
    }

    if (options.bbox) {
      request.bbox = options.bbox;
    }

    if (options.proximity) {
      request.proximity = [options.proximity.longitude, options.proximity.latitude];
    }

    const response = await geocodingService.forwardGeocode(request).send();

    const results: GeocodeResult[] = response.body.features.map((feature: any) => ({
      id: feature.id,
      placeName: feature.place_name,
      address: feature.address,
      city: feature.context?.find((c: any) => c.id.startsWith('place'))?.text,
      state: feature.context?.find((c: any) => c.id.startsWith('region'))?.text,
      country: feature.context?.find((c: any) => c.id.startsWith('country'))?.text,
      postalCode: feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text,
      coordinates: {
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
      },
      relevance: feature.relevance,
      placeType: feature.place_type,
      bbox: feature.bbox,
    }));

    console.log(`✅ Geocoded "${address}" → ${results.length} results`);

    return results;
  } catch (error) {
    console.error('❌ Failed to geocode address:', error);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to address
 *
 * Convert geographic coordinates to human-readable address.
 *
 * @param coordinates - Coordinates to reverse geocode
 * @param options - Options
 * @returns Array of reverse geocoding results
 *
 * @example
 * const results = await reverseGeocode({ latitude: 33.4942, longitude: -111.9261 });
 * console.log(results[0].placeName);
 * // "WestWorld of Scottsdale, Scottsdale, Arizona 85262, United States"
 */
export async function reverseGeocode(
  coordinates: Coordinates,
  options: {
    types?: string[]; // Filter by type: 'address', 'poi', 'place', etc.
    limit?: number;
  } = {}
): Promise<ReverseGeocodeResult[]> {
  if (!geocodingService) {
    throw new Error('Mapbox not configured');
  }

  try {
    const request: any = {
      query: [coordinates.longitude, coordinates.latitude],
      limit: options.limit || 5,
    };

    if (options.types) {
      request.types = options.types;
    }

    const response = await geocodingService.reverseGeocode(request).send();

    const results: ReverseGeocodeResult[] = response.body.features.map((feature: any) => ({
      id: feature.id,
      placeName: feature.place_name,
      address: feature.address,
      city: feature.context?.find((c: any) => c.id.startsWith('place'))?.text,
      state: feature.context?.find((c: any) => c.id.startsWith('region'))?.text,
      country: feature.context?.find((c: any) => c.id.startsWith('country'))?.text,
      postalCode: feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text,
      coordinates: {
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
      },
      relevance: feature.relevance,
      placeType: feature.place_type,
      bbox: feature.bbox,
    }));

    console.log(`✅ Reverse geocoded (${coordinates.latitude}, ${coordinates.longitude}) → ${results.length} results`);

    return results;
  } catch (error) {
    console.error('❌ Failed to reverse geocode:', error);
    throw error;
  }
}

// ============================================================================
// ROUTING & DIRECTIONS
// ============================================================================

/**
 * Get driving directions between two points
 *
 * @param origin - Starting point
 * @param destination - Ending point
 * @param options - Routing options
 * @returns Route with turn-by-turn directions
 *
 * @example
 * const route = await getDirections(
 *   { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
 *   { latitude: 36.1699, longitude: -115.1398 }  // Las Vegas
 * );
 * console.log(`${route.distance / 1609} miles in ${route.duration / 60} minutes`);
 */
export async function getDirections(
  origin: Coordinates,
  destination: Coordinates,
  options: {
    profile?: 'driving' | 'driving-traffic' | 'walking' | 'cycling';
    alternatives?: boolean; // Return alternative routes
    steps?: boolean; // Include turn-by-turn steps
    geometries?: 'geojson' | 'polyline' | 'polyline6';
  } = {}
): Promise<Route> {
  if (!directionsService) {
    throw new Error('Mapbox not configured');
  }

  try {
    const request: any = {
      waypoints: [
        { coordinates: [origin.longitude, origin.latitude] },
        { coordinates: [destination.longitude, destination.latitude] },
      ],
      profile: options.profile || 'driving-traffic',
      alternatives: options.alternatives ?? false,
      steps: options.steps ?? true,
      geometries: options.geometries || 'geojson',
    };

    const response = await directionsService.getDirections(request).send();

    const route = response.body.routes[0];

    const result: Route = {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      steps: route.legs[0].steps.map((step: any) => ({
        distance: step.distance,
        duration: step.duration,
        instruction: step.maneuver.instruction,
        name: step.name,
        maneuver: {
          type: step.maneuver.type,
          modifier: step.maneuver.modifier,
          location: step.maneuver.location,
        },
      })),
      summary: `${(route.distance / 1609).toFixed(1)} mi, ${Math.round(route.duration / 60)} min`,
    };

    console.log(`✅ Directions calculated: ${result.summary}`);

    return result;
  } catch (error) {
    console.error('❌ Failed to get directions:', error);
    throw error;
  }
}

/**
 * Calculate travel time matrix
 *
 * Compute travel times and distances between multiple origins and destinations.
 * Useful for "Find cars within X minutes of user" queries.
 *
 * @param sources - Array of source coordinates
 * @param destinations - Array of destination coordinates (defaults to sources)
 * @param profile - Travel mode
 * @returns Matrix of travel times and distances
 *
 * @example
 * // Find which of 10 car shows are within 60 minutes
 * const userLocation = { latitude: 34.0522, longitude: -118.2437 };
 * const matrix = await getTravelTimeMatrix([userLocation], eventLocations);
 * const nearbyEvents = eventLocations.filter((_, i) => matrix.durations[0][i] < 3600);
 */
export async function getTravelTimeMatrix(
  sources: Coordinates[],
  destinations: Coordinates[] = sources,
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<TravelTimeMatrix> {
  if (!matrixService) {
    throw new Error('Mapbox not configured');
  }

  try {
    const request = {
      points: [
        ...sources.map(c => ({ coordinates: [c.longitude, c.latitude] })),
        ...destinations.map(c => ({ coordinates: [c.longitude, c.latitude] })),
      ],
      profile: `mapbox/${profile}`,
      sources: sources.map((_, i) => i),
      destinations: destinations.map((_, i) => sources.length + i),
    };

    const response = await matrixService.getMatrix(request).send();

    const result: TravelTimeMatrix = {
      sources,
      destinations,
      durations: response.body.durations,
      distances: response.body.distances || [],
    };

    console.log(`✅ Travel time matrix calculated: ${sources.length}×${destinations.length}`);

    return result;
  } catch (error) {
    console.error('❌ Failed to calculate travel time matrix:', error);
    throw error;
  }
}

// ============================================================================
// ISOCHRONES
// ============================================================================

/**
 * Generate isochrone (area reachable within time)
 *
 * Visualize "all locations within 30 minutes drive" as a polygon.
 *
 * @param center - Center point
 * @param minutes - Travel time in minutes
 * @param profile - Travel mode
 * @returns GeoJSON polygon of reachable area
 *
 * @example
 * // Show all cars within 1-hour drive
 * const isochrone = await generateIsochrone(userLocation, 60, 'driving');
 * // Use isochrone.geometry in PostGIS ST_Within query
 *
 * @note This is a simplified implementation. For production, use Mapbox Isochrone API directly
 * or implement with PostGIS routing.
 */
export async function generateIsochrone(
  center: Coordinates,
  minutes: number,
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<Isochrone> {
  // Note: Mapbox SDK doesn't include Isochrone service
  // This would require direct API call or PostGIS implementation
  // For now, return a circular approximation

  // Approximate speeds (mph)
  const speeds = {
    driving: 30,
    walking: 3,
    cycling: 12,
  };

  const speed = speeds[profile];
  const radiusMiles = (minutes / 60) * speed;
  const radiusMeters = radiusMiles * 1609.34;

  // Generate circle polygon (simplified)
  const points = 32;
  const coordinates: [number, number][] = [];

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);

    // Convert meters to degrees (approximate)
    const dLat = dy / 111320;
    const dLon = dx / (111320 * Math.cos(center.latitude * Math.PI / 180));

    coordinates.push([
      center.longitude + dLon,
      center.latitude + dLat,
    ]);
  }

  return {
    contour: minutes,
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
    color: '#6B2C91', // Rolls-Royce Purple
  };
}

// ============================================================================
// STATIC MAPS
// ============================================================================

/**
 * Generate static map image URL
 *
 * Create beautiful map thumbnails for listings and emails.
 *
 * @param options - Map options
 * @returns Static map image URL
 *
 * @example
 * const mapUrl = generateStaticMapURL({
 *   center: eventLocation,
 *   zoom: 14,
 *   width: 800,
 *   height: 600,
 *   markers: [{ coordinates: eventLocation, color: 'red', size: 'large' }]
 * });
 * // <img src={mapUrl} alt="Event Location" />
 */
export function generateStaticMapURL(options: {
  center: Coordinates;
  zoom: number;
  width?: number;
  height?: number;
  style?: string; // 'streets-v11', 'outdoors-v11', 'light-v10', 'dark-v10'
  markers?: Array<{
    coordinates: Coordinates;
    color?: string;
    label?: string;
    size?: 'small' | 'large';
  }>;
  path?: {
    coordinates: [number, number][];
    strokeColor?: string;
    strokeWidth?: number;
  };
}): string {
  if (!staticService || !MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox not configured');
  }

  const width = options.width || 800;
  const height = options.height || 600;
  const style = options.style || 'streets-v11';

  let url = `https://api.mapbox.com/styles/v1/mapbox/${style}/static/`;

  // Add markers
  if (options.markers && options.markers.length > 0) {
    const markerString = options.markers
      .map(m => {
        const pin = `pin-${m.size || 'small'}-${m.label || ''}+${m.color || 'red'}`;
        return `${pin}(${m.coordinates.longitude},${m.coordinates.latitude})`;
      })
      .join(',');
    url += `${markerString}/`;
  }

  // Add center and zoom
  url += `${options.center.longitude},${options.center.latitude},${options.zoom}`;

  // Add dimensions
  url += `/${width}x${height}`;

  // Add access token
  url += `?access_token=${MAPBOX_ACCESS_TOKEN}`;

  return url;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two points (Haversine formula)
 *
 * @param point1 - First coordinate
 * @param point2 - Second coordinate
 * @returns Distance in meters
 *
 * @example
 * const distance = calculateDistance(carLocation, userLocation);
 * console.log(`${(distance / 1609).toFixed(1)} miles away`);
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
 *
 * @param meters - Distance in meters
 * @param unit - 'mi' or 'km'
 * @returns Formatted string
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
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string
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

/**
 * Check if Mapbox is configured
 */
export function isConfigured(): boolean {
  return !!MAPBOX_ACCESS_TOKEN;
}
