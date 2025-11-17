/**
 * K.I.T.T. Chat Service - Example Usage & Implementation Guide
 *
 * This file demonstrates how to use the chatService with SSE streaming
 * and provides examples for frontend integration.
 */

import type { Request, Response } from 'express';
import {
  handleChatMessage,
  detectUserIntent,
  type ChatRequest,
  type PageContext,
} from './chatService';

/**
 * EXAMPLE 1: Express API Endpoint with SSE Streaming
 *
 * POST /api/ai/chat
 *
 * This endpoint handles chat requests and streams responses using Server-Sent Events (SSE)
 */
export async function chatEndpointExample(req: Request, res: Response) {
  try {
    const { message, conversationId, pageContext } = req.body;
    const userId = (req as any).user?.id || 1; // Get from auth middleware

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Handle chat and get streaming response
    const chatRequest: ChatRequest = {
      message,
      conversationId,
      userId,
      pageContext,
      includeContext: true,
    };

    const response = await handleChatMessage(chatRequest);

    // Send conversation metadata first
    res.write(`event: conversation\n`);
    res.write(`data: ${JSON.stringify({
      conversationId: response.conversationId,
      messageId: response.messageId,
    })}\n\n`);

    // Send context (cars/events found)
    res.write(`event: context\n`);
    res.write(`data: ${JSON.stringify({
      cars: response.contextCars.map(c => ({
        id: c.id,
        make: c.make,
        model: c.model,
        year: c.year,
        price: c.price,
        similarity: c.similarity,
      })),
      events: response.contextEvents.map(e => ({
        id: e.id,
        name: e.eventName,
        date: e.startDate,
        city: e.city,
        state: e.state,
        similarity: e.similarity,
      })),
    })}\n\n`);

    // Detect intent and send to client
    const intent = detectUserIntent(message, pageContext);
    res.write(`event: intent\n`);
    res.write(`data: ${JSON.stringify({ intent })}\n\n`);

    // Stream tokens from Claude
    try {
      for await (const chunk of response.stream) {
        res.write(`event: token\n`);
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      // Send completion event
      res.write(`event: complete\n`);
      res.write(`data: ${JSON.stringify({ status: 'done' })}\n\n`);

    } catch (streamError: any) {
      console.error('Streaming error:', streamError);
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
    }

    res.end();

  } catch (error: any) {
    console.error('Chat endpoint error:', error);

    // If headers not sent, send JSON error
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // If SSE already started, send error event
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}

/**
 * EXAMPLE 2: Frontend SSE Client (React/TypeScript)
 *
 * This demonstrates how to consume the SSE stream on the frontend
 */
export const frontendExample = `
// client/src/services/aiChatService.ts

interface ChatMessageEvent {
  type: 'conversation' | 'context' | 'intent' | 'token' | 'complete' | 'error';
  data: any;
}

export async function sendChatMessage(
  message: string,
  conversationId?: number,
  pageContext?: any
): Promise<void> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${getAuthToken()}\`,
    },
    body: JSON.stringify({
      message,
      conversationId,
      pageContext,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to start chat');
  }

  // Create EventSource-like reader from fetch response
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Response body is not readable');
  }

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE messages
    const lines = buffer.split('\\n\\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      const eventMatch = line.match(/event: (.+)\\ndata: (.+)/);
      if (eventMatch) {
        const [, eventType, eventData] = eventMatch;
        handleSSEEvent(eventType, JSON.parse(eventData));
      }
    }
  }
}

function handleSSEEvent(type: string, data: any) {
  switch (type) {
    case 'conversation':
      console.log('Conversation started:', data.conversationId);
      break;

    case 'context':
      console.log('Context loaded:', data.cars.length, 'cars,', data.events.length, 'events');
      break;

    case 'intent':
      console.log('Detected intent:', data.intent);
      break;

    case 'token':
      // Append to message display
      appendToCurrentMessage(data.chunk);
      break;

    case 'complete':
      console.log('Streaming complete');
      markMessageComplete();
      break;

    case 'error':
      console.error('Chat error:', data.error);
      showErrorMessage(data.error);
      break;
  }
}

// React Component Example
function AIChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = async (userMessage: string) => {
    // Add user message to UI
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    // Add placeholder for assistant message
    const assistantMsgIndex = messages.length + 1;
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    setIsStreaming(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          pageContext: {
            page: 'car_search',
            filters: currentFilters,
          },
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\\n\\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/event: (.+)\\ndata: (.+)/);
          if (eventMatch) {
            const [, eventType, eventData] = eventMatch;
            const data = JSON.parse(eventData);

            if (eventType === 'token') {
              // Update assistant message in real-time
              setMessages(prev => {
                const updated = [...prev];
                updated[assistantMsgIndex] = {
                  ...updated[assistantMsgIndex],
                  content: updated[assistantMsgIndex].content + data.chunk,
                };
                return updated;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="ai-chat-widget">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={\`message \${msg.role}\`}>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !isStreaming) {
            handleSend(currentMessage);
            setCurrentMessage('');
          }
        }}
        disabled={isStreaming}
      />
    </div>
  );
}
`;

/**
 * EXAMPLE 3: Different Page Contexts
 */
export const pageContextExamples = {
  // Homepage - General assistance
  homepage: {
    page: 'homepage',
  } as PageContext,

  // Car Search Page - With filters
  carSearch: {
    page: 'car_search',
    filters: {
      make: 'Ford',
      yearMin: 1960,
      yearMax: 1970,
      priceMax: 100000,
    },
  } as PageContext,

  // Car Detail Page - Viewing specific vehicle
  carDetail: {
    page: 'car_detail',
    currentItemId: 42,
    currentItemType: 'car' as const,
  } as PageContext,

  // Event Map Page - Location-based
  eventMap: {
    page: 'event_map',
    filters: {
      state: 'California',
      eventType: 'car_show',
    },
  } as PageContext,

  // Admin Dashboard - Analytics focus
  adminDashboard: {
    page: 'admin_dashboard',
  } as PageContext,
};

/**
 * EXAMPLE 4: Sample Chat Interactions
 */
export const sampleInteractions = {
  // Investment inquiry
  investmentQuery: {
    message: "What's the best classic Mustang to buy as an investment right now?",
    expectedIntent: 'investment_analysis',
    expectedContext: 'Multiple Ford Mustangs from inventory',
  },

  // Event search
  eventQuery: {
    message: "Are there any car shows in California this month?",
    expectedIntent: 'event_search',
    expectedContext: 'California events from database',
  },

  // Technical question
  technicalQuery: {
    message: "How do I rebuild a 289 small block Ford engine?",
    expectedIntent: 'technical_question',
    expectedContext: 'General automotive knowledge',
  },

  // Price comparison
  comparisonQuery: {
    message: "Compare a 1967 Camaro SS vs a 1967 Mustang GT for investment",
    expectedIntent: 'comparison',
    expectedContext: 'Both Camaro and Mustang listings',
  },

  // General search
  searchQuery: {
    message: "Show me blue convertibles under $50k",
    expectedIntent: 'vehicle_search',
    expectedContext: 'Filtered car inventory',
  },
};

/**
 * DATABASE SCHEMA ADDITIONS NEEDED
 *
 * Add these tables to shared/schema.ts:
 */
export const requiredSchemaAdditions = `
// AI Chat Conversations Table
export const aiChatConversations = sqliteTable("ai_chat_conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  pageContext: text("page_context", { mode: 'json' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
});

// AI Chat Messages Table
export const aiChatMessages = sqliteTable("ai_chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull().references(() => aiChatConversations.id, { onDelete: 'cascade' }),
  role: text("role").notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  metadata: text("metadata", { mode: 'json' }), // Stores model info, tokens, etc.
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

// For PostgreSQL with pgvector, add embedding columns:
export const carsForSale = pgTable("cars_for_sale", {
  // ... existing columns ...
  embedding: vector("embedding", { dimensions: 1536 }), // OpenAI ada-002
});

export const carShowEvents = pgTable("car_show_events", {
  // ... existing columns ...
  embedding: vector("embedding", { dimensions: 1536 }), // OpenAI ada-002
});

// Create vector similarity index:
CREATE INDEX ON cars_for_sale USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON car_show_events USING ivfflat (embedding vector_cosine_ops);
`;

/**
 * ENVIRONMENT VARIABLES NEEDED
 */
export const requiredEnvVars = `
# Add to .env file:

# Anthropic API Key (for Claude 3.5 Sonnet)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI API Key (for embeddings - already configured)
OPENAI_API_KEY=sk-...

# Database URL (PostgreSQL with pgvector recommended)
DATABASE_URL=postgresql://user:pass@host:5432/database
`;

/**
 * RATE LIMITING EXAMPLE
 */
export const rateLimitingExample = `
import rateLimit from 'express-rate-limit';

// Rate limiter for chat endpoint
export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute (matches spec)
  message: {
    success: false,
    error: 'Too many chat requests. Please slow down.',
  },
  keyGenerator: (req) => {
    // Rate limit per user
    return req.user?.id?.toString() || req.ip;
  },
});

// Apply to route
app.post('/api/ai/chat', chatRateLimiter, chatEndpointExample);
`;

/**
 * TESTING EXAMPLE
 */
export const testingExample = `
import { describe, it, expect } from 'vitest';
import { handleChatMessage, detectUserIntent } from './chatService';

describe('K.I.T.T. Chat Service', () => {
  it('should detect investment inquiry intent', () => {
    const intent = detectUserIntent('What are the best investment cars?');
    expect(intent).toBe('investment_analysis');
  });

  it('should detect event search intent', () => {
    const intent = detectUserIntent('Show me car shows in California');
    expect(intent).toBe('event_search');
  });

  it('should stream response with context', async () => {
    const request = {
      message: 'Tell me about classic Mustangs',
      userId: 1,
      pageContext: { page: 'car_search' },
    };

    const response = await handleChatMessage(request);

    expect(response.conversationId).toBeDefined();
    expect(response.stream).toBeDefined();
    expect(response.contextCars).toBeInstanceOf(Array);
  });
});
`;

export default {
  chatEndpointExample,
  frontendExample,
  pageContextExamples,
  sampleInteractions,
  requiredSchemaAdditions,
  requiredEnvVars,
  rateLimitingExample,
  testingExample,
};
