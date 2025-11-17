/**
 * AI Chat Routes - SPEC_04_AI_CHAT_SYSTEM.md
 * SSE streaming chat with vector search integration
 *
 * Endpoints:
 * - POST /api/ai/chat - Send chat message with SSE streaming
 * - GET /api/ai/conversations - List user's conversations
 * - GET /api/ai/conversations/:id - Get conversation with full history
 * - POST /api/ai/conversations - Create new conversation
 * - DELETE /api/ai/conversations/:id - Delete conversation
 * - POST /api/ai/search - Semantic search using AI
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { aiChatConversations, aiChatMessages } from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';
import { chatRateLimit, searchRateLimit } from '../middleware/rateLimitMiddleware';

// Import AI services (will be created in Phase 3.1 & 3.2)
// Placeholder imports - these will be implemented by other agents
// import * as chatService from '../services/ai/chatService';
// import * as vectorSearch from '../services/ai/vectorSearchService';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Chat Message Schema
 * Validates user message and optional conversation ID
 */
const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be 2000 characters or less'),
  conversationId: z.number().int().positive().optional(),
  pageContext: z.object({
    page: z.string().optional(),
    filters: z.record(z.any()).optional(),
    currentItemId: z.number().optional(),
    currentItemType: z.enum(['car', 'event']).optional(),
  }).optional(),
});

/**
 * Create Conversation Schema
 * Validates optional conversation title
 */
const createConversationSchema = z.object({
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be 200 characters or less')
    .optional(),
  pageContext: z.string().max(100).optional(),
});

/**
 * Search Schema
 * Validates semantic search parameters
 */
const searchSchema = z.object({
  query: z.string()
    .min(1, 'Query cannot be empty')
    .max(500, 'Query must be 500 characters or less'),
  type: z.enum(['cars', 'events', 'both']).default('both'),
  limit: z.number().int().min(1).max(50).default(10),
  filters: z.record(z.any()).optional(),
});

/**
 * Pagination Schema
 * Validates page and limit parameters
 */
const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ============================================================================
// ENDPOINT 1: POST /api/ai/chat - SSE Streaming Chat
// ============================================================================

/**
 * POST /api/ai/chat
 * Send chat message with Server-Sent Events streaming
 *
 * Auth: Required
 * Rate Limit: 20 requests per minute (chatRateLimit)
 *
 * Request Body:
 * - message: string (1-2000 chars)
 * - conversationId?: number
 * - pageContext?: { page, filters, currentItemId, currentItemType }
 *
 * Response: SSE stream
 * - event: start - { type: 'start', conversationId: number }
 * - event: content - { type: 'content', text: string }
 * - event: done - { type: 'done', messageId: number }
 * - event: error - { type: 'error', error: string }
 */
router.post('/chat', requireAuth, chatRateLimit, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { message, conversationId, pageContext } = chatMessageSchema.parse(req.body);
    const userId = req.user!.id;

    // Set up Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send start event
    const startEvent = {
      type: 'start',
      conversationId: conversationId || null,
    };
    res.write(`data: ${JSON.stringify(startEvent)}\n\n`);
    res.flush();

    // TODO: Integrate with chatService when implemented (Phase 3.1)
    // For now, mock the streaming response
    // const stream = await chatService.handleChatMessage(message, conversationId, userId, pageContext);

    // Mock streaming simulation (to be replaced with actual chatService)
    const mockResponse = `This is a mock response to: "${message.substring(0, 50)}..."

The AI chat service is being developed and will provide:
- Real-time streaming responses
- Vector search integration for relevant cars and events
- Context-aware answers based on page location
- Multi-turn conversation support

Your conversation ${conversationId ? `#${conversationId}` : '(new)'} is being processed.`;

    // Simulate streaming chunks
    const chunks = mockResponse.match(/.{1,20}/g) || [mockResponse];

    for (const chunk of chunks) {
      // Send content chunk
      const contentEvent = {
        type: 'content',
        text: chunk,
      };
      res.write(`data: ${JSON.stringify(contentEvent)}\n\n`);
      res.flush();

      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Save user message to database
    let finalConversationId = conversationId;

    if (!finalConversationId) {
      // Create new conversation
      const [newConversation] = await db.insert(aiChatConversations).values({
        userId,
        sessionId: crypto.randomUUID(),
        title: message.substring(0, 100), // Use first message as title
        pageContext: pageContext?.page,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
      }).returning();

      finalConversationId = newConversation.id;
    } else {
      // Update existing conversation
      await db.update(aiChatConversations)
        .set({
          updatedAt: new Date(),
          lastMessageAt: new Date(),
        })
        .where(eq(aiChatConversations.id, finalConversationId));
    }

    // Save user message
    await db.insert(aiChatMessages).values({
      conversationId: finalConversationId,
      role: 'user',
      content: message,
      createdAt: new Date(),
    });

    // Save assistant message
    const [savedMessage] = await db.insert(aiChatMessages).values({
      conversationId: finalConversationId,
      role: 'assistant',
      content: mockResponse,
      model: 'mock-model',
      createdAt: new Date(),
    }).returning();

    // Send done event
    const doneEvent = {
      type: 'done',
      conversationId: finalConversationId,
      messageId: savedMessage.id,
    };
    res.write(`data: ${JSON.stringify(doneEvent)}\n\n`);
    res.end();

  } catch (error) {
    console.error('Chat error:', error);

    if (error instanceof z.ZodError) {
      const errorEvent = {
        type: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      };
      res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
      res.end();
      return;
    }

    const errorEvent = {
      type: 'error',
      error: {
        code: 'CHAT_ERROR',
        message: 'Failed to process chat message',
      },
    };
    res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
    res.end();
  }
});

