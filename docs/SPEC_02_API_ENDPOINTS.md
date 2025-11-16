# API Endpoints Specification v1.0
## Luxury Classic Car Marketplace - RESTful API

**Version:** 1.0
**Last Updated:** 2025-11-16
**Status:** DRAFT - Awaiting Approval
**Base URL:** `https://api.restomod-central.com` (production)
**Base URL:** `http://localhost:5000` (development)

---

## 1. API Design Principles

### REST Standards
- **Resource-based URLs:** `/api/cars/:id` not `/api/getCar/:id`
- **HTTP Methods:** GET, POST, PUT, PATCH, DELETE
- **Status Codes:** 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- **Response Format:** JSON with consistent structure

### Standard Response Format
```typescript
// Success response
{
  success: true,
  data: { ... },
  meta: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8
  }
}

// Error response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid year range",
    details: { field: "year", received: 3000, max: 2026 }
  }
}
```

### Authentication
- **Method:** JWT tokens in Authorization header
- **Format:** `Authorization: Bearer <token>`
- **Token Expiry:** 7 days
- **Refresh:** `/api/auth/refresh`

---

## 2. Authentication Endpoints

### POST /api/auth/register
**Purpose:** Create new user account

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "city": "Chicago",
  "state": "IL"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "city": "Chicago",
      "state": "IL",
      "isAdmin": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation:**
- Email must be unique and valid format
- Password min 8 characters, must include uppercase, lowercase, number
- Username min 3 characters, alphanumeric only

---

### POST /api/auth/login
**Purpose:** Authenticate user and get JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": { ...user_object },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**Errors:**
- 401: Invalid credentials
- 403: Account disabled

---

### POST /api/auth/refresh
**Purpose:** Refresh expired JWT token

**Headers:**
```
Authorization: Bearer <expired_or_valid_token>
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token...",
    "expiresIn": 604800
  }
}
```

---

### POST /api/auth/forgot-password
**Purpose:** Initiate password reset

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** 200 OK (always, even if email not found - security)
```json
{
  "success": true,
  "message": "If email exists, reset instructions have been sent"
}
```

---

### POST /api/auth/reset-password
**Purpose:** Complete password reset

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 3. Car Listings Endpoints

### GET /api/cars
**Purpose:** Search and filter car listings

**Query Parameters:**
```
?page=1
&limit=20
&make=Ford
&model=Mustang
&yearMin=1965
&yearMax=1970
&priceMin=20000
&priceMax=100000
&location_state=CA
&investmentGrade=A,A+
&status=active
&sortBy=price
&sortOrder=asc
&search=convertible
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "cars": [
      {
        "id": 1,
        "make": "Ford",
        "model": "Mustang",
        "year": 1967,
        "price": 45000,
        "imageUrl": "https://...",
        "location_city": "Los Angeles",
        "location_state": "CA",
        "investmentGrade": "A",
        "appreciationRate": 12.5,
        "featured": true
      },
      // ... more cars
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "totalPages": 23
  }
}
```

---

### GET /api/cars/:id
**Purpose:** Get detailed car information

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "car": {
      "id": 1,
      "make": "Ford",
      "model": "Mustang",
      "year": 1967,
      "price": 45000,
      "vin": "7F01C123456",
      "stockNumber": "MUS-1967-001",
      "mileage": 45000,
      "exteriorColor": "Candy Apple Red",
      "interiorColor": "Black Vinyl",
      "engine": "289 V8",
      "transmission": "4-Speed Manual",
      "drivetrain": "RWD",
      "bodyStyle": "Fastback",
      "locationCity": "Los Angeles",
      "locationState": "CA",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "imageUrl": "https://...",
      "galleryImages": ["url1", "url2", "url3"],
      "description": "Pristine 1967 Ford Mustang Fastback...",
      "features": {
        "airConditioning": true,
        "powerSteering": true,
        "powerBrakes": false
      },
      "modifications": ["Upgraded suspension", "Performance exhaust"],
      "condition": "Excellent",
      "restorationLevel": "#2",
      "investmentGrade": "A",
      "appreciationRate": 12.5,
      "marketTrend": "rising",
      "valuationConfidence": 0.89,
      "rarityScore": 75,
      "viewCount": 234,
      "bookmarkCount": 12,
      "createdAt": "2024-11-01T10:00:00Z",
      "updatedAt": "2024-11-15T14:30:00Z"
    },
    "priceHistory": [
      { "price": 42000, "date": "2024-10-01" },
      { "price": 45000, "date": "2024-11-01" }
    ],
    "similarCars": [
      { "id": 2, "make": "Ford", "model": "Mustang", "year": 1968, ... }
    ],
    "upcomingEvents": [
      { "id": 5, "eventName": "Mustang Madness", "date": "2024-12-15", ... }
    ]
  }
}
```

**Errors:**
- 404: Car not found

---

### POST /api/cars (Admin Only)
**Purpose:** Create new car listing

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "make": "Chevrolet",
  "model": "Corvette",
  "year": 1963,
  "price": 125000,
  "vin": "30867S100001",
  "exteriorColor": "Riverside Red",
  "engine": "327 V8",
  "transmission": "4-Speed Manual",
  "description": "Stunning Split-Window Corvette...",
  "imageUrl": "https://...",
  "locationCity": "Miami",
  "locationState": "FL",
  "sourceType": "manual",
  "sourceName": "Admin Import"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "car": { ...created_car_object }
  }
}
```

