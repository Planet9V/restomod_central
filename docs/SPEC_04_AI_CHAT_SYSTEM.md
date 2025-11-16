# AI Chat System Specification v1.0
## K.I.T.T. (Knowledge Intelligence for Timeless Transportation)

**Version:** 1.0
**Last Updated:** 2025-11-16
**Status:** DRAFT - Awaiting Approval

---

## 1. System Overview

### Purpose
Provide an intelligent AI assistant accessible on every page that:
- Answers questions about cars and events using vector search
- Provides market insights and pricing analysis
- Helps users find vehicles matching their preferences
- Offers personalized recommendations based on browsing history
- Streams responses in real-time for better UX

### Key Features
1. **Global Accessibility** - Floating chat widget on all pages
2. **Vector-Powered Search** - Semantic understanding using pgvector
3. **Context Awareness** - Knows what page user is on
4. **Streaming Responses** - SSE for real-time token delivery
5. **Multi-turn Conversations** - Maintains conversation history
6. **Admin Analytics** - Specialized insights for administrators

---

## 2. Architecture

### System Components
```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│  ┌───────────────────────────────────────────────────┐ │
│  │          AI Chat Widget Component                │ │
│  │  - Message display                               │ │
│  │  - Input handling                                │ │
│  │  - SSE stream reader                             │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↓ WebSocket/SSE
┌─────────────────────────────────────────────────────────┐
│                  Backend (Express + Node.js)            │
│  ┌───────────────────────────────────────────────────┐ │
│  │           Chat API Endpoint                      │ │
│  │  POST /api/ai/chat (SSE stream)                  │ │
│  └────────────────┬────────────────────────────────┘ │
│                   ↓                                     │
│  ┌───────────────────────────────────────────────────┐ │
│  │        Chat Service (Business Logic)             │ │
│  │  1. Parse user message                           │ │
│  │  2. Generate embedding                           │ │
│  │  3. Vector search for context                    │ │
│  │  4. Build enriched prompt                        │ │
│  │  5. Stream Claude response                       │ │
│  └────────────────┬────────────────────────────────┘ │
│                   ↓                                     │
│  ┌────────────────────────┬──────────────────────────┐ │
│  │  Embedding Service     │  Vector Search Service   │ │
│  │  (OpenAI ada-002)      │  (PostgreSQL pgvector)   │ │
│  └────────────────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database + pgvector             │
│  - cars_for_sale (with embeddings)                     │
│  - car_show_events (with embeddings)                   │
│  - ai_chat_conversations                               │
│  - ai_chat_messages                                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│               External AI Services                      │
│  - Anthropic Claude (chat completions)                 │
│  - OpenAI (embeddings)                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Embedding Generation

### 3.1 Model Selection
**Primary:** OpenAI `text-embedding-ada-002`
- **Dimensions:** 1536
- **Cost:** $0.0001 per 1K tokens
- **Performance:** 99% accuracy for automotive content

**Alternative:** OpenAI `text-embedding-3-small`
- **Dimensions:** 1536 (configurable)
- **Cost:** $0.00002 per 1K tokens (5x cheaper)
- **Performance:** Similar to ada-002

### 3.2 Content to Embed

**For Cars:**
```typescript
function generateCarEmbedding(car: CarForSale): string {
  // Combine key fields for rich semantic representation
  const content = [
    `${car.year} ${car.make} ${car.model}`,
    `Price: $${car.price}`,
    `Color: ${car.exteriorColor}`,
    `Engine: ${car.engine}`,
    `Transmission: ${car.transmission}`,
    car.title,
    car.description,
    `Investment Grade: ${car.investmentGrade}`,
    `Category: ${car.category}`,
    car.features ? `Features: ${Object.keys(car.features).filter(k => car.features[k]).join(', ')}` : '',
    car.modifications ? `Modifications: ${car.modifications.join(', ')}` : '',
  ].filter(Boolean).join('. ');

  return content;
}
```

**For Events:**
```typescript
function generateEventEmbedding(event: CarShowEvent): string {
  const content = [
    event.eventName,
    `${event.city}, ${event.state}`,
    `Date: ${new Date(event.startDate).toLocaleDateString()}`,
    `Type: ${event.eventType}`,
    `Category: ${event.eventCategory}`,
    event.description,
    event.vehicleMakes ? `Makes: ${event.vehicleMakes.join(', ')}` : '',
    event.vehicleModels ? `Models: ${event.vehicleModels.join(', ')}` : '',
    `Attendance: ${event.expectedAttendanceMin}-${event.expectedAttendanceMax}`,
  ].filter(Boolean).join('. ');

  return content;
}
```

### 3.3 Embedding Service
```typescript
// server/services/ai/embeddingService.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.substring(0, 8000), // Limit to ~8K tokens
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  // Batch up to 2048 items at once for efficiency
  const BATCH_SIZE = 100;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: batch,
    });

    results.push(...response.data.map(d => d.embedding));
  }

  return results;
}
```

---

## 4. Vector Search

### 4.1 Search Query
```sql
-- Find cars semantically similar to user query
SELECT
  id,
  make,
  model,
  year,
  price,
  image_url,
  description,
  investment_grade,
  1 - (embedding <=> $1::vector) AS similarity