// ============================================================================
// ENDPOINT 2: GET /api/ai/conversations - List Conversations
// ============================================================================

/**
 * GET /api/ai/conversations
 * List user's conversations with pagination
 *
 * Auth: Required
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     conversations: [
 *       {
 *         id, title, createdAt, updatedAt, messageCount,
 *         lastMessage: { role, content, createdAt }
 *       }
 *     ]
 *   },
 *   meta: { page, limit, total, totalPages }
 * }
 */
router.get('/conversations', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Parse and validate pagination parameters
    const { page, limit } = paginationSchema.parse({
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });

    const offset = (page - 1) * limit;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(aiChatConversations)
      .where(eq(aiChatConversations.userId, userId));

    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    // Get conversations with message count
    const conversations = await db
      .select({
        id: aiChatConversations.id,
        title: aiChatConversations.title,
        pageContext: aiChatConversations.pageContext,
        createdAt: aiChatConversations.createdAt,
        updatedAt: aiChatConversations.updatedAt,
        lastMessageAt: aiChatConversations.lastMessageAt,
      })
      .from(aiChatConversations)
      .where(eq(aiChatConversations.userId, userId))
      .orderBy(desc(aiChatConversations.lastMessageAt))
      .limit(limit)
      .offset(offset);

    // Get last message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        // Get message count
        const [{ count: msgCount }] = await db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(aiChatMessages)
          .where(eq(aiChatMessages.conversationId, conversation.id));

        // Get last message
        const lastMessage = await db
          .select({
            role: aiChatMessages.role,
            content: aiChatMessages.content,
            createdAt: aiChatMessages.createdAt,
          })
          .from(aiChatMessages)
          .where(eq(aiChatMessages.conversationId, conversation.id))
          .orderBy(desc(aiChatMessages.createdAt))
          .limit(1);

        return {
          ...conversation,
          messageCount: Number(msgCount),
          lastMessage: lastMessage[0] || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        conversations: conversationsWithMessages,
      },
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid pagination parameters',
          details: error.errors,
        },
      });
    }

    console.error('List conversations error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch conversations',
      },
    });
  }
});

// ============================================================================
// ENDPOINT 3: GET /api/ai/conversations/:id - Get Conversation Details
// ============================================================================

/**
 * GET /api/ai/conversations/:id
 * Get conversation with full message history
 *
 * Auth: Required
 * Ownership: Verified (user must own the conversation)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     conversation: {
 *       id, title, createdAt, updatedAt,
 *       messages: [{ id, role, content, createdAt, model }]
 *     }
 *   }
 * }
 */
router.get('/conversations/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversationId = parseInt(req.params.id);

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid conversation ID',
        },
      });
    }

    // Get conversation and verify ownership
    const conversation = await db.query.aiChatConversations.findFirst({
      where: eq(aiChatConversations.id, conversationId),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        },
      });
    }

    // Verify ownership
    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this conversation',
        },
      });
    }

    // Get all messages for this conversation
    const messages = await db
      .select({
        id: aiChatMessages.id,
        role: aiChatMessages.role,
        content: aiChatMessages.content,
        model: aiChatMessages.model,
        tokensUsed: aiChatMessages.tokensUsed,
        responseTimeMs: aiChatMessages.responseTimeMs,
        createdAt: aiChatMessages.createdAt,
      })
      .from(aiChatMessages)
      .where(eq(aiChatMessages.conversationId, conversationId))
      .orderBy(aiChatMessages.createdAt);

    return res.status(200).json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          title: conversation.title,
          pageContext: conversation.pageContext,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          lastMessageAt: conversation.lastMessageAt,
          messages,
        },
      },
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch conversation',
      },
    });
  }
});