---

### PUT /api/cars/:id (Admin Only)
**Purpose:** Update car listing

**Request Body:** (partial updates allowed)
```json
{
  "price": 135000,
  "status": "sold",
  "soldDate": "2024-11-16T00:00:00Z"
}
```

**Response:** 200 OK

---

### DELETE /api/cars/:id (Admin Only)
**Purpose:** Delete car listing (soft delete, sets status to 'archived')

**Response:** 200 OK

---

## 4. Event Endpoints

### GET /api/events
**Purpose:** Search and filter events

**Query Parameters:**
```
?page=1
&limit=20
&city=Chicago
&state=IL
&eventType=car_show,concours
&eventCategory=muscle,classic
&dateFrom=2024-11-01
&dateTo=2024-12-31
&search=mustang
&featured=true
&sortBy=start_date
&sortOrder=asc
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": 1,
        "eventName": "Midwest Muscle Car Show",
        "startDate": "2024-12-15T09:00:00Z",
        "endDate": "2024-12-15T17:00:00Z",
        "city": "Chicago",
        "state": "IL",
        "venueName": "Navy Pier",
        "eventType": "car_show",
        "eventCategory": "muscle",
        "entryFeeSpectator": 15,
        "expectedAttendanceMin": 500,
        "expectedAttendanceMax": 1000,
        "latitude": 41.8919,
        "longitude": -87.6051,
        "imageUrl": "https://...",
        "featured": true
      },
      // ... more events
    ]
  },
  "meta": { ... }
}
```

---

