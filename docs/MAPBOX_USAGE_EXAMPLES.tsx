/**
 * Mapbox GL JS Integration - Usage Examples
 *
 * Copy-paste ready code snippets for common use cases.
 */

import React, { useState } from 'react';
import {
  MapboxProvider,
  EventMap,
  ProximitySearch,
  StaticMapImage,
  DirectionsPanel,
  useProximityFilter,
  DistanceBadge,
  type EventMarker,
} from '@/components/maps';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, List, Navigation } from 'lucide-react';

// ============================================================================
// EXAMPLE 1: Event List with Map/List Toggle
// ============================================================================

export function EventsPageWithMapToggle() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [events, setEvents] = useState<EventMarker[]>([
    {
      id: 1,
      eventName: 'Barrett-Jackson Scottsdale 2025',
      coordinates: { latitude: 33.4942, longitude: -111.9261 },
      city: 'Scottsdale',
      state: 'AZ',
      startDate: '2025-01-20',
      slug: 'barrett-jackson-scottsdale'
    },
    {
      id: 2,
      eventName: 'Mecum Auctions Kissimmee',
      coordinates: { latitude: 28.3041, longitude: -81.4085 },
      city: 'Kissimmee',
      state: 'FL',
      startDate: '2025-01-05',
      slug: 'mecum-kissimmee'
    }
  ]);

  return (
    <div className="container mx-auto p-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Car Show Events</h1>

        <div className="flex gap-2">
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
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        <EventMap
          events={events}
          style="dark"
          height="600px"
          showNavigation={true}
          showUserLocation={true}
          onEventClick={(event) => {
            window.location.href = `/car-show-events/${event.slug}`;
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ event }: { event: EventMarker }) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <StaticMapImage
        center={event.coordinates}
        zoom={13}
        width={400}
        height={200}
        style="light"
        className="w-full"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{event.eventName}</h3>
        <p className="text-sm text-muted-foreground mb-2">
          {event.city}, {event.state}
        </p>
        <DistanceBadge coordinates={event.coordinates} />
        <Button className="w-full mt-4" asChild>
          <a href={`/car-show-events/${event.slug}`}>View Details</a>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Cars Near Me with Proximity Search
// ============================================================================

export function CarsNearMe() {
  interface Car {
    id: number;
    year: number;
    make: string;
    model: string;
    price: string;
    coordinates: { latitude: number; longitude: number };
    imageUrl?: string;
  }

  const [allCars, setAllCars] = useState<Car[]>([
    {
      id: 1,
      year: 1967,
      make: 'Ford',
      model: 'Mustang Fastback',
      price: '$85,000',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
      imageUrl: '/images/cars/mustang-67.jpg'
    },
    {
      id: 2,
      year: 1970,
      make: 'Chevrolet',
      model: 'Chevelle SS',
      price: '$95,000',
      coordinates: { latitude: 33.4484, longitude: -112.0740 },
      imageUrl: '/images/cars/chevelle-70.jpg'
    }
  ]);

  const [radius, setRadius] = useState(50 * 1609.34); // 50 miles in meters
  const [userLocation, setUserLocation] = useState(null);

  // Use proximity filter hook
  const { items: nearbyCars, hasLocation } = useProximityFilter(allCars, radius);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Classic Cars Near You</h1>

      {/* Proximity Search Controls */}
      <ProximitySearch
        onLocationChange={setUserLocation}
        onRadiusChange={setRadius}
        defaultRadius={50 * 1609.34}
        showRadiusSlider={true}
        className="mb-6"
      />

      {/* Results Summary */}
      <div className="bg-muted p-4 rounded-lg mb-6">
        <p className="text-sm">
          {hasLocation ? (
            <>
              Found <strong>{nearbyCars.length}</strong> cars within{' '}
              <strong>{Math.round(radius / 1609.34)} miles</strong>
            </>
          ) : (
            'Enable location to see cars near you'
          )}
        </p>
      </div>

      {/* Car Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nearbyCars.map(car => (
          <div key={car.id} className="border rounded-lg overflow-hidden">
            {car.imageUrl && (
              <img
                src={car.imageUrl}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg">
                {car.year} {car.make} {car.model}
              </h3>
              <p className="text-xl font-semibold text-primary mt-2">
                {car.price}
              </p>
              <DistanceBadge coordinates={car.coordinates} className="mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Event Details with Directions
// ============================================================================

export function EventDetailsPage({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState({
    id: 1,
    eventName: 'Barrett-Jackson Scottsdale 2025',
    coordinates: { latitude: 33.4942, longitude: -111.9261 },
    city: 'Scottsdale',
    state: 'AZ',
    startDate: '2025-01-20',
    endDate: '2025-01-28',
    description: 'The world\'s greatest collector car auctions.',
    venue: 'WestWorld of Scottsdale',
    address: '16601 N Pima Rd, Scottsdale, AZ 85260'
  });

  return (
    <div className="container mx-auto p-6">
      {/* Event Header */}
      <h1 className="text-4xl font-bold mb-4">{event.eventName}</h1>
      <p className="text-lg text-muted-foreground mb-6">
        {event.city}, {event.state} • {event.startDate} - {event.endDate}
      </p>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="directions">Directions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="prose max-w-none">
            <p>{event.description}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Venue</h3>
            <p>{event.venue}</p>
            <p className="text-sm text-muted-foreground">{event.address}</p>
          </div>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map">
          <EventMap
            events={[event]}
            style="satellite"
            height="600px"
            showNavigation={true}
            showFullscreen={true}
          />
        </TabsContent>

        {/* Directions Tab */}
        <TabsContent value="directions">
          <DirectionsPanel
            destination={event.coordinates}
            destinationName={event.eventName}
            onRouteLoad={(route) => {
              console.log('Route loaded:', route.summary);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Multi-Event Map with Clustering
// ============================================================================

export function NationalEventMap() {
  const [events, setEvents] = useState<EventMarker[]>([
    // Add 50+ events here for clustering demo
    {
      id: 1,
      eventName: 'Barrett-Jackson Scottsdale',
      coordinates: { latitude: 33.4942, longitude: -111.9261 },
      state: 'AZ',
      slug: 'barrett-jackson-az'
    },
    {
      id: 2,
      eventName: 'Mecum Chicago',
      coordinates: { latitude: 41.8781, longitude: -87.6298 },
      state: 'IL',
      slug: 'mecum-chicago'
    },
    // ... more events
  ]);

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 border-r overflow-y-auto p-4">
        <h2 className="text-2xl font-bold mb-4">All Events</h2>
        <div className="space-y-2">
          {events.map(event => (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedEventId === event.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="font-semibold">{event.eventName}</div>
              <div className="text-sm opacity-80">{event.state}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <EventMap
          events={events}
          selectedEventId={selectedEventId || undefined}
          style="dark"
          height="100%"
          showNavigation={true}
          showUserLocation={true}
          onEventSelect={(eventId) => setSelectedEventId(eventId as number)}
        />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Static Map Email Template
// ============================================================================

export function EventEmailTemplate({ event }: { event: EventMarker }) {
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-l+6B2C91(${event.coordinates.longitude},${event.coordinates.latitude})/${event.coordinates.longitude},${event.coordinates.latitude},13/800x600@2x?access_token=YOUR_TOKEN`;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>{event.eventName}</h1>
      <p>{event.city}, {event.state}</p>

      <img
        src={mapUrl}
        alt="Event Location"
        style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
      />

      <a
        href={`https://restomodcentral.com/events/${event.slug}`}
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#6B2C91',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px'
        }}
      >
        Get Directions
      </a>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: App Root with MapboxProvider
// ============================================================================

export function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <MapboxProvider autoDetectLocation={true}>
      {children}
    </MapboxProvider>
  );
}

// Usage in main.tsx or App.tsx:
/*
import { MapboxProvider } from '@/components/maps';

function App() {
  return (
    <MapboxProvider autoDetectLocation={true}>
      <Router>
        <Routes>
          <Route path="/events" element={<EventsPageWithMapToggle />} />
          <Route path="/cars-near-me" element={<CarsNearMe />} />
          <Route path="/events/:slug" element={<EventDetailsPage />} />
        </Routes>
      </Router>
    </MapboxProvider>
  );
}
*/

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export default {
  EventsPageWithMapToggle,
  CarsNearMe,
  EventDetailsPage,
  NationalEventMap,
  EventEmailTemplate,
  AppRoot,
};