FROM cars_for_sale
WHERE status = 'active'
  AND (1 - (embedding <=> $1::vector)) > 0.7  -- Similarity threshold
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

### 4.2 Vector Search Service
```typescript
// server/services/ai/vectorSearchService.ts

import { db } from '../../db';
import { sql } from 'drizzle-orm';

interface VectorSearchOptions {
  type: 'car' | 'event';
  limit?: number;
  similarityThreshold?: number;
  filters?: Record<string, any>;
}

export async function vectorSearch(
  queryEmbedding: number[],
  options: VectorSearchOptions
) {
  const {
    type,
    limit = 10,
    similarityThreshold = 0.7,
    filters = {},
  } = options;

  if (type === 'car') {
    return await searchCars(queryEmbedding, limit, similarityThreshold, filters);
  } else {
    return await searchEvents(queryEmbedding, limit, similarityThreshold, filters);
  }
}

async function searchCars(
  embedding: number[],
  limit: number,
  threshold: number,
  filters: Record<string, any>
) {
  // Build WHERE clause from filters
  const conditions = [`status = 'active'`];

  if (filters.priceMin) {
    conditions.push(`price >= ${filters.priceMin}`);
  }
  if (filters.priceMax) {
    conditions.push(`price <= ${filters.priceMax}`);
  }
  if (filters.make) {
    conditions.push(`make = '${filters.make}'`);
  }
  if (filters.yearMin) {
    conditions.push(`year >= ${filters.yearMin}`);
  }
  if (filters.yearMax) {
    conditions.push(`year <= ${filters.yearMax}`);
  }

  const whereClause = conditions.join(' AND ');

  const query = sql`
    SELECT
      id,
      make,
      model,
      year,
      price,
      image_url,
      exterior_color,
      engine,
      transmission,
      description,
      investment_grade,
      location_city,
      location_state,
      1 - (embedding <=> ${sql.raw(`'[${embedding.join(',')}]'::vector`)}) AS similarity
    FROM cars_for_sale
    WHERE ${sql.raw(whereClause)}
      AND (1 - (embedding <=> ${sql.raw(`'[${embedding.join(',')}]'::vector`)})) > ${threshold}
    ORDER BY embedding <=> ${sql.raw(`'[${embedding.join(',')}]'::vector`)}
    LIMIT ${limit}
  `;

  return await db.execute(query);
}

async function searchEvents(
  embedding: number[],
  limit: number,
  threshold: number,
  filters: Record<string, any>
) {
  const conditions = [`status = 'active'`, `start_date > NOW()`];

  if (filters.city) {
    conditions.push(`city = '${filters.city}'`);
  }
  if (filters.state) {
    conditions.push(`state = '${filters.state}'`);
  }
  if (filters.eventType) {
    conditions.push(`event_type = '${filters.eventType}'`);
  }

  const whereClause = conditions.join(' AND ');

  const query = sql`
    SELECT
      id,
      event_name,
      city,
      state,
      start_date,
      end_date,
      event_type,
      event_category,
      image_url,
      venue_name,
      description,
      1 - (embedding <=> ${sql.raw(`'[${embedding.join(',')}]'::vector`)}) AS similarity
    FROM car_show_events
    WHERE ${sql.raw(whereClause)}
      AND (1 - (embedding <=> ${sql.raw(`'[${embedding.join(',')}]'::vector`)})) > ${threshold}
    ORDER BY embedding <=> ${sql.raw(`'[${embedding.join(',')}]'::vector`)}
    LIMIT ${limit}
  `;

  return await db.execute(query);
}
```