### GET /api/events/:id
**Purpose:** Get detailed event information

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "event": {
      "id": 1,
      "eventName": "Midwest Muscle Car Show",
      "eventSlug": "midwest-muscle-car-show-2024",
      "description": "Annual showcase of American muscle...",
      "venueName": "Navy Pier",
      "address": "600 E Grand Ave",
      "city": "Chicago",
      "state": "IL",
      "zipCode": "60611",
      "latitude": 41.8919,
      "longitude": -87.6051,
      "startDate": "2024-12-15T09:00:00Z",
      "endDate": "2024-12-15T17:00:00Z",
      "registrationDeadline": "2024-12-01T23:59:59Z",
      "eventType": "car_show",
      "eventCategory": "muscle",
      "vehicleMakes": ["Ford", "Chevrolet", "Dodge", "Plymouth"],
      "vehicleModels": ["Mustang", "Camaro", "Charger", "Cuda"],
      "primaryVehicleFocus": "category",
      "organizerName": "Midwest Car Club",
      "organizerEmail": "info@midwestcarclub.com",
      "website": "https://midwestcarclub.com",
      "entryFeeSpectator": 15,
      "entryFeeParticipant": 50,
      "capacity": 300,
      "expectedAttendanceMin": 500,
      "expectedAttendanceMax": 1000,
      "features": ["live_music", "food_vendors", "awards_ceremony"],
      "amenities": ["parking", "restrooms", "shade"],
      "judgingClasses": ["Best in Show", "People's Choice", "Best Muscle"],
      "awards": ["Trophies for top 3 in each class"],
      "foodVendors": true,
      "liveMusic": true,
      "imageUrl": "https://...",
      "galleryImages": ["url1", "url2"],
      "viewCount": 456,
      "bookmarkCount": 78,
      "status": "active",
      "featured": true
    },
    "matchingCars": [
      // Cars that match this event's focus
      { "id": 2, "make": "Chevrolet", "model": "Camaro", ... }
    ],
    "nearbyEvents": [
      // Other events in the area
      { "id": 3, "eventName": "Chicago Classic Cars", ... }
    ]
  }
}
```

---

### GET /api/events/map
**Purpose:** Get events with geolocation for map view

**Query Parameters:**
```
?bounds=41.5,-88.5,42.5,-87.5  // SW lat, SW lng, NE lat, NE lng
&eventType=car_show
&dateFrom=2024-11-01
&dateTo=2024-12-31
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": 1,
        "eventName": "Midwest Muscle Car Show",
        "latitude": 41.8919,
        "longitude": -87.6051,
        "startDate": "2024-12-15T09:00:00Z",
        "eventType": "car_show",
        "eventCategory": "muscle",
        "city": "Chicago",
        "state": "IL"
      },
      // ... more events (minimal data for map markers)
    ]
  }
}
```

---

### POST /api/events (Admin Only)
**Purpose:** Create new event

**Request Body:**
```json
{
  "eventName": "Summer Classic Car Festival",
  "startDate": "2025-07-15T09:00:00Z",
  "endDate": "2025-07-15T18:00:00Z",
  "city": "San Diego",
  "state": "CA",
  "venueName": "Balboa Park",
  "eventType": "car_show",
  "eventCategory": "classic",
  "description": "Annual summer celebration...",
  "entryFeeSpectator": 10,
  "entryFeeParticipant": 40
}
```

**Response:** 201 Created

---

## 5. Bookmark Endpoints

### GET /api/bookmarks
**Purpose:** Get user's bookmarks

**Headers:**
```
Authorization: Bearer <user_token>
```

**Query Parameters:**
```
?itemType=car|event|all
&page=1
&limit=20
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "id": 1,
        "itemType": "car",
        "item": {
          "id": 5,
          "make": "Ford",
          "model": "Mustang",
          "year": 1969,
          "price": 52000,
          "imageUrl": "https://..."
        },
        "notes": "My dream car!",
        "createdAt": "2024-11-10T14:00:00Z"
      },
      {
        "id": 2,
        "itemType": "event",
        "item": {
          "id": 8,
          "eventName": "Mustang Week",
          "startDate": "2025-08-01T09:00:00Z",
          "city": "Myrtle Beach",
          "state": "SC"
        },
        "notes": null,
        "createdAt": "2024-11-12T10:30:00Z"
      }
    ]
  },
  "meta": { ... }
}
```

---

### POST /api/bookmarks
**Purpose:** Add bookmark

**Request Body:**
```json
{
  "itemType": "car",
  "itemId": 5,
  "notes": "My dream car!"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "bookmark": {
      "id": 1,
      "itemType": "car",
      "itemId": 5,
      "notes": "My dream car!",
      "createdAt": "2024-11-16T12:00:00Z"
    }
  }
}
```

**Errors:**
- 400: Already bookmarked
- 404: Item not found

---

### DELETE /api/bookmarks/:id
**Purpose:** Remove bookmark

**Response:** 200 OK

---

## 6. AI Chat Endpoints

### POST /api/ai/chat
**Purpose:** Send message to AI assistant (Server-Sent Events)

**Request Body:**
```json
{
  "message": "Find me a blue convertible Mustang under $60k",
  "conversationId": "conv_123abc",  // Optional, for continuing conversation
  "pageContext": {
    "page": "car_search",
    "filters": { "make": "Ford", "model": "Mustang" }
  }
}
```

**Response:** SSE Stream
```
event: token
data: {"chunk": "I"}

event: token
data: {"chunk": " found"}

event: token
data: {"chunk": " 3"}

event: context
data: {"cars": [{"id": 1, ...}, {"id": 2, ...}]}

