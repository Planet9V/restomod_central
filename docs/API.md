# API Documentation

Complete API reference for Restomod Central REST API.

## Base URL

**Development**: `http://localhost:5000/api`
**Production**: `https://restomodcentral.com/api`

## Authentication

Most endpoints require authentication via session cookies.

### Register
```http
POST /api/auth/register
```

**Request Body**:
```json
{
  "username": "string (required, 3-20 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)"
}
```

**Response** (201):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "isAdmin": false,
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

### Login
```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response** (200):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "isAdmin": false
}
```

Sets session cookie automatically.

### Logout
```http
POST /api/auth/logout
```

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User
```http
GET /api/auth/user
```

**Response** (200):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "isAdmin": false
}
```

**Response** (401 if not authenticated):
```json
{
  "error": "Not authenticated"
}
```

---

## Vehicles

### List Vehicles
```http
GET /api/cars
```

**Query Parameters**:
- `make` (string, optional) - Filter by make (e.g., "Ford")
- `category` (string, optional) - Filter by category (e.g., "Muscle Car")
- `minYear` (number, optional) - Minimum year
- `maxYear` (number, optional) - Maximum year
- `minPrice` (number, optional) - Minimum price
- `maxPrice` (number, optional) - Maximum price
- `featured` (boolean, optional) - Only featured vehicles
- `limit` (number, optional, default: 50) - Results per page

**Response** (200):
```json
[
  {
    "id": 1,
    "listingId": "GWY12345",
    "make": "Ford",
    "model": "Mustang",
    "year": 1967,
    "price": 85000,
    "description": "Fully restored classic Mustang...",
    "location": "St. Louis, Missouri",
    "imageUrl": "https://...",
    "detailsUrl": "https://...",
    "category": "Muscle Car",
    "investmentGrade": "Premium",
    "featured": true
  }
  // ...more vehicles
]
```

### Get Vehicle by ID
```http
GET /api/cars/:id
```

**Parameters**:
- `id` (number, required) - Vehicle ID

**Response** (200):
```json
{
  "id": 1,
  "listingId": "GWY12345",
  "make": "Ford",
  "model": "Mustang",
  "year": 1967,
  "price": 85000,
  "description": "Fully restored classic Mustang...",
  "location": "St. Louis, Missouri",
  "imageUrl": "https://...",
  "detailsUrl": "https://...",
  "category": "Muscle Car",
  "investmentGrade": "Premium",
  "featured": true
}
```

**Response** (404):
```json
{
  "error": "Vehicle not found"
}
```

### Get Featured Vehicles
```http
GET /api/cars/featured
```

**Query Parameters**:
- `limit` (number, optional, default: 6)

**Response** (200):
```json
[
  {
    "id": 1,
    "make": "Ford",
    "model": "Mustang",
    "year": 1967,
    "price": 85000,
    "imageUrl": "https://...",
    "featured": true
  }
  // ...more vehicles
]
```

### Search Vehicles (Full-Text)
```http
GET /api/search/vehicles
```

**Query Parameters**:
- `q` (string, required) - Search query
- `limit` (number, optional, default: 20)

**Response** (200):
```json
[
  {
    "id": 1,
    "make": "Ford",
    "model": "Mustang",
    "year": 1967,
    "description": "Fully restored classic Mustang...",
    "price": 85000,
    "rank": 1.5 // Relevance score
  }
]
```

---

## Events

### List Events
```http
GET /api/events
```

**Query Parameters**:
- `eventType` (string, optional) - Filter by type ("car_show", "auction", "rally", etc.)
- `state` (string, optional) - Filter by state (e.g., "California")
- `city` (string, optional) - Filter by city
- `startDate` (ISO date, optional) - Events after this date
- `endDate` (ISO date, optional) - Events before this date
- `search` (string, optional) - Search in name/description
- `limit` (number, optional, default: 50)

**Response** (200):
```json
[
  {
    "id": 1,
    "name": "Midwest Dream Car Spring Classic",
    "eventType": "car_show",
    "description": "Annual spring car show...",
    "startDate": "2025-04-15T09:00:00.000Z",
    "endDate": "2025-04-17T18:00:00.000Z",
    "location": "Schaumburg Convention Center",
    "city": "Schaumburg",
    "state": "Illinois",
    "website": "https://...",
    "registrationUrl": "https://...",
    "venueType": "convention_center",
    "expectedAttendance": 5000
  }
]
```

### Get Event by ID
```http
GET /api/events/:id
```

**Parameters**:
- `id` (number, required) - Event ID

**Response** (200):
```json
{
  "id": 1,
  "name": "Midwest Dream Car Spring Classic",
  "eventType": "car_show",
  "description": "Annual spring car show...",
  "startDate": "2025-04-15T09:00:00.000Z",
  "endDate": "2025-04-17T18:00:00.000Z",
  "location": "Schaumburg Convention Center",
  "city": "Schaumburg",
  "state": "Illinois",
  "website": "https://...",
  "registrationUrl": "https://...",
  "venueType": "convention_center",
  "expectedAttendance": 5000,
  "comments": [
    {
      "id": 1,
      "content": "Great event!",
      "userId": 5,
      "username": "carguy123",
      "createdAt": "2025-01-10T14:30:00.000Z"
    }
  ]
}
```

### Add Comment to Event
```http
POST /api/events/:id/comments
```

**Authentication**: Required

**Parameters**:
- `id` (number, required) - Event ID

**Request Body**:
```json
{
  "content": "string (required, 1-1000 chars)"
}
```

**Response** (201):
```json
{
  "id": 42,
  "eventId": 1,
  "userId": 5,
  "username": "carguy123",
  "content": "Great event!",
  "createdAt": "2025-01-15T16:45:00.000Z"
}
```

---

## User Configurations

User-created vehicle builds.

### List User Configurations
```http
GET /api/user/configurations
```

**Authentication**: Required

**Response** (200):
```json
[
  {
    "id": 1,
    "userId": 5,
    "vehicleType": "muscle_car",
    "baseVehicle": {
      "make": "Chevrolet",
      "model": "Chevelle",
      "year": 1970
    },
    "modifications": {
      "engine": "LS3 V8 Crate Engine",
      "transmission": "Tremec TKX 5-Speed",
      "suspension": "RideTech Air Ride",
      "wheels": "18\" Forgeline Wheels",
      "brakes": "Wilwood 6-Piston Front"
    },
    "estimatedCost": 125000,
    "createdAt": "2025-01-10T10:00:00.000Z",
    "completionDate": null
  }
]
```

### Create Configuration
```http
POST /api/user/configurations
```

**Authentication**: Required

**Request Body**:
```json
{
  "vehicleType": "string (required)",
  "baseVehicle": {
    "make": "string (required)",
    "model": "string (required)",
    "year": "number (required)"
  },
  "modifications": {}, // object (optional)
  "estimatedCost": "number (optional)",
  "completionDate": "ISO date (optional)"
}
```

**Response** (201):
```json
{
  "id": 10,
  "userId": 5,
  "vehicleType": "muscle_car",
  "baseVehicle": {...},
  "modifications": {...},
  "estimatedCost": 125000,
  "createdAt": "2025-01-15T16:50:00.000Z"
}
```

### Update Configuration
```http
PUT /api/user/configurations/:id
```

**Authentication**: Required (must own configuration)

**Parameters**:
- `id` (number, required) - Configuration ID

**Request Body**: Same as create

**Response** (200): Updated configuration object

**Response** (403):
```json
{
  "error": "Not authorized to update this configuration"
}
```

### Delete Configuration
```http
DELETE /api/user/configurations/:id
```

**Authentication**: Required (must own configuration)

**Parameters**:
- `id` (number, required) - Configuration ID

**Response** (200):
```json
{
  "message": "Configuration deleted successfully"
}
```

---

## User Itineraries

Trip planning for visiting multiple events.

### List User Itineraries
```http
GET /api/user/itineraries
```

**Authentication**: Required

**Response** (200):
```json
[
  {
    "id": 1,
    "userId": 5,
    "name": "Spring 2025 Car Show Road Trip",
    "description": "Visiting car shows in the Midwest",
    "events": [
      {
        "id": 1,
        "name": "Midwest Dream Car Spring Classic",
        "startDate": "2025-04-15T09:00:00.000Z",
        "city": "Schaumburg",
        "state": "Illinois"
      },
      {
        "id": 5,
        "name": "Detroit Autorama",
        "startDate": "2025-04-20T09:00:00.000Z",
        "city": "Detroit",
        "state": "Michigan"
      }
    ],
    "createdAt": "2025-01-12T14:00:00.000Z"
  }
]
```

### Create Itinerary
```http
POST /api/user/itineraries
```

**Authentication**: Required

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "eventIds": [1, 5, 12] // array of event IDs
}
```

