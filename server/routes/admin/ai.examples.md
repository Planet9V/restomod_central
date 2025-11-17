# Admin AI Analytics API - Usage Examples

## Mounting the Router

Add to `server/routes.ts`:

```typescript
// At the top with other imports
import adminAiRouter from './routes/admin/ai';

// In registerRoutes function, after other routers
app.use(`${apiPrefix}/admin/ai`, requireAuth, requireAdmin, adminAiRouter);
```

## Authentication Requirements

All endpoints require:
- `requireAuth` - Valid JWT token
- `requireAdmin` - Admin role (isAdmin = true)

SuperAdmin-only endpoints (require `isSuperAdmin`):
- `POST /api/admin/ai/regenerate-embeddings`
- `PUT /api/admin/ai/config`

---

## Endpoint 1: GET /api/admin/ai/analytics

### Description
AI usage analytics with comprehensive metrics and trend data.

### Query Parameters
- `timeframe` (optional): `today` | `week` | `month` | `all` (default: `week`)
- `userId` (optional): Filter by specific user ID

### Example Request
```bash
GET /api/admin/ai/analytics?timeframe=week
Authorization: Bearer <admin-jwt-token>
```

### Example Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalConversations": 1523,
      "totalMessages": 8912,
      "activeUsers": 342,
      "avgConversationLength": 5.8
    },
    "trends": {
      "conversationsByDay": [
        { "date": "2024-11-10", "count": 45 },
        { "date": "2024-11-11", "count": 52 },
        { "date": "2024-11-12", "count": 48 }
      ],
      "messagesByDay": [
        { "date": "2024-11-10", "count": 267 },
        { "date": "2024-11-11", "count": 301 },
        { "date": "2024-11-12", "count": 289 }
      ]
    },
    "topUsers": [
      {
        "userId": 5,
        "username": "john_doe",
        "conversationCount": 23
      },
      {
        "userId": 12,
        "username": "jane_smith",
        "conversationCount": 18
      }
    ],
    "timeframe": "week"
  }
}
```

---

## Endpoint 2: GET /api/admin/ai/conversations

### Description
Retrieve all conversations with pagination and filtering.

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, max 100 (default: 20)
- `userId` (optional): Filter by user ID
- `dateFrom` (optional): ISO date string (e.g., "2024-11-01")
- `dateTo` (optional): ISO date string

### Example Request
```bash
GET /api/admin/ai/conversations?page=1&limit=20&userId=5
Authorization: Bearer <admin-jwt-token>
```

### Example Response
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 1,
        "userId": 5,
        "sessionId": "sess_abc123",
        "title": "Looking for a blue Mustang",
        "pageContext": "car_search",
        "createdAt": "2024-11-17T10:30:00Z",
        "updatedAt": "2024-11-17T10:45:00Z",
        "lastMessageAt": "2024-11-17T10:45:00Z",
        "username": "john_doe",
        "email": "john@example.com",
        "messageCount": 8
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

## Endpoint 3: GET /api/admin/ai/popular-queries

### Description
Most common user queries, grouped by content.

### Example Request
```bash
GET /api/admin/ai/popular-queries
Authorization: Bearer <admin-jwt-token>
```

### Example Response
```json
{
  "success": true,
  "data": {
    "queries": [
      {
        "pattern": "best classic cars for investment",
        "count": 89,
        "avgSimilarity": 1.0
      },
      {
        "pattern": "how to restore a mustang",
        "count": 67,
        "avgSimilarity": 1.0
      },
      {
        "pattern": "classic car events near me",
        "count": 54,
        "avgSimilarity": 1.0
      }
    ],
    "totalUnique": 20
  }
}
```

---

## Endpoint 4: GET /api/admin/ai/context-stats

### Description
Vector search effectiveness metrics and context usage statistics.

### Example Request
```bash
GET /api/admin/ai/context-stats
Authorization: Bearer <admin-jwt-token>
```

### Example Response
```json
{
  "success": true,
  "data": {
    "searchesPerformed": 8912,
    "messagesWithCars": 5234,
    "messagesWithEvents": 2145,
    "avgCarsPerMessage": "3.42",
    "avgEventsPerMessage": "2.18",
    "contextUsageRate": "82.8%"
  }
}
```

---

## Endpoint 5: POST /api/admin/ai/regenerate-embeddings

### Description
Bulk regenerate vector embeddings for cars and/or events (SuperAdmin only).
Runs as background job.

### Request Body
```json
{
  "type": "cars" | "events" | "all",
  "force": true | false  // Optional, default: false
}
```

### Example Request
```bash
POST /api/admin/ai/regenerate-embeddings
Authorization: Bearer <superadmin-jwt-token>
Content-Type: application/json