event: complete
data: {"conversationId": "conv_123abc", "messageId": 456}
```

---

### GET /api/ai/conversations
**Purpose:** Get user's chat history

**Query Parameters:**
```
?page=1
&limit=10
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123abc",
        "title": "Finding blue Mustang",
        "lastMessageAt": "2024-11-16T12:00:00Z",
        "messageCount": 5
      }
    ]
  }
}
```

---

### GET /api/ai/conversations/:id/messages
**Purpose:** Get messages in a conversation

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "role": "user",
        "content": "Find me a blue convertible Mustang under $60k",
        "createdAt": "2024-11-16T12:00:00Z"
      },
      {
        "id": 2,
        "role": "assistant",
        "content": "I found 3 blue Mustang convertibles...",
        "contextCars": [{"id": 1, ...}],
        "createdAt": "2024-11-16T12:00:05Z"
      }
    ]
  }
}
```

---

### POST /api/ai/embed
**Purpose:** Generate embedding for vector search (Admin use)

**Request Body:**
```json
{
  "content": "1967 Ford Mustang Fastback, Candy Apple Red, 289 V8",
  "type": "car"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "embedding": [0.012, -0.045, 0.123, ...],  // 1536-dimensional vector
    "model": "text-embedding-ada-002"
  }
}
```

---

## 7. Admin Endpoints

### GET /api/admin/users
**Purpose:** Get all users (admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```
?page=1
&limit=50
&search=john
&isAdmin=false
&enabled=true
&sortBy=created_at
&sortOrder=desc
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "city": "Chicago",
        "isAdmin": false,
        "enabled": true,
        "emailVerified": true,
        "createdAt": "2024-10-01T10:00:00Z",
        "lastLoginAt": "2024-11-16T08:30:00Z"
      }
    ]
  },
  "meta": { ... }
}
```

---

### POST /api/admin/users
**Purpose:** Create user (admin only)

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "TempPass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "city": "New York",
  "isAdmin": false
}
```

**Response:** 201 Created

---

### PUT /api/admin/users/:id
**Purpose:** Update user (admin only)

**Request Body:**
```json
{
  "enabled": false,
  "isAdmin": true
}
```

**Response:** 200 OK

---

### POST /api/admin/users/:id/reset-password
**Purpose:** Generate password reset for user (admin only)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "temporaryPassword": "TempPass123!",
    "resetLink": "https://app.com/reset?token=abc123"
  }
}
```

---

### GET /api/admin/analytics/dashboard
**Purpose:** Get admin analytics dashboard data

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCars": 5234,
      "totalEvents": 1876,
      "totalUsers": 4521,
      "activeListings": 4987,
      "soldThisMonth": 45
    },
    "recentActivity": {
      "newCarsLast7Days": 123,
      "newUsersLast7Days": 78,
      "bookmarksLast7Days": 456
    },
    "popularSearches": [
      { "query": "mustang", "count": 234 },
      { "query": "corvette", "count": 198 }
    ],
    "topMakes": [
      { "make": "Ford", "count": 876 },
      { "make": "Chevrolet", "count": 765 }
    ],
    "priceTrends": {
      "avgPrice": 67543,
      "avgPriceChange": 2.3  // % change from last month
    }
  }
}
```

---

### GET /api/admin/analytics/pricing
**Purpose:** Get AI-powered pricing analytics

**Query Parameters:**
```
?make=Ford
&model=Mustang
&yearMin=1965
&yearMax=1970
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "marketAnalysis": {
      "totalListings": 234,
      "avgPrice": 52300,
      "medianPrice": 48500,
      "priceRange": { "min": 25000, "max": 125000 }
    },
    "priceTrends": [
      { "date": "2024-01", "avgPrice": 48200 },
      { "date": "2024-02", "avgPrice": 49100 },
      // ... 12 months
    ],
    "investmentGradeDistribution": {
      "A+": 15,
      "A": 45,
      "A-": 68,
      "B+": 89,
      "B": 17
    },
    "aiInsights": {
      "trend": "rising",
      "appreciationForecast": "8.5% over next 12 months",
      "recommendedPricing": {
        "excellent": 58000,
        "good": 48000,
        "fair": 38000
      }
    }
  }
}
```

---

### GET /api/admin/settings
**Purpose:** Get system settings

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "settings": [
      {
        "key": "anthropic_api_key",
        "type": "api_key",
        "isEncrypted": true,
        "value": "sk-ant-***HIDDEN***",
        "updatedAt": "2024-11-01T10:00:00Z"
      },
      {
        "key": "max_scrape_batch_size",
        "type": "scraper",
        "isEncrypted": false,
        "value": "100",
        "description": "Maximum items to scrape per batch"
      }
    ]
  }
}
```

