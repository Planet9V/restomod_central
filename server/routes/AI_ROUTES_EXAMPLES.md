# AI Chat Routes - API Examples

**File:** `/home/user/restomod_central/server/routes/ai.ts`
**Spec:** `SPEC_04_AI_CHAT_SYSTEM.md`
**Phase:** 3.3 - API Routes Implementation

---

## Endpoints Implemented

### 1. POST /api/ai/chat - SSE Streaming Chat

**Authentication:** Required (Bearer token)
**Rate Limit:** 20 requests per minute

#### Request

```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about classic Mustangs",
    "conversationId": 5,
    "pageContext": {
      "page": "car_search",
      "filters": { "make": "Ford", "priceMax": 60000 },
      "currentItemId": 123,
      "currentItemType": "car"
    }
  }'
```

#### Response (Server-Sent Events Stream)

```
data: {"type":"start","conversationId":5}

data: {"type":"content","text":"This is "}

data: {"type":"content","text":"a mock "}

data: {"type":"content","text":"response to: "}

data: {"type":"content","text":"\"Tell me about "}

data: {"type":"content","text":"classic Mustangs\"..."}

data: {"type":"done","conversationId":5,"messageId":42}
```

#### SSE Event Types

- **start** - Initial event with conversation ID
- **content** - Streaming text chunks
- **done** - Completion event with message ID
- **error** - Error event with error details

#### Validation Errors

```json
{
  "type": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "path": ["message"],
        "message": "Message cannot be empty"
      }
    ]
  }
}
```

---

### 2. GET /api/ai/conversations - List Conversations

**Authentication:** Required
**Rate Limit:** None (covered by global rate limit)

#### Request

```bash
curl -X GET "http://localhost:5000/api/ai/conversations?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

#### Query Parameters

| Parameter | Type   | Default | Description              |
|-----------|--------|---------|--------------------------|
| page      | number | 1       | Page number (1-indexed)  |
| limit     | number | 20      | Results per page (1-100) |

#### Response

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 5,
        "title": "Classic Mustangs Discussion",
        "pageContext": "car_search",
        "createdAt": "2024-11-17T10:00:00Z",
        "updatedAt": "2024-11-17T11:30:00Z",
        "lastMessageAt": "2024-11-17T11:30:00Z",
        "messageCount": 12,
        "lastMessage": {
          "role": "assistant",
          "content": "The 1967 Mustang Fastback is one of the most sought-after...",
          "createdAt": "2024-11-17T11:30:00Z"
        }
      },
      {
        "id": 4,
        "title": "Car show events in Michigan",
        "pageContext": "event_map",
        "createdAt": "2024-11-16T15:20:00Z",
        "updatedAt": "2024-11-16T16:45:00Z",
        "lastMessageAt": "2024-11-16T16:45:00Z",
        "messageCount": 8,
        "lastMessage": {
          "role": "user",
          "content": "Thanks for the recommendations!",
          "createdAt": "2024-11-16T16:45:00Z"
        }
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 3. GET /api/ai/conversations/:id - Get Conversation Details

**Authentication:** Required
**Ownership:** Verified

#### Request

```bash
curl -X GET http://localhost:5000/api/ai/conversations/5 \
  -H "Authorization: Bearer <token>"
```

#### Response

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": 5,
      "title": "Classic Mustangs Discussion",
      "pageContext": "car_search",
      "createdAt": "2024-11-17T10:00:00Z",
      "updatedAt": "2024-11-17T11:30:00Z",
      "lastMessageAt": "2024-11-17T11:30:00Z",
      "messages": [
        {
          "id": 40,
          "role": "user",
          "content": "Tell me about classic Mustangs",
          "model": null,
          "tokensUsed": null,
          "responseTimeMs": null,
          "createdAt": "2024-11-17T10:00:00Z"
        },
        {
          "id": 41,
          "role": "assistant",
          "content": "Classic Mustangs, especially those from 1965-1973...",
          "model": "claude-3-5-sonnet-20241022",
          "tokensUsed": 450,
          "responseTimeMs": 1200,
          "createdAt": "2024-11-17T10:00:15Z"
        },
        {
          "id": 42,
          "role": "user",
          "content": "What about the 1967 Fastback?",
          "model": null,
          "tokensUsed": null,
          "responseTimeMs": null,
          "createdAt": "2024-11-17T11:30:00Z"
        }
      ]
    }
  }
}
```

#### Error Responses

**Not Found (404)**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Conversation not found"
  }
}
```

**Forbidden (403)**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this conversation"
  }
}
```

---

### 4. POST /api/ai/conversations - Create Conversation

**Authentication:** Required

#### Request

```bash
curl -X POST http://localhost:5000/api/ai/conversations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New car search discussion",
    "pageContext": "homepage"
  }'
```

#### Request Body (Optional Fields)

```json
{
  "title": "New conversation title",      // Optional (1-200 chars)
  "pageContext": "car_search"             // Optional (max 100 chars)
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": 6,
      "title": "New car search discussion",
      "pageContext": "homepage",
      "sessionId": "a3d5f6e7-1234-5678-90ab-cdef12345678",
      "createdAt": "2024-11-17T12:00:00Z",
      "updatedAt": "2024-11-17T12:00:00Z",
      "lastMessageAt": "2024-11-17T12:00:00Z"
    }
  }
}
```

---

### 5. DELETE /api/ai/conversations/:id - Delete Conversation

**Authentication:** Required
**Ownership:** Verified

#### Request