---

## 5. Chat Service

### 5.1 Main Chat Handler
```typescript
// server/services/ai/chatService.ts

import Anthropic from '@anthropic-ai/sdk';
import { generateEmbedding } from './embeddingService';
import { vectorSearch } from './vectorSearchService';
import { db } from '../../db';
import { aiChatConversations, aiChatMessages } from '../../db/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatRequest {
  message: string;
  conversationId?: string;
  pageContext?: {
    page: string;
    filters?: Record<string, any>;
    currentItemId?: number;
    currentItemType?: 'car' | 'event';
  };
  userId?: number;
}

export async function handleChatMessage(request: ChatRequest) {
  const { message, conversationId, pageContext, userId } = request;

  // 1. Get or create conversation
  const conversation = await getOrCreateConversation(conversationId, userId, pageContext);

  // 2. Save user message
  await saveMessage(conversation.id, 'user', message);

  // 3. Generate embedding for semantic search
  const queryEmbedding = await generateEmbedding(message);

  // 4. Vector search for relevant context
  const contextCars = await vectorSearch(queryEmbedding, {
    type: 'car',
    limit: 5,
    similarityThreshold: 0.75,
    filters: pageContext?.filters || {},
  });

  const contextEvents = await vectorSearch(queryEmbedding, {
    type: 'event',
    limit: 3,
    similarityThreshold: 0.75,
  });

  // 5. Build enriched prompt
  const systemPrompt = buildSystemPrompt(contextCars, contextEvents, pageContext);

  // 6. Get conversation history
  const history = await getConversationHistory(conversation.id);

  // 7. Stream Claude response
  const stream = await anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      ...history,
      { role: 'user', content: message }
    ],
  });

  return {
    stream,
    conversationId: conversation.id,
    contextCars,
    contextEvents,
  };
}
```

### 5.2 System Prompt Builder
```typescript
function buildSystemPrompt(
  contextCars: any[],
  contextEvents: any[],
  pageContext?: any
): string {
  const basePerspective = `You are K.I.T.T. (Knowledge Intelligence for Timeless Transportation), an AI assistant for a luxury classic car marketplace. You help users discover investment-grade classic cars, find automotive events, and provide market insights.

Your personality:
- Sophisticated and knowledgeable about automotive history
- Enthusiastic about classic cars and restoration
- Helpful and precise with pricing and investment analysis
- Conversational but professional

Guidelines:
- Always cite specific cars or events when making recommendations
- Provide investment grades and appreciation rates when discussing pricing
- Be honest about market trends (rising, stable, declining)
- Suggest events where users can see similar vehicles
- Use natural, engaging language (not overly technical unless asked)
`;

  // Add page context
  let pageInfo = '';
  if (pageContext?.page) {
    pageInfo = `\n\nCurrent page context: The user is on the "${pageContext.page}" page.`;

    if (pageContext.currentItemType === 'car' && pageContext.currentItemId) {
      pageInfo += ` They are viewing a specific car (ID: ${pageContext.currentItemId}).`;
    } else if (pageContext.currentItemType === 'event' && pageContext.currentItemId) {
      pageInfo += ` They are viewing a specific event (ID: ${pageContext.currentItemId}).`;
    }
  }

  // Add relevant cars from vector search
  let carsContext = '';
  if (contextCars.length > 0) {
    carsContext = `\n\nRelevant vehicles from our inventory:\n`;
    contextCars.forEach((car, idx) => {
      carsContext += `
