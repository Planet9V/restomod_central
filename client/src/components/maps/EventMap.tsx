/**
 * Event Map Component
 *
 * Interactive map showing car shows and events with clustering.
 * Supports mobile gestures, custom markers, and proximity search.
 */

import React, { useRef, useEffect, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, FullscreenControl } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Calendar, Clock, Navigation } from 'lucide-react';

import { useMapbox } from './MapboxProvider';
import {
  getMapStyle,
  createCustomMarker,
  calculateBounds,
  padBounds,
  EVENT_MARKER_COLOR,
  MARKER_COLOR_SELECTED,
} from '@/lib/mapbox';
import type { Coordinates } from '@/lib/mapbox';

// ============================================================================
// TYPES
// ============================================================================

export interface EventMarker {
  id: string | number;
  eventName: string;
  coordinates: Coordinates;
  startDate?: string;
  endDate?: string;
  city?: string;
  state?: string;
  slug?: string;
}

interface EventMapProps {
  events: EventMarker[];
  selectedEventId?: string | number;
  onEventSelect?: (eventId: string | number) => void;
  onEventClick?: (event: EventMarker) => void;
  style?: 'dark' | 'light' | 'satellite';
  initialZoom?: number;
  showUserLocation?: boolean;
  showNavigation?: boolean;
  showFullscreen?: boolean;
  height?: string;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EventMap({
  events,
  selectedEventId,
  onEventSelect,
  onEventClick,
  style = 'dark',
  initialZoom = 4,
  showUserLocation = true,
  showNavigation = true,
  showFullscreen = true,
  height = '500px',
  className = '',
}: EventMapProps) {
  const mapRef = useRef<MapRef>(null);
  const { accessToken, isConfigured, userLocation } = useMapbox();

  const [popupInfo, setPopupInfo] = useState<EventMarker | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -95.7129,
    latitude: 37.0902,
    zoom: initialZoom,
  });

  // Fit map to event bounds on mount or when events change
  useEffect(() => {
    if (!mapRef.current || events.length === 0) return;

    const coordinates = events.map(e => e.coordinates);
    const bounds = calculateBounds(coordinates);

    if (bounds) {
      const paddedBounds = padBounds(bounds, 0.2);
      mapRef.current.fitBounds(paddedBounds as any, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
      });
    }
  }, [events]);

  // Handle selected event
  useEffect(() => {
    if (!selectedEventId) return;

    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (selectedEvent && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedEvent.coordinates.longitude, selectedEvent.coordinates.latitude],
        zoom: 12,
        duration: 2000,
      });
      setPopupInfo(selectedEvent);
    }
  }, [selectedEventId, events]);

  if (!isConfigured) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">Map unavailable</p>
          <p className="text-sm text-gray-500 mt-2">Mapbox not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={getMapStyle(style)}
        mapboxAccessToken={accessToken}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        cooperativeGestures={true}
      >
        {/* Event Markers */}
        {events.map((event) => (
          <Marker
            key={event.id}
            longitude={event.coordinates.longitude}
            latitude={event.coordinates.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(event);
              onEventSelect?.(event.id);
              onEventClick?.(event);
            }}
          >
            <div className="cursor-pointer transition-transform hover:scale-110">
              <MapPin
                className="w-8 h-8"
                style={{
                  color: selectedEventId === event.id ? MARKER_COLOR_SELECTED : EVENT_MARKER_COLOR,
                  filter: selectedEventId === event.id ? 'drop-shadow(0 0 8px rgba(201, 167, 112, 0.6))' : 'none',
                }}
                fill={selectedEventId === event.id ? MARKER_COLOR_SELECTED : EVENT_MARKER_COLOR}
              />
            </div>
          </Marker>
        ))}

        {/* Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.coordinates.longitude}
            latitude={popupInfo.coordinates.latitude}
            anchor="top"
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
            className="event-popup"
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-sm mb-2">{popupInfo.eventName}</h3>

              {popupInfo.city && popupInfo.state && (
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{popupInfo.city}, {popupInfo.state}</span>
                </div>
              )}

              {popupInfo.startDate && (
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(popupInfo.startDate).toLocaleDateString()}</span>
                </div>
              )}

              {popupInfo.slug && (
                <a
                  href={`/car-show-events/${popupInfo.slug}`}
                  className="text-xs text-purple-600 hover:text-purple-800 mt-2 inline-block"
                >
                  View Details →
                </a>
              )}
            </div>
          </Popup>
        )}

        {/* Controls */}
        {showNavigation && (
          <NavigationControl position="top-right" />
        )}

        {showUserLocation && (
          <GeolocateControl
            position="top-right"
            trackUserLocation={true}
            showUserHeading={true}
          />
        )}

        {showFullscreen && (
          <FullscreenControl position="top-right" />
        )}
      </Map>

      {/* Event Count Badge */}
      {events.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
          <div className="text-xs font-semibold text-gray-700">
            {events.length} {events.length === 1 ? 'Event' : 'Events'}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default EventMap;
