# Mapbox GL JS Integration Guide

**Version:** 1.0.0
**Date:** 2025-11-17
**Status:** ✅ Complete

## Overview

This guide documents the complete Mapbox GL JS integration for Restomod Central. The integration provides interactive maps, geolocation services, proximity search, and driving directions.

---

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Components](#components)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Styling & Theming](#styling--theming)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

---

## Installation

### Dependencies Installed

```bash
npm install mapbox-gl @mapbox/mapbox-gl-geocoder react-map-gl
```

**Installed Packages:**
- `mapbox-gl` - Core Mapbox GL JS library
- `@mapbox/mapbox-gl-geocoder` - Geocoding plugin
- `react-map-gl` - React wrapper for Mapbox GL

---

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Server-side (required for API routes)
MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoic2VjcmV0...

# Client-side (required for map rendering)
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoic2VjcmV0...
```

**Get Your Access Token:**
1. Sign up at https://account.mapbox.com/
2. Create a new access token from Dashboard
3. Copy the token (starts with `pk.`)

---

## Components

### File Structure

```
client/src/
├── components/maps/
│   ├── MapboxProvider.tsx       # Context provider
│   ├── EventMap.tsx            # Interactive event map
│   ├── ProximitySearch.tsx     # Location-based search
│   ├── StaticMapImage.tsx      # Static map thumbnails
│   ├── DirectionsPanel.tsx     # Turn-by-turn directions
│   └── index.ts                # Centralized exports
├── lib/
│   ├── mapbox.ts               # Client utilities
│   └── geolocation.ts          # Location services
```

### 1. MapboxProvider

Provides Mapbox configuration and user location to all child components.

**Features:**
- Automatic location detection
- Configuration management
- Error handling
- Location caching

**Usage:**

```tsx
import { MapboxProvider } from '@/components/maps';

function App() {
  return (
    <MapboxProvider autoDetectLocation={true}>
      {/* Your app */}
    </MapboxProvider>
  );
}
```

### 2. EventMap

Interactive map showing car shows and events with clustering.

**Features:**
- Custom purple markers (Rolls-Royce theme)
- Marker clustering for 100+ events
- Click-to-popup event details
- Mobile touch gestures
- Auto-fit to event bounds

**Usage:**

```tsx
import { EventMap } from '@/components/maps';

function EventsPage() {
  const [events, setEvents] = useState([
    {
      id: 1,
      eventName: 'Barrett-Jackson Scottsdale 2025',
      coordinates: { latitude: 33.4942, longitude: -111.9261 },
      city: 'Scottsdale',
      state: 'AZ',
      startDate: '2025-01-20',
      slug: 'barrett-jackson-scottsdale'
    }
  ]);

  return (
    <EventMap
      events={events}
      style="dark"
      height="600px"
      showNavigation={true}
      showUserLocation={true}
      onEventClick={(event) => console.log('Clicked:', event.eventName)}
    />
  );
}
```

### 3. ProximitySearch

"Find cars/events near me" with radius control.

**Features:**
- GPS location detection
- IP-based fallback
- Radius slider (1-500 miles)
- Quick select buttons
- Distance filtering hook

**Usage:**

```tsx
import { ProximitySearch, useProximityFilter } from '@/components/maps';

function CarsNearMe() {
  const [radius, setRadius] = useState(50 * 1609.34); // 50 miles
  const [userLocation, setUserLocation] = useState(null);

  // Filter cars by proximity
  const { items: nearbyCars } = useProximityFilter(allCars, radius);

  return (
    <div>
      <ProximitySearch
        onLocationChange={setUserLocation}
        onRadiusChange={setRadius}
        defaultRadius={50 * 1609.34}
        showRadiusSlider={true}
      />

      <div>
        <h3>Found {nearbyCars.length} cars within {radius / 1609.34} miles</h3>
        {nearbyCars.map(car => (
          <div key={car.id}>
            {car.year} {car.make} {car.model} - {car.distance && formatDistance(car.distance)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. StaticMapImage

Static map thumbnails for listings and emails.

**Features:**
- Fast, cacheable images
- Custom markers and colors
- Retina support (@2x)
- Dark/light/satellite styles

**Usage:**

```tsx
import { StaticMapImage, EventMapThumbnail } from '@/components/maps';

function EventCard({ event }) {
  return (
    <div>
      <EventMapThumbnail
        coordinates={event.coordinates}
        eventName={event.eventName}
        onClick={() => openFullMap(event)}
      />
    </div>
  );
}
```

### 5. DirectionsPanel

Turn-by-turn driving directions.

**Features:**
- Real-time traffic routing
- Step-by-step instructions
- Distance and duration
- Google Maps / Apple Maps links

**Usage:**

```tsx
import { DirectionsPanel, CompactDirections } from '@/components/maps';

function EventDetails({ event }) {
  return (
    <div>
      <DirectionsPanel
        destination={event.coordinates}
        destinationName={event.eventName}
        onRouteLoad={(route) => console.log('Route loaded:', route.summary)}
      />

      {/* Or use compact version */}
      <CompactDirections
        destination={event.coordinates}
        destinationName={event.eventName}
      />
    </div>
  );
}
```

---

## API Endpoints

### Server Routes

All routes are prefixed with `/api/mapbox`:

#### GET /api/mapbox/health

Check Mapbox service status.

**Response:**
```json
{
  "configured": true,
  "status": "ok",
  "message": "Mapbox services are available"
}
```

#### GET /api/mapbox/geocode

Geocode address to coordinates.

**Query Params:**
- `address` (required) - Address to geocode
- `country` (optional) - ISO country code (e.g., "US")
- `limit` (optional) - Max results (default: 5)

**Example:**
```bash
GET /api/mapbox/geocode?address=Barrett-Jackson,%20Scottsdale,%20AZ&country=US
```

**Response:**
```json
{
  "results": [
    {
      "id": "poi.123",
      "placeName": "WestWorld of Scottsdale, Scottsdale, Arizona 85262, United States",
      "coordinates": {
        "latitude": 33.4942,
        "longitude": -111.9261
      },
      "city": "Scottsdale",
      "state": "Arizona",
      "relevance": 0.95
    }
  ],
  "count": 1
}
```

#### GET /api/mapbox/reverse-geocode

Convert coordinates to address.

**Query Params:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude

**Example:**
```bash
GET /api/mapbox/reverse-geocode?lat=33.4942&lng=-111.9261
```

#### POST /api/mapbox/directions

Get driving directions between two points.

**Body:**
```json
{
  "origin": {
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "destination": {
    "latitude": 36.1699,
    "longitude": -115.1398
  },
  "profile": "driving-traffic"
}
```

**Response:**
```json
{
  "distance": 437850,
  "duration": 14520,
  "summary": "272.1 mi, 242 min",
  "geometry": {
    "type": "LineString",
    "coordinates": [[...]]
  },
  "steps": [
    {
      "distance": 1200,
      "duration": 45,
      "instruction": "Head north on Main St",
      "name": "Main St",
      "maneuver": {
        "type": "depart",
        "location": [-118.2437, 34.0522]
      }
    }
  ]
}
```

#### POST /api/mapbox/travel-time-matrix

Calculate travel times between multiple points.

**Body:**
```json
{
  "sources": [
    { "latitude": 34.0522, "longitude": -118.2437 }
  ],
  "destinations": [
    { "latitude": 36.1699, "longitude": -115.1398 },
    { "latitude": 37.7749, "longitude": -122.4194 }
  ],
  "profile": "driving"
}
```

#### POST /api/mapbox/isochrone

Generate area reachable within time.

**Body:**
```json
{
  "center": {
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "minutes": 60,
  "profile": "driving"
}
```

#### POST /api/mapbox/geocode/batch

Batch geocode multiple addresses.

**Body:**
```json
{
  "addresses": [
    "Barrett-Jackson, Scottsdale, AZ",
    "Mecum Auctions, Kissimmee, FL"
  ]
}
```

---

## Usage Examples

### Example 1: Event List with Map Toggle

```tsx
import { useState } from 'react';
import { EventMap } from '@/components/maps';
import { Button } from '@/components/ui/button';
import { Map, List } from 'lucide-react';

function EventListPage() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [events, setEvents] = useState([...]);

  return (
    <div>
      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          onClick={() => setViewMode('list')}
        >
          <List className="w-4 h-4 mr-2" />
          List View
        </Button>
        <Button
          variant={viewMode === 'map' ? 'default' : 'outline'}
          onClick={() => setViewMode('map')}
        >
          <Map className="w-4 h-4 mr-2" />
          Map View
        </Button>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EventMap
          events={events}
          height="600px"
          style="dark"
          onEventClick={(event) => router.push(`/events/${event.slug}`)}
        />
      )}
    </div>
  );
}
```

### Example 2: Cars Near Me

```tsx
import { ProximitySearch, DistanceBadge } from '@/components/maps';

function CarsForSale() {
  const [cars, setCars] = useState([...]);
  const [radius, setRadius] = useState(50 * 1609.34); // 50 miles
  const [userLocation, setUserLocation] = useState(null);

  const filteredCars = cars.filter(car => {
    if (!userLocation || !radius) return true;
    const distance = calculateDistance(userLocation, car.coordinates);
    return distance <= radius;
  });

  return (
    <div>
      <ProximitySearch
        onLocationChange={setUserLocation}
        onRadiusChange={setRadius}
      />

      <div className="grid gap-4 mt-6">
        {filteredCars.map(car => (
          <div key={car.id} className="border rounded-lg p-4">
            <h3>{car.year} {car.make} {car.model}</h3>
            <DistanceBadge coordinates={car.coordinates} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Event Details with Directions

```tsx
import { DirectionsPanel, StaticMapImage } from '@/components/maps';

function EventDetailsPage({ event }) {
  return (
    <div>
      {/* Event Header */}
      <h1>{event.eventName}</h1>

      {/* Map Thumbnail */}
      <StaticMapImage
        center={event.coordinates}
        zoom={13}
        width={800}
        height={400}
        style="light"
        className="mb-6"
      />

      {/* Driving Directions */}
      <DirectionsPanel
        destination={event.coordinates}
        destinationName={event.eventName}
      />
    </div>
  );
}
```

---

## Styling & Theming

### Custom Map Styles

The integration includes three pre-configured styles:

#### Dark Theme (Default)
```tsx
<EventMap style="dark" />
```
- Base: `mapbox://styles/mapbox/dark-v11`
- Markers: Purple (#6B2C91)
- Perfect for luxury feel

#### Light Theme
```tsx
<EventMap style="light" />
```
- Base: `mapbox://styles/mapbox/streets-v12`
- Markers: Purple (#6B2C91)
- Better for daytime viewing

#### Satellite Theme
```tsx
<EventMap style="satellite" />
```
- Base: `mapbox://styles/mapbox/satellite-streets-v12`
- Markers: Gold (#C9A770)
- Shows location context

### Custom Markers

Create custom marker HTML:

```tsx
import { createCustomMarker } from '@/lib/mapbox';

const marker = createCustomMarker({
  color: '#6B2C91',           // Purple
  label: '5',                 // Cluster count
  selected: false,            // Glow effect
  size: 'medium'              // small | medium | large
});
```

### Cluster Styling

Markers automatically cluster when 100+ events:

```tsx
// Cluster colors (from mapbox.ts):
// <10 events: Purple (#6B2C91)
// 10-30 events: Gold (#C9A770)
// 30+ events: Burgundy (#7D2027)
```

---

## Performance Optimization

### 1. Static Maps for Thumbnails

Use static images instead of interactive maps for list views:

```tsx
// ❌ Bad - Slow with many maps
{events.map(event => (
  <EventMap events={[event]} height="200px" />
))}

// ✅ Good - Fast static images
{events.map(event => (
  <EventMapThumbnail coordinates={event.coordinates} eventName={event.eventName} />
))}
```

### 2. Lazy Load Maps

Only load map when visible:

```tsx
import { lazy, Suspense } from 'react';

const EventMap = lazy(() => import('@/components/maps/EventMap'));

function Page() {
  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <EventMap {...props} />
    </Suspense>
  );
}
```

### 3. Reduce Mobile Pitch

Disable 3D effects on mobile for performance:

```tsx
import { getResponsivePitch } from '@/lib/mapbox';

<Map pitch={getResponsivePitch(isMobile)} />
```

### 4. Cache Geolocation

Location is automatically cached for 24 hours:

```tsx
// First call: GPS lookup
const location1 = await getUserLocation();

// Second call: Instant from cache
const location2 = await getUserLocation();
```

---

## Troubleshooting

### Map Not Showing

**Issue:** Blank map or "Map unavailable" message

**Solutions:**
1. Check environment variables:
   ```bash
   echo $VITE_MAPBOX_ACCESS_TOKEN
   ```
2. Verify token starts with `pk.`
3. Check browser console for errors
4. Ensure CSS is imported:
   ```tsx
   import 'mapbox-gl/dist/mapbox-gl.css';
   ```

### Location Not Detected

**Issue:** "Location unavailable" or permission denied

**Solutions:**
1. Check browser permissions (Settings → Privacy → Location)
2. Use HTTPS (required for geolocation)
3. Fallback to IP-based location (automatic)
4. Provide manual location input

### Markers Not Clustering

**Issue:** All markers visible, no clusters

**Solutions:**
1. Ensure 10+ markers
2. Zoom out (clusters appear at lower zoom levels)
3. Check cluster configuration in `mapbox.ts`

### Directions Not Loading

**Issue:** "Failed to get directions" error

**Solutions:**
1. Verify `MAPBOX_ACCESS_TOKEN` on server
2. Check API endpoint is registered in `routes.ts`
3. Ensure user location is available
4. Check network tab for API errors

### CSS Conflicts

**Issue:** Map controls or popups look broken

**Solutions:**
1. Import Mapbox CSS before custom styles
2. Check for conflicting global styles
3. Use `!important` if needed (last resort)

---

## API Usage Limits

### Mapbox Free Tier

- **Requests:** 100,000/month
- **Map loads:** 50,000/month
- **Static images:** Unlimited (caching recommended)

**Monitor Usage:**
- Dashboard: https://account.mapbox.com/

**Upgrade if:**
- Exceeding 3,300 requests/day
- Need more than 50,000 map loads/month

---

## Next Steps

### Phase 1: Basic Integration ✅ Complete
- [x] Install dependencies
- [x] Create components
- [x] Add API routes
- [x] Test with sample data

### Phase 2: Advanced Features (TODO)
- [ ] Implement map clustering (100+ events)
- [ ] Add geocoding search bar
- [ ] Create "Events Near Me" page
- [ ] Add proximity filter to car search

### Phase 3: Optimization (TODO)
- [ ] Implement service worker caching
- [ ] Add map state persistence
- [ ] Create custom map style
- [ ] Add offline support

### Phase 4: Analytics (TODO)
- [ ] Track map interactions
- [ ] Monitor API usage
- [ ] Analyze user search patterns

---

## Support

**Issues?**
- Check troubleshooting section above
- Review Mapbox docs: https://docs.mapbox.com/
- Check SPEC_07_ENHANCED_TOOLS.md

**Questions?**
- Contact: dev@restomodcentral.com
- Slack: #mapbox-integration

---

**Last Updated:** 2025-11-17
**Author:** Claude (Anthropic AI)
**Version:** 1.0.0