${idx + 1}. ${car.year} ${car.make} ${car.model}
   - Price: $${car.price.toLocaleString()}
   - Investment Grade: ${car.investment_grade}
   - Location: ${car.location_city}, ${car.location_state}
   - Engine: ${car.engine}
   - Transmission: ${car.transmission}
   - Description: ${car.description?.substring(0, 200)}...
   - Similarity: ${(car.similarity * 100).toFixed(1)}%
`;
    });
  }

  // Add relevant events
  let eventsContext = '';
  if (contextEvents.length > 0) {
    eventsContext = `\n\nUpcoming relevant events:\n`;
    contextEvents.forEach((event, idx) => {
      const eventDate = new Date(event.start_date);
      eventsContext += `
${idx + 1}. ${event.event_name}
   - Date: ${eventDate.toLocaleDateString()}
   - Location: ${event.city}, ${event.state}
   - Type: ${event.event_type}
   - Venue: ${event.venue_name}
   - Category: ${event.event_category}
   - Description: ${event.description?.substring(0, 200)}...
`;
    });
  }

  return basePerspective + pageInfo + carsContext + eventsContext;
}
```

---

## 6. Streaming Response (SSE)

### 6.1 API Endpoint
```typescript
// server/api/ai/chat.ts

import express from 'express';
import { handleChatMessage } from '../../services/ai/chatService';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, conversationId, pageContext } = req.body;
    const userId = req.user?.id;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Handle chat and get stream
    const { stream, conversationId: newConvId, contextCars, contextEvents } =
      await handleChatMessage({ message, conversationId, pageContext, userId });

    // Send conversation ID first
    res.write(`event: conversation\ndata: ${JSON.stringify({ conversationId: newConvId })}\n\n`);

    // Send context (cars/events found)
    res.write(`event: context\ndata: ${JSON.stringify({
      cars: contextCars.map(c => ({ id: c.id, make: c.make, model: c.model, year: c.year, price: c.price })),
      events: contextEvents.map(e => ({ id: e.id, name: e.event_name, date: e.start_date }))
    })}\n\n`);

    let fullResponse = '';

    // Stream tokens
    stream.on('text', (text) => {
      fullResponse += text;
      res.write(`event: token\ndata: ${JSON.stringify({ chunk: text })}\n\n`);
    });

    stream.on('end', async () => {
      // Save assistant message
      const messageId = await saveMessage(newConvId, 'assistant', fullResponse, {
        model: 'claude-3-5-sonnet-20241022',
        contextCars,
        contextEvents,
      });

      res.write(`event: complete\ndata: ${JSON.stringify({ messageId })}\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### 6.2 Frontend SSE Handler
```typescript
// client/src/services/aiChatService.ts

export async function sendChatMessage(
  message: string,
  conversationId?: string,
  pageContext?: any
): Promise<EventSource> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ message, conversationId, pageContext }),
  });

  // Create EventSource for SSE
  const eventSource = new EventSource(response.url);

  return eventSource;
}

// Usage in component
function AIChatWidget() {
  const handleSend = async (message: string) => {
    const eventSource = await sendChatMessage(message, conversationId, {
      page: 'car_search',
      filters: currentFilters,
    });

    let responseText = '';

    eventSource.addEventListener('token', (event) => {
      const data = JSON.parse(event.data);
      responseText += data.chunk;
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: responseText }
      ]);
    });

    eventSource.addEventListener('context', (event) => {
      const data = JSON.parse(event.data);
      setContextCars(data.cars);
      setContextEvents(data.events);
    });

    eventSource.addEventListener('complete', (event) => {
      eventSource.close();
    });

    eventSource.addEventListener('error', (event) => {
      console.error('SSE error:', event);
      eventSource.close();
    });
  };
}
```

---

## 7. Admin Analytics Features

### 7.1 Pricing Analysis
```typescript
export async function getPricingAnalysis(make: string, model: string, yearRange?: [number, number]) {
  const prompt = `Analyze the current market for ${make} ${model} ${yearRange ? `from ${yearRange[0]} to ${yearRange[1]}` : ''}.

Based on our inventory data, provide:
1. Average price and price range
2. Investment grade distribution
3. Price trend (rising/stable/declining) with percentage
4. Recommended pricing for Excellent, Good, and Fair condition
5. Key factors affecting value
6. 12-month appreciation forecast

