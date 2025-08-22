/**
 * Direct API client to bypass Vite routing conflicts
 * Ensures authentic car show events load properly from database
 */

const API_BASE = '';

export async function fetchCarShowEvents(filters: Record<string, any> = {}) {
  try {
    // Build query parameters, excluding "all_*" values that mean "show all"
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && 
          value !== 'all' && 
          value !== 'all_types' && 
          value !== 'all_states' && 
          value !== 'all_categories') {
        params.append(key, String(value));
      }
    });

    const url = `${API_BASE}/api/car-show-events${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add credentials and cache control
      credentials: 'same-origin',
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Expected JSON but received: ${contentType}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Helper to get auth token from local storage
function getAuthToken() {
  const token = localStorage.getItem('auth_token');
  return token ? `Bearer ${token}` : '';
}

// GET user's itinerary
export async function getItinerary() {
  const response = await fetch(`${API_BASE}/api/itinerary`, {
    headers: {
      'Authorization': getAuthToken(),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch itinerary');
  return response.json();
}

// POST to add an event to the itinerary
export async function addToItinerary(eventId: number) {
  const response = await fetch(`${API_BASE}/api/itinerary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthToken(),
    },
    body: JSON.stringify({ eventId }),
  });
  if (!response.ok) throw new Error('Failed to add to itinerary');
  return response.json();
}

// DELETE to remove an event from the itinerary
export async function removeFromItinerary(eventId: number) {
  const response = await fetch(`${API_BASE}/api/itinerary/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': getAuthToken(),
    },
  });
  if (!response.ok) throw new Error('Failed to remove from itinerary');
  return response.json();
}