**Response** (201): Created itinerary object

### Delete Itinerary
```http
DELETE /api/user/itineraries/:id
```

**Authentication**: Required (must own itinerary)

**Parameters**:
- `id` (number, required) - Itinerary ID

**Response** (200):
```json
{
  "message": "Itinerary deleted successfully"
}
```

---

## Admin Endpoints

### List Projects
```http
GET /api/admin/projects
```

**Authentication**: Required (Admin only)

**Response** (200): Array of project objects

### Create Project
```http
POST /api/admin/projects
```

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "title": "string (required)",
  "subtitle": "string (required)",
  "slug": "string (required, unique)",
  "description": "string (required)",
  "category": "string (required)",
  "imageUrl": "string (required)",
  "galleryImages": ["url1", "url2"],
  "specs": {
    "Engine": "LS3 V8",
    "Horsepower": "525 HP"
  },
  "features": ["Feature 1", "Feature 2"]
}
```

**Response** (201): Created project object

### Update Project
```http
PUT /api/admin/projects/:id
```

**Authentication**: Required (Admin only)

### Delete Project
```http
DELETE /api/admin/projects/:id
```

**Authentication**: Required (Admin only)

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "error": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

**Current**: No rate limiting (development)
**Future**: 100 requests per 15 minutes per IP

---

## CORS

**Development**: Allowed from any origin
**Production**: Allowed from `restomodcentral.com` only

---

## Pagination

For endpoints returning lists, pagination will be added in future:

**Query Parameters** (planned):
- `page` (number, default: 1)
- `perPage` (number, default: 20, max: 100)

**Response Headers** (planned):
```
X-Total-Count: 1234
X-Page: 1
X-Per-Page: 20
Link: <url>; rel="next", <url>; rel="last"
```

---

Last Updated: 2025-11-17