Return JSON format.`;

  const systemPrompt = await buildPricingSystemPrompt(make, model, yearRange);

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(response.content[0].text);
}

async function buildPricingSystemPrompt(make: string, model: string, yearRange?: [number, number]) {
  // Fetch all matching cars from database
  const cars = await db.select()
    .from(carsForSale)
    .where(
      and(
        eq(carsForSale.make, make),
        eq(carsForSale.model, model),
        yearRange ? gte(carsForSale.year, yearRange[0]) : undefined,
        yearRange ? lte(carsForSale.year, yearRange[1]) : undefined,
      )
    );

  // Fetch price history
  const priceHistory = await db.select()
    .from(priceHistoryTable)
    .innerJoin(carsForSale, eq(priceHistoryTable.vehicleId, carsForSale.id))
    .where(
      and(
        eq(carsForSale.make, make),
        eq(carsForSale.model, model)
      )
    )
    .orderBy(desc(priceHistoryTable.recordedDate));

  const carData = cars.map(c => ({
    year: c.year,
    price: c.price,
    investmentGrade: c.investmentGrade,
    condition: c.condition,
    mileage: c.mileage,
  }));

  return `You are an expert automotive market analyst. Analyze the following data for ${make} ${model}:

Current Inventory (${cars.length} vehicles):
${JSON.stringify(carData, null, 2)}

Price History:
${JSON.stringify(priceHistory, null, 2)}

Provide accurate, data-driven insights in JSON format.`;
}
```

### 7.2 Market Trend Detection
```typescript
export async function detectMarketAnomalies() {
  // Find vehicles with unusual pricing (>20% variance from avg)
  const anomalies = await db.execute(sql`
    WITH avg_prices AS (
      SELECT
        make,
        model,
        year,
        AVG(CAST(price AS NUMERIC)) as avg_price,
        STDDEV(CAST(price AS NUMERIC)) as stddev_price
      FROM cars_for_sale
      WHERE status = 'active' AND price IS NOT NULL
      GROUP BY make, model, year
    )
    SELECT
      c.*,
      a.avg_price,
      ABS(CAST(c.price AS NUMERIC) - a.avg_price) / a.avg_price * 100 as variance_percent
    FROM cars_for_sale c
    JOIN avg_prices a ON c.make = a.make AND c.model = a.model AND c.year = a.year
    WHERE ABS(CAST(c.price AS NUMERIC) - a.avg_price) / a.avg_price > 0.2
    ORDER BY variance_percent DESC
    LIMIT 20
  `);

  return anomalies;
}
```

---

## 8. Context-Aware Features

### 8.1 Page-Specific Behavior

**Homepage:**
- Suggest featured vehicles
- Highlight upcoming events
- Offer general market insights

**Car Search Page:**
- Help refine search filters
- Explain investment grades
- Compare similar vehicles

**Car Detail Page:**
- Answer specific questions about THIS car
- Find similar vehicles
- Suggest events where this car might appear

**Event Map Page:**
- Find events by location
- Filter by vehicle type/make
- Plan event itineraries

**Admin Dashboard:**
- Provide pricing recommendations
- Identify undervalued listings
- Suggest optimal pricing strategies

### 8.2 Context Detection
```typescript
function detectUserIntent(message: string, pageContext: any): string {
  const lowerMessage = message.toLowerCase();

  // Price-related queries
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('worth')) {
    return 'pricing_inquiry';
  }

  // Search queries
  if (lowerMessage.includes('find') || lowerMessage.includes('show me') || lowerMessage.includes('looking for')) {
    return 'vehicle_search';
  }

  // Event queries
  if (lowerMessage.includes('event') || lowerMessage.includes('show') || lowerMessage.includes('meet')) {
    return 'event_search';
  }

  // Investment queries
  if (lowerMessage.includes('investment') || lowerMessage.includes('appreciation') || lowerMessage.includes('trend')) {
    return 'investment_analysis';
  }

  // Comparison queries
  if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('better')) {
    return 'comparison';
  }

  return 'general_question';
}
```

---

## 9. Performance Optimization