---

### PUT /api/admin/settings/:key
**Purpose:** Update system setting

**Request Body:**
```json
{
  "value": "sk-ant-new-key-here"
}
```

**Response:** 200 OK

---

### GET /api/admin/scrapers
**Purpose:** Get scraping schedules

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": 1,
        "sourceName": "ClassicCars.com",
        "sourceType": "playwright",
        "sourceUrl": "https://classiccars.com/listings",
        "scheduleCron": "0 3 * * *",
        "enabled": true,
        "lastRun": "2024-11-16T03:00:00Z",
        "nextRun": "2024-11-17T03:00:00Z",
        "lastStatus": "success",
        "consecutiveFailures": 0
      }
    ]
  }
}
```

---

### POST /api/admin/scrapers
**Purpose:** Create new scraping schedule

**Request Body:**
```json
{
  "sourceName": "Bring a Trailer",
  "sourceType": "playwright",
  "sourceUrl": "https://bringatrailer.com/auctions",
  "scheduleCron": "0 4 * * *",
  "enabled": true,
  "config": {
    "selectors": {
      "listing": ".auction-item",
      "title": ".listing-title",
      "price": ".current-bid"
    },
    "useStealth": true,
    "useProxy": false
  }
}
```

**Response:** 201 Created

---

### POST /api/admin/scrapers/:id/run
**Purpose:** Manually trigger scraping job

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "logId": 456,
    "status": "running",
    "message": "Scraping job started"
  }
}
```

---

### GET /api/admin/scraping-logs
**Purpose:** Get scraping execution logs

**Query Parameters:**
```
?scheduleId=1
&page=1
&limit=20
&status=success
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 456,
        "scheduleId": 1,
        "status": "success",
        "itemsScraped": 145,
        "itemsInserted": 98,
        "itemsUpdated": 47,
        "itemsFailed": 0,
        "durationSeconds": 320,
        "startedAt": "2024-11-16T03:00:00Z",
        "completedAt": "2024-11-16T03:05:20Z"
      }
    ]
  }
}
```

---

## 8. Vector Search Endpoints

### POST /api/search/vector
**Purpose:** Semantic search using vector similarity

**Request Body:**
```json
{
  "query": "affordable classic muscle cars with V8 engines",
  "type": "car",  // 'car' or 'event'
  "limit": 10,
  "filters": {
    "priceMax": 50000,
    "status": "active"
  }
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": 15,
        "make": "Plymouth",
        "model": "Road Runner",
        "year": 1970,
        "price": 42000,
        "engine": "383 V8",
        "similarity": 0.89,  // Higher = more similar
        "imageUrl": "https://..."
      }
    ]
  }
}
```

---

## 9. Rate Limiting

### Limits by Endpoint Type
- **Public (no auth):** 60 requests/minute
- **Authenticated:** 120 requests/minute
- **Admin:** 300 requests/minute
- **AI Chat:** 10 requests/minute (streaming responses)

### Rate Limit Headers
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

### Error Response (429 Too Many Requests)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 30 seconds.",
    "retryAfter": 30
  }
}
```

---

## 10. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| DATABASE_ERROR | 500 | Database operation failed |
| AI_SERVICE_ERROR | 503 | AI service unavailable |

---

## 11. Webhooks (Future)

### Event Types
- `car.created`
- `car.updated`
- `car.sold`
- `event.created`
- `event.cancelled`
- `user.registered`

### Webhook Payload
```json
{
  "event": "car.sold",
  "timestamp": "2024-11-16T12:00:00Z",
  "data": {
    "carId": 123,
    "soldPrice": 52000,
    "soldDate": "2024-11-16T00:00:00Z"
  }
}
```

---

## 12. Approval Checklist

- [ ] Review all endpoint paths and naming
- [ ] Verify request/response formats
- [ ] Approve authentication strategy
- [ ] Confirm rate limiting rules
- [ ] Validate error handling
- [ ] Review admin permissions
- [ ] Approve vector search implementation

---

**Status:** READY FOR REVIEW
**Next Step:** Await approval before implementation
**Implementation Time:** 2-3 weeks
