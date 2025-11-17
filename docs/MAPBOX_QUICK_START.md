# Mapbox GL JS - Quick Start Guide

**Get started in 5 minutes!**

---

## 1. Configuration (Required)

Add to `.env`:

```bash
MAPBOX_ACCESS_TOKEN=pk.eyJ...              # Server-side
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...         # Client-side
```

**Get token:** https://account.mapbox.com/

---

## 2. Wrap Your App

```tsx
// client/src/App.tsx or main.tsx
import { MapboxProvider } from '@/components/maps';

function App() {
  return (
    <MapboxProvider autoDetectLocation={true}>
      {/* Your app */}
    </MapboxProvider>
  );
}
```

---

## 3. Use Components

### Event Map

```tsx
import { EventMap } from '@/components/maps';

<EventMap
  events={[
    {
      id: 1,
      eventName: 'Barrett-Jackson Scottsdale',
      coordinates: { latitude: 33.4942, longitude: -111.9261 },
      city: 'Scottsdale',
      state: 'AZ',
      slug: 'barrett-jackson'
    }
  ]}
  style="dark"
  height="500px"
  onEventClick={(event) => console.log(event)}
/>
```

### Proximity Search

```tsx
import { ProximitySearch } from '@/components/maps';

<ProximitySearch
  onLocationChange={(location) => console.log('User at:', location)}
  onRadiusChange={(radius) => console.log('Search radius:', radius)}
  defaultRadius={50 * 1609.34} // 50 miles
/>
```

### Static Map Thumbnail

```tsx
import { StaticMapImage } from '@/components/maps';

<StaticMapImage
  center={{ latitude: 33.4942, longitude: -111.9261 }}
  zoom={14}
  width={800}
  height={600}
  style="light"
/>
```

### Driving Directions

```tsx
import { DirectionsPanel } from '@/components/maps';

<DirectionsPanel
  destination={{ latitude: 33.4942, longitude: -111.9261 }}
  destinationName="Barrett-Jackson Scottsdale"
/>
```

---

## 4. API Calls

### Geocode Address

```tsx
const response = await fetch(
  '/api/mapbox/geocode?address=Barrett-Jackson,%20Scottsdale,%20AZ&country=US'
);
const { results } = await response.json();
console.log('Coordinates:', results[0].coordinates);
```

### Get Directions

```tsx
const response = await fetch('/api/mapbox/directions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: { latitude: 34.0522, longitude: -118.2437 },
    destination: { latitude: 33.4942, longitude: -111.9261 },
    profile: 'driving-traffic'
  })
});
const route = await response.json();
console.log('Route:', route.summary);
```

---

## 5. Utilities

### Calculate Distance

```tsx
import { calculateDistance, formatDistance } from '@/lib/mapbox';

const distance = calculateDistance(
  { latitude: 34.0522, longitude: -118.2437 },
  { latitude: 33.4942, longitude: -111.9261 }
);
console.log(formatDistance(distance)); // "370.5 mi"
```

### Get User Location

```tsx
import { getUserLocation } from '@/lib/geolocation';

const location = await getUserLocation();
console.log('User at:', location.coordinates);
console.log('Source:', location.source); // 'gps' | 'ip' | 'cache' | 'default'
```

---

## Complete File Structure

```
✅ Created Files:

Client-Side:
- client/src/components/maps/MapboxProvider.tsx
- client/src/components/maps/EventMap.tsx
- client/src/components/maps/ProximitySearch.tsx
- client/src/components/maps/StaticMapImage.tsx
- client/src/components/maps/DirectionsPanel.tsx
- client/src/components/maps/index.ts
- client/src/lib/mapbox.ts
- client/src/lib/geolocation.ts

Server-Side:
- server/routes/mapbox.ts (registered in server/routes.ts)
- server/services/geospatial/mapboxService.ts (already existed)

Documentation:
- docs/MAPBOX_INTEGRATION_GUIDE.md (full guide)
- docs/MAPBOX_QUICK_START.md (this file)
```

---

## Example Integrations

### Add Map to Events Page

```tsx
// pages/EventsPage.tsx
import { useState } from 'react';
import { EventMap, ProximitySearch } from '@/components/maps';
import { Button } from '@/components/ui/button';

function EventsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [events, setEvents] = useState([...]); // Your events

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Car Shows</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
          >
            Map
          </Button>
        </div>
      </div>

      {viewMode === 'map' && (
        <EventMap events={events} height="600px" style="dark" />
      )}

      {viewMode === 'list' && (
        <div className="grid gap-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Add Proximity to Car Search

```tsx
// pages/CarsForSale.tsx
import { useState } from 'react';
import { ProximitySearch, useProximityFilter } from '@/components/maps';

function CarsForSale() {
  const [cars, setCars] = useState([...]); // Your cars
  const [radius, setRadius] = useState(50 * 1609.34); // 50 miles

  const { items: filteredCars } = useProximityFilter(cars, radius);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cars Near You</h1>

      <ProximitySearch
        onRadiusChange={setRadius}
        defaultRadius={50 * 1609.34}
        className="mb-6"
      />

      <p className="text-sm text-muted-foreground mb-4">
        Found {filteredCars.length} cars
      </p>

      <div className="grid gap-4">
        {filteredCars.map(car => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
}
```

---

## Styling Guide

### Luxury Dark Theme (Default)

```tsx
<EventMap style="dark" />
```

**Colors:**
- Background: Dark (#1a1a1a)
- Markers: Purple (#6B2C91) - Rolls-Royce
- Selected: Gold (#C9A770)
- Event: Burgundy (#7D2027)

### Custom Marker

```tsx
import { createCustomMarker, MARKER_COLOR } from '@/lib/mapbox';

const marker = createCustomMarker({
  color: MARKER_COLOR,
  label: '12',
  selected: true,
  size: 'large'
});
```

---

## Troubleshooting

### Map Not Showing?
1. Check `.env` has both tokens
2. Verify tokens start with `pk.`
3. Check browser console for errors
4. Import CSS: `import 'mapbox-gl/dist/mapbox-gl.css';`

### Location Not Detected?
1. Check HTTPS (required for geolocation)
2. Check browser location permissions
3. Fallback to IP location (automatic)

### API Errors?
1. Verify server token in `.env`
2. Check routes are registered in `server/routes.ts`
3. Test endpoint: `GET /api/mapbox/health`

---

## Resources

- **Full Guide:** `/docs/MAPBOX_INTEGRATION_GUIDE.md`
- **Spec:** `/docs/SPEC_07_ENHANCED_TOOLS.md`
- **Mapbox Docs:** https://docs.mapbox.com/
- **Dashboard:** https://account.mapbox.com/

---

**Ready to go!** Your Mapbox integration is complete. Start by wrapping your app in `<MapboxProvider>` and using the components.