### 9.1 Caching Strategy
```typescript
import NodeCache from 'node-cache';

const embeddingCache = new NodeCache({ stdTTL: 86400 }); // 24 hours

export async function getCachedEmbedding(text: string): Promise<number[]> {
  const cacheKey = `emb_${hashString(text)}`;
  const cached = embeddingCache.get<number[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const embedding = await generateEmbedding(text);
  embeddingCache.set(cacheKey, embedding);

  return embedding;
}
```

### 9.2 Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { success: false, error: 'Too many chat requests. Please slow down.' },
});

router.post('/chat', chatRateLimiter, async (req, res) => {
  // ... chat handler
});
```

---

## 10. Testing Strategy

### 10.1 Unit Tests
```typescript
describe('Vector Search Service', () => {
  it('should return cars with similarity > threshold', async () => {
    const embedding = await generateEmbedding('1967 Ford Mustang');
    const results = await vectorSearch(embedding, {
      type: 'car',
      limit: 5,
      similarityThreshold: 0.75,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarity).toBeGreaterThan(0.75);
  });

  it('should respect price filters', async () => {
    const embedding = await generateEmbedding('affordable classic car');
    const results = await vectorSearch(embedding, {
      type: 'car',
      limit: 10,
      filters: { priceMax: 50000 },
    });

    results.forEach(car => {
      expect(car.price).toBeLessThanOrEqual(50000);
    });
  });
});
```

### 10.2 Integration Tests
```typescript
describe('AI Chat Integration', () => {
  it('should stream response with context', async (done) => {
    const response = await request(app)
      .post('/api/ai/chat')
      .send({
        message: 'Find me a blue Mustang under $60k',
        pageContext: { page: 'car_search' },
      });

    let receivedContext = false;
    let receivedTokens = false;

    response.on('data', (chunk) => {
      const data = chunk.toString();

      if (data.includes('event: context')) {
        receivedContext = true;
      }
      if (data.includes('event: token')) {
        receivedTokens = true;
      }
      if (data.includes('event: complete')) {
        expect(receivedContext).toBe(true);
        expect(receivedTokens).toBe(true);
        done();
      }
    });
  });
});
```

---

## 11. Security Considerations

### 11.1 Input Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeMessage(message: string): string {
  // Remove HTML tags
  const clean = DOMPurify.sanitize(message, { ALLOWED_TAGS: [] });

  // Limit length
  return clean.substring(0, 2000);
}
```

### 11.2 API Key Protection
```typescript
// Never expose API keys in frontend
// Store in environment variables
// Rotate keys regularly
// Use different keys for dev/staging/prod
```

### 11.3 Rate Limiting (per user)
```typescript
const userChatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 messages per hour per user
  keyGenerator: (req) => req.user?.id || req.ip,
});
```

---

## 12. Monitoring & Analytics

### 12.1 Metrics to Track
- **Usage Metrics:**
  - Total conversations
  - Messages per conversation (avg)
  - Response time (p50, p95, p99)
  - User satisfaction (thumbs up/down)

- **Performance Metrics:**
  - Embedding generation time
  - Vector search latency
  - Claude API latency
  - Total response time

- **Business Metrics:**
  - Conversion rate (chat → car view)
  - Popular queries
  - Intent distribution
  - Feature usage

### 12.2 Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'chat-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'chat-combined.log' }),
  ],
});

// Log each chat interaction
logger.info('Chat message', {
  conversationId,
  userId,
  message: message.substring(0, 100),
  intent: detectedIntent,
  contextCarsCount: contextCars.length,
  responseTime: Date.now() - startTime,
});
```

---

## 13. Approval Checklist

- [ ] Review architecture and data flow
- [ ] Approve embedding strategy (OpenAI ada-002)
- [ ] Verify vector search implementation
- [ ] Confirm streaming response approach (SSE)
- [ ] Validate system prompts and persona
- [ ] Review admin analytics features
- [ ] Approve security measures
- [ ] Confirm performance optimization strategy
- [ ] Review testing approach

---

**Status:** READY FOR REVIEW
**Next Step:** Await approval before implementation
**Implementation Time:** 2-3 weeks
**Dependencies:** PostgreSQL + pgvector, Anthropic API, OpenAI API