// ============================================================================
// ENDPOINT 4: POST /api/ai/conversations - Create Conversation
// ============================================================================

/**
 * POST /api/ai/conversations
 * Create new conversation
 *
 * Auth: Required
 *
 * Request Body:
 * - title?: string (optional, 1-200 chars)
 * - pageContext?: string (optional, max 100 chars)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     conversation: { id, title, createdAt, ... }
 *   }
 * }
 */
router.post('/conversations', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Validate request body
    const { title, pageContext } = createConversationSchema.parse(req.body);

    // Create new conversation
    const [newConversation] = await db.insert(aiChatConversations).values({
      userId,
      sessionId: crypto.randomUUID(),
      title: title || 'New Conversation',
      pageContext,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessageAt: new Date(),
    }).returning();

    return res.status(201).json({
      success: true,
      data: {
        conversation: {
          id: newConversation.id,
          title: newConversation.title,
          pageContext: newConversation.pageContext,
          sessionId: newConversation.sessionId,
          createdAt: newConversation.createdAt,
          updatedAt: newConversation.updatedAt,
          lastMessageAt: newConversation.lastMessageAt,
        },
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      });
    }

    console.error('Create conversation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create conversation',
      },
    });
  }
});

// ============================================================================
// ENDPOINT 5: DELETE /api/ai/conversations/:id - Delete Conversation
// ============================================================================

/**
 * DELETE /api/ai/conversations/:id
 * Delete conversation (hard delete with cascade)
 *
 * Auth: Required
 * Ownership: Verified
 *
 * Note: Currently performs hard delete. Schema does not have deletedAt field.
 * If soft delete is needed, schema should be updated with deletedAt timestamp.
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Conversation deleted successfully'
 * }
 */
router.delete('/conversations/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversationId = parseInt(req.params.id);

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid conversation ID',
        },
      });
    }

    // Get conversation and verify ownership
    const conversation = await db.query.aiChatConversations.findFirst({
      where: eq(aiChatConversations.id, conversationId),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        },
      });
    }

    // Verify ownership
    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this conversation',
        },
      });
    }

    // Delete conversation (cascade will delete all messages)
    await db
      .delete(aiChatConversations)
      .where(eq(aiChatConversations.id, conversationId));

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete conversation',
      },
    });
  }
});

// ============================================================================
// ENDPOINT 6: POST /api/ai/search - Semantic Search
// ============================================================================

/**
 * POST /api/ai/search
 * Semantic search using vector embeddings
 *
 * Auth: Optional (better results when authenticated)
 * Rate Limit: searchRateLimit (50 req/min)
 *
 * Request Body:
 * - query: string (1-500 chars)
 * - type: 'cars' | 'events' | 'both' (default: 'both')
 * - limit: number (1-50, default: 10)
 * - filters?: { priceMin, priceMax, make, etc. }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     results: [
 *       { type: 'car', id, similarity, data: {...} },
 *       { type: 'event', id, similarity, data: {...} }
 *     ]
 *   }
 * }
 */
router.post('/search', optionalAuth, searchRateLimit, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { query, type, limit, filters } = searchSchema.parse(req.body);
    const userId = req.user?.id;

    // TODO: Integrate with vectorSearchService when implemented (Phase 3.2)
    // const results = await vectorSearch.semanticSearch(query, type, limit, filters, userId);

    // Mock search results (to be replaced with actual vector search)
    const mockResults = [
      {
        type: 'car' as const,
        id: 1,
        similarity: 0.92,
        data: {
          year: 1967,
          make: 'Ford',
          model: 'Mustang',
          price: 45000,
          description: 'Classic Mustang Fastback in excellent condition',
          imageUrl: '/images/mustang-1967.jpg',
        },
      },
      {
        type: 'event' as const,
        id: 5,
        similarity: 0.87,
        data: {
          eventName: 'Classic Car Show',
          city: 'Detroit',
          state: 'MI',
          startDate: '2024-06-15',
          description: 'Annual classic car showcase featuring vintage Mustangs',
        },
      },
    ].filter(result => {
      if (type === 'both') return true;
      if (type === 'cars') return result.type === 'car';
      if (type === 'events') return result.type === 'event';
      return true;
    }).slice(0, limit);

    return res.status(200).json({
      success: true,
      data: {
        results: mockResults,
        query,
        type,
        limit,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid search parameters',
          details: error.errors,
        },
      });
    }

    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Search failed',
      },
    });
  }
});

// ============================================================================
// EXPORTS
// ============================================================================

export default router;