```bash
curl -X DELETE http://localhost:5000/api/ai/conversations/5 \
  -H "Authorization: Bearer <token>"
```

#### Response

```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

#### Notes

- Currently performs **hard delete** (conversation and all messages removed)
- Cascade delete automatically removes all associated messages
- Schema does not have `deletedAt` field for soft delete
- If soft delete is needed, schema should be updated with `deletedAt` timestamp

---

### 6. POST /api/ai/search - Semantic Search

**Authentication:** Optional (better results when authenticated)
**Rate Limit:** 50 requests per minute (searchRateLimit)

#### Request

```bash
curl -X POST http://localhost:5000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "blue muscle cars under 50k",
    "type": "both",
    "limit": 10,
    "filters": {
      "priceMax": 50000,
      "category": "muscle_cars"
    }
  }'
```

#### Request Body

```json
{
  "query": "blue muscle cars under 50k",   // Required (1-500 chars)
  "type": "cars",                          // Optional: 'cars' | 'events' | 'both' (default: 'both')
  "limit": 10,                             // Optional: 1-50 (default: 10)
  "filters": {                             // Optional
    "priceMin": 20000,
    "priceMax": 50000,
    "make": "Ford",
    "yearMin": 1965,
    "yearMax": 1975
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "car",
        "id": 1,
        "similarity": 0.92,
        "data": {
          "year": 1967,
          "make": "Ford",
          "model": "Mustang",
          "price": 45000,
          "description": "Classic Mustang Fastback in excellent condition",
          "imageUrl": "/images/mustang-1967.jpg"
        }
      },
      {
        "type": "event",
        "id": 5,
        "similarity": 0.87,
        "data": {
          "eventName": "Classic Car Show",
          "city": "Detroit",
          "state": "MI",
          "startDate": "2024-06-15",
          "description": "Annual classic car showcase featuring vintage Mustangs"
        }
      }
    ],
    "query": "blue muscle cars under 50k",
    "type": "both",
    "limit": 10
  }
}
```

---

## Error Handling

### Common Error Codes

| Code              | HTTP Status | Description                           |
|-------------------|-------------|---------------------------------------|
| VALIDATION_ERROR  | 400         | Invalid request body or parameters    |
| NO_TOKEN          | 401         | Missing authentication token          |
| INVALID_TOKEN     | 401         | Invalid or expired token              |
| FORBIDDEN         | 403         | User doesn't own the resource         |
| NOT_FOUND         | 404         | Resource not found                    |
| RATE_LIMIT_EXCEEDED | 429       | Too many requests                     |
| CHAT_ERROR        | 500         | Chat processing failed                |
| SERVER_ERROR      | 500         | Internal server error                 |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "path": ["message"],
        "message": "Message cannot be empty"
      }
    ]
  }
}
```

---

## Rate Limiting

### Rate Limit Headers

All endpoints return rate limit headers:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1700000000
```

### Rate Limit Exceeded Response

```
HTTP/1.1 429 Too Many Requests
Retry-After: 45

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 45
  }
}
```

### Rate Limits by Endpoint

| Endpoint           | Rate Limit         | Tracked By     |
|--------------------|--------------------|----------------|
| POST /chat         | 20 req/min         | User ID or IP  |
| POST /search       | 50 req/min         | User ID or IP  |
| GET /conversations | Global tier-based  | User ID or IP  |
| Others             | Global tier-based  | User ID or IP  |

**Global Tier Limits:**
- Anonymous: 100 req/min
- Authenticated: 500 req/min
- Admin: 1000 req/min

---

## Integration Notes

### Chat Service Integration (Phase 3.1)

```typescript
// TODO: Replace mock implementation with actual chatService
const stream = await chatService.handleChatMessage(
  message,
  conversationId,
  userId,
  pageContext
);
```

### Vector Search Integration (Phase 3.2)

```typescript
// TODO: Replace mock implementation with actual vectorSearchService
const results = await vectorSearch.semanticSearch(
  query,
  type,
  limit,
  filters,
  userId
);
```

---

## Testing Examples

### Test SSE Streaming with curl

```bash
#!/bin/bash
TOKEN="your-jwt-token"

curl -N -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the best investment-grade Mustangs?",
    "pageContext": {
      "page": "car_search"
    }
  }'
```

### Test with JavaScript EventSource

```javascript
// Frontend SSE client example
async function sendChatMessage(message, conversationId) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversationId }),
  });

  // Note: EventSource doesn't support POST, so we use fetch + EventSource workaround
  // In production, consider using a library like @microsoft/fetch-event-source
}
```

---

## Database Schema

### Conversations Table

```sql
CREATE TABLE ai_chat_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  page_context VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Messages Table

```sql
CREATE TABLE ai_chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  model VARCHAR(50),
  tokens_used INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_chat_messages_conversation ON ai_chat_messages(conversation_id, created_at);
```

---

## Next Steps

1. **Phase 3.1**: Implement chat service (`server/services/ai/chatService.ts`)
   - Anthropic Claude integration
   - Message streaming
   - Conversation management
   - Context building

2. **Phase 3.2**: Implement vector search service (`server/services/ai/vectorSearchService.ts`)
   - OpenAI embeddings
   - pgvector queries
   - Semantic search
   - Result ranking

3. **Frontend Integration**: Build React chat components
   - SSE event handling
   - Message UI
   - Streaming text display
   - Conversation management

---

**Implementation Status:** ✅ Complete (Phase 3.3)
**Last Updated:** 2024-11-17
**Author:** API Engineer - Chat Routes Specialist