{
  "type": "all",
  "force": true
}
```

### Example Response
```json
{
  "success": true,
  "data": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "type": "all",
    "force": true,
    "status": "started",
    "message": "Embedding regeneration job started in background"
  }
}
```

### Background Job Logs
```
🚀 Job 550e8400-e29b-41d4-a716-446655440000: Starting embedding regeneration...
🚗 Job 550e8400-e29b-41d4-a716-446655440000: Processing car embeddings...
✅ Job 550e8400-e29b-41d4-a716-446655440000: Processed 625 car embeddings
📅 Job 550e8400-e29b-41d4-a716-446655440000: Processing event embeddings...
✅ Job 550e8400-e29b-41d4-a716-446655440000: Processed 193 event embeddings
✅ Job 550e8400-e29b-41d4-a716-446655440000: Completed - 625 cars, 193 events
```

---

## Endpoint 6: GET /api/admin/ai/config

### Description
Get current AI configuration settings.

### Example Request
```bash
GET /api/admin/ai/config
Authorization: Bearer <admin-jwt-token>
```

### Example Response
```json
{
  "success": true,
  "data": {
    "config": {
      "model": "claude-3-5-sonnet-20241022",
      "maxTokens": 1024,
      "temperature": 1.0,
      "systemPrompt": "You are K.I.T.T. (Knowledge Intelligence for Timeless Transportation), an AI assistant for a luxury classic car marketplace.",
      "vectorSearchThreshold": 0.7,
      "contextLimit": 5
    }
  }
}
```

---

## Endpoint 7: PUT /api/admin/ai/config

### Description
Update AI configuration settings (SuperAdmin only).

### Request Body
```json
{
  "model": "string",              // Optional: Claude model ID
  "maxTokens": number,            // Optional: 256-4096
  "temperature": number,          // Optional: 0-2
  "vectorSearchThreshold": number, // Optional: 0-1
  "contextLimit": number          // Optional: 1-20
}
```

### Example Request
```bash
PUT /api/admin/ai/config
Authorization: Bearer <superadmin-jwt-token>
Content-Type: application/json

{
  "maxTokens": 2000,
  "temperature": 0.8,
  "vectorSearchThreshold": 0.75,
  "contextLimit": 7
}
```

### Example Response
```json
{
  "success": true,
  "data": {
    "config": {
      "model": "claude-3-5-sonnet-20241022",
      "maxTokens": 2000,
      "temperature": 0.8,
      "systemPrompt": "You are K.I.T.T. (Knowledge Intelligence for Timeless Transportation), an AI assistant for a luxury classic car marketplace.",
      "vectorSearchThreshold": 0.75,
      "contextLimit": 7
    },
    "message": "AI configuration updated successfully"
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "NOT_AUTHENTICATED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden (Not Admin)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

### 403 Forbidden (Not SuperAdmin)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Superadmin access required"
  }
}
```

### 400 Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "details": [
      {
        "code": "invalid_enum_value",
        "path": ["timeframe"],
        "message": "Invalid enum value. Expected 'today' | 'week' | 'month' | 'all'"
      }
    ]
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Failed to fetch AI analytics"
  }
}
```

---

## Testing with curl

### Get Analytics (Week)
```bash
curl -X GET \
  'http://localhost:5000/api/admin/ai/analytics?timeframe=week' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

### Get All Conversations
```bash
curl -X GET \
  'http://localhost:5000/api/admin/ai/conversations?page=1&limit=20' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

### Regenerate Embeddings
```bash
curl -X POST \
  'http://localhost:5000/api/admin/ai/regenerate-embeddings' \
  -H 'Authorization: Bearer YOUR_SUPERADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "cars",
    "force": false
  }'
```

### Update AI Config
```bash
curl -X PUT \
  'http://localhost:5000/api/admin/ai/config' \
  -H 'Authorization: Bearer YOUR_SUPERADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "maxTokens": 2000,
    "temperature": 0.8
  }'
```

---

## Analytics Queries Used

### Conversations by Day
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as count
FROM ai_chat_conversations
WHERE created_at >= $startDate
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) ASC
```

### Average Messages per Conversation
```sql
SELECT AVG(message_count) as avg_count
FROM (
  SELECT conversation_id, COUNT(*) as message_count
  FROM ai_chat_messages
  GROUP BY conversation_id
) as counts
```

### Active Users Count
```sql
SELECT COUNT(DISTINCT user_id)
FROM ai_chat_conversations
WHERE created_at >= $thirtyDaysAgo
```

### Top Users by Conversation Count
```sql
SELECT
  c.user_id,
  u.username,
  COUNT(*) as conversation_count
FROM ai_chat_conversations c
INNER JOIN users u ON c.user_id = u.id
WHERE c.created_at >= $startDate
GROUP BY c.user_id, u.username
ORDER BY conversation_count DESC
LIMIT 10
```

### Context Usage Statistics
```sql
SELECT
  COUNT(*) FILTER (WHERE context_cars IS NOT NULL) as messages_with_cars,
  COUNT(*) FILTER (WHERE context_events IS NOT NULL) as messages_with_events,
  COUNT(*) as total_messages
FROM ai_chat_messages
WHERE role = 'assistant'
```

---

## Admin Action Logging

All admin actions are logged to console with user identification:

- Analytics queries: `📊 Admin Analytics: Fetching AI analytics for timeframe: week`
- Conversation queries: `📋 Admin: Fetching conversations - page 1, limit 20`
- Config updates: `⚙️ SuperAdmin: Updating AI configuration by jims67mustang@gmail.com`
- Embedding jobs: `🔄 SuperAdmin: Starting embedding regeneration - type: all, force: true`
