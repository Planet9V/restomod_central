/**
 * Admin AI Analytics and Management Routes
 * SPEC_04_AI_CHAT_SYSTEM.md - Phase 3.4
 *
 * Admin-only endpoints for:
 * - AI usage analytics and monitoring
 * - Conversation management
 * - Popular query analysis
 * - Vector search effectiveness metrics
 * - Embedding regeneration
 * - AI configuration management
 *
 * Security: All routes require requireAuth + requireAdmin middleware
 * SuperAdmin routes: regenerate-embeddings, config updates
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as crypto from 'crypto';
import { db } from '../../db';
import { aiChatConversations, aiChatMessages, carsForSale, carShowEvents, users } from '../../../shared/schema';
import { eq, gte, lte, desc, sql, and, count, avg } from 'drizzle-orm';
import { requireAuth, requireAdmin, requireSuperAdmin } from '../../middleware/authMiddleware';
import { generateEmbedding, generateCarEmbedding, generateEventEmbedding } from '../../services/ai/embeddingService';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const analyticsQuerySchema = z.object({
  timeframe: z.enum(['today', 'week', 'month', 'all']).default('week'),
  userId: z.number().int().positive().optional(),
});

const conversationsQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  userId: z.number().int().positive().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const regenerateEmbeddingsSchema = z.object({
  type: z.enum(['cars', 'events', 'all']),
  force: z.boolean().default(false),
});

const updateConfigSchema = z.object({
  model: z.string().optional(),
  maxTokens: z.number().int().min(256).max(4096).optional(),
  temperature: z.number().min(0).max(2).optional(),
  vectorSearchThreshold: z.number().min(0).max(1).optional(),
  contextLimit: z.number().int().min(1).max(20).optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get date range based on timeframe
 */
function getDateRange(timeframe: 'today' | 'week' | 'month' | 'all'): Date | null {
  const now = new Date();

  switch (timeframe) {
    case 'today':
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return today;
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return weekAgo;
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return monthAgo;
    case 'all':
      return null;
    default:
      return null;
  }
}

/**
 * AI configuration storage (in-memory for now, can be moved to database)
 */
let aiConfig = {
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 1024,
  temperature: 1.0,
  systemPrompt: 'You are K.I.T.T. (Knowledge Intelligence for Timeless Transportation), an AI assistant for a luxury classic car marketplace.',
  vectorSearchThreshold: 0.7,
  contextLimit: 5,
};

// ============================================================================
// ENDPOINT 1: GET /api/admin/ai/analytics
// AI usage analytics with time-based filtering
// ============================================================================

router.get('/analytics', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const query = analyticsQuerySchema.parse({
      timeframe: req.query.timeframe || 'week',
      userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
    });

    const startDate = getDateRange(query.timeframe);
    console.log(`📊 Admin Analytics: Fetching AI analytics for timeframe: ${query.timeframe}`);

    // Build WHERE conditions
    const conversationWhere = startDate
      ? gte(aiChatConversations.createdAt, startDate)
      : undefined;

    // 1. Total conversations
    const conversationsResult = await db
      .select({ count: count() })
      .from(aiChatConversations)
      .where(conversationWhere);

    const totalConversations = conversationsResult[0]?.count || 0;

    // 2. Total messages
    const messagesCountQuery = startDate
      ? db.select({ count: count() })
          .from(aiChatMessages)
          .innerJoin(aiChatConversations, eq(aiChatMessages.conversationId, aiChatConversations.id))
          .where(gte(aiChatConversations.createdAt, startDate))
      : db.select({ count: count() }).from(aiChatMessages);

    const messagesResult = await messagesCountQuery;
    const totalMessages = messagesResult[0]?.count || 0;

    // 3. Active users (distinct user IDs)
    const activeUsersQuery = db
      .select({ count: count(aiChatConversations.userId) })
      .from(aiChatConversations)
      .where(conversationWhere);

    const activeUsersResult = await activeUsersQuery;
    const activeUsers = activeUsersResult[0]?.count || 0;

    // 4. Average conversation length (messages per conversation)
    const avgLengthResult = await db.execute(sql`
      SELECT AVG(message_count)::numeric as avg_count
      FROM (
        SELECT conversation_id, COUNT(*) as message_count
        FROM ai_chat_messages
        GROUP BY conversation_id
      ) as counts
    `);

    const avgConversationLength = avgLengthResult.rows[0]?.avg_count
      ? parseFloat(avgLengthResult.rows[0].avg_count)
      : 0;

    // 5. Conversations by day (trend data)
    const conversationsByDayResult = await db.execute(sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*)::integer as count
      FROM ai_chat_conversations
      ${startDate ? sql`WHERE created_at >= ${startDate}` : sql``}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    const conversationsByDay = conversationsByDayResult.rows.map((row: any) => ({
      date: row.date,
      count: row.count,
    }));

    // 6. Messages by day (trend data)
    const messagesByDayResult = await db.execute(sql`
      SELECT
        DATE(m.created_at) as date,
        COUNT(*)::integer as count
      FROM ai_chat_messages m
      ${startDate ? sql`
        INNER JOIN ai_chat_conversations c ON m.conversation_id = c.id
        WHERE c.created_at >= ${startDate}
      ` : sql``}
      GROUP BY DATE(m.created_at)
      ORDER BY DATE(m.created_at) ASC
    `);

    const messagesByDay = messagesByDayResult.rows.map((row: any) => ({
      date: row.date,
      count: row.count,
    }));

    // 7. Top users by conversation count
    const topUsersResult = await db.execute(sql`
      SELECT
        c.user_id,
        u.username,
        COUNT(*)::integer as conversation_count
      FROM ai_chat_conversations c
      INNER JOIN users u ON c.user_id = u.id
      ${startDate ? sql`WHERE c.created_at >= ${startDate}` : sql``}
      GROUP BY c.user_id, u.username
      ORDER BY conversation_count DESC
      LIMIT 10
    `);

    const topUsers = topUsersResult.rows.map((row: any) => ({
      userId: row.user_id,
      username: row.username,
      conversationCount: row.conversation_count,
    }));

    const analytics = {
      overview: {
        totalConversations,
        totalMessages,
        activeUsers,
        avgConversationLength: parseFloat(avgConversationLength.toFixed(1)),
      },
      trends: {
        conversationsByDay,
        messagesByDay,
      },
      topUsers,
      timeframe: query.timeframe,
    };

    console.log(`✅ Analytics: ${totalConversations} conversations, ${totalMessages} messages, ${activeUsers} active users`);

    res.json({
      success: true,
      data: analytics,
    });

  } catch (error: any) {
    console.error('Error fetching AI analytics:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch AI analytics',
      },
    });
  }
});

// ============================================================================
// ENDPOINT 2: GET /api/admin/ai/conversations
// All conversations with pagination and filtering
// ============================================================================

router.get('/conversations', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const query = conversationsQuerySchema.parse({
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });

    console.log(`📋 Admin: Fetching conversations - page ${query.page}, limit ${query.limit}`);

    // Build WHERE conditions
    const conditions = [];

    if (query.userId) {
      conditions.push(eq(aiChatConversations.userId, query.userId));
    }

    if (query.dateFrom) {
      conditions.push(gte(aiChatConversations.createdAt, new Date(query.dateFrom)));
    }

    if (query.dateTo) {
      conditions.push(lte(aiChatConversations.createdAt, new Date(query.dateTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(aiChatConversations)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    // Get paginated conversations
    const offset = (query.page - 1) * query.limit;

    const conversations = await db
      .select({
        id: aiChatConversations.id,
        userId: aiChatConversations.userId,
        sessionId: aiChatConversations.sessionId,
        title: aiChatConversations.title,
        pageContext: aiChatConversations.pageContext,
        createdAt: aiChatConversations.createdAt,
        updatedAt: aiChatConversations.updatedAt,
        lastMessageAt: aiChatConversations.lastMessageAt,
        username: users.username,
        email: users.email,
      })
      .from(aiChatConversations)
      .leftJoin(users, eq(aiChatConversations.userId, users.id))
      .where(whereClause)
      .orderBy(desc(aiChatConversations.lastMessageAt))
      .limit(query.limit)
      .offset(offset);

    // Get message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conv) => {
        const msgCountResult = await db
          .select({ count: count() })
          .from(aiChatMessages)
          .where(eq(aiChatMessages.conversationId, conv.id));

        return {
          ...conv,
          messageCount: msgCountResult[0]?.count || 0,
        };
      })
    );

    console.log(`✅ Retrieved ${conversations.length} conversations (total: ${total})`);

    res.json({
      success: true,
      data: {
        conversations: conversationsWithCounts,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      },
    });

  } catch (error: any) {
    console.error('Error fetching conversations:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch conversations',
      },
    });
  }
});

// ============================================================================
// ENDPOINT 3: GET /api/admin/ai/popular-queries
// Most common user queries (aggregated by similarity)
// ============================================================================

router.get('/popular-queries', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log('🔍 Admin: Fetching popular queries...');

    // Get user messages (role = 'user')
    const userMessagesResult = await db.execute(sql`
      SELECT
        content,
        COUNT(*)::integer as count
      FROM ai_chat_messages
      WHERE role = 'user'
      GROUP BY content
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 20
    `);

    const queries = userMessagesResult.rows.map((row: any) => ({
      pattern: row.content.substring(0, 100), // Truncate long queries
      count: row.count,
      avgSimilarity: 1.0, // Exact matches have 100% similarity
    }));

    console.log(`✅ Found ${queries.length} popular query patterns`);

    res.json({
      success: true,
      data: {
        queries,
        totalUnique: userMessagesResult.rows.length,
      },
    });

  } catch (error: any) {
    console.error('Error fetching popular queries:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch popular queries',
      },
    });
  }
});

// ============================================================================
// ENDPOINT 4: GET /api/admin/ai/context-stats
// Vector search effectiveness metrics
// ============================================================================

router.get('/context-stats', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log('📊 Admin: Fetching context/vector search stats...');

    // Count messages with context data
    const messagesWithContextResult = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE context_cars IS NOT NULL)::integer as messages_with_cars,
        COUNT(*) FILTER (WHERE context_events IS NOT NULL)::integer as messages_with_events,
        COUNT(*)::integer as total_messages
      FROM ai_chat_messages
      WHERE role = 'assistant'
    `);

    const stats = messagesWithContextResult.rows[0] || {
      messages_with_cars: 0,
      messages_with_events: 0,
      total_messages: 0,
    };

    // Get average context items per message
    const avgContextResult = await db.execute(sql`
      SELECT
        AVG(jsonb_array_length(context_cars))::numeric as avg_cars_per_message,
        AVG(jsonb_array_length(context_events))::numeric as avg_events_per_message
      FROM ai_chat_messages
      WHERE role = 'assistant'
        AND (context_cars IS NOT NULL OR context_events IS NOT NULL)
    `);

    const avgContext = avgContextResult.rows[0] || {
      avg_cars_per_message: 0,
      avg_events_per_message: 0,
    };

    const contextStats = {
      searchesPerformed: stats.total_messages,
      messagesWithCars: stats.messages_with_cars,
      messagesWithEvents: stats.messages_with_events,
      avgCarsPerMessage: avgContext.avg_cars_per_message
        ? parseFloat(avgContext.avg_cars_per_message).toFixed(2)
        : '0',
      avgEventsPerMessage: avgContext.avg_events_per_message
        ? parseFloat(avgContext.avg_events_per_message).toFixed(2)
        : '0',
      contextUsageRate: stats.total_messages > 0
        ? ((stats.messages_with_cars + stats.messages_with_events) / stats.total_messages * 100).toFixed(1) + '%'
        : '0%',
    };

    console.log(`✅ Context stats: ${contextStats.searchesPerformed} searches, ${contextStats.contextUsageRate} with context`);

    res.json({
      success: true,
      data: contextStats,
    });

  } catch (error: any) {
    console.error('Error fetching context stats:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch context stats',
      },
    });
  }
});

// ============================================================================
// ENDPOINT 5: POST /api/admin/ai/regenerate-embeddings
// Bulk regenerate embeddings (SuperAdmin only, background job)
// ============================================================================

router.post('/regenerate-embeddings', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const body = regenerateEmbeddingsSchema.parse(req.body);
    console.log(`🔄 SuperAdmin: Starting embedding regeneration - type: ${body.type}, force: ${body.force}`);

    const jobId = crypto.randomUUID();

    // Start background job (async, don't await)
    regenerateEmbeddingsJob(jobId, body.type, body.force).catch((error) => {
      console.error(`❌ Embedding regeneration job ${jobId} failed:`, error);
    });

    res.json({
      success: true,
      data: {
        jobId,
        type: body.type,
        force: body.force,
        status: 'started',
        message: 'Embedding regeneration job started in background',
      },
    });

  } catch (error: any) {
    console.error('Error starting embedding regeneration:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to start embedding regeneration',
      },
    });
  }
});

/**
 * Background job to regenerate embeddings
 */
async function regenerateEmbeddingsJob(
  jobId: string,
  type: 'cars' | 'events' | 'all',
  force: boolean
): Promise<void> {
  console.log(`🚀 Job ${jobId}: Starting embedding regeneration...`);

  try {
    let carsProcessed = 0;
    let eventsProcessed = 0;

    // Regenerate car embeddings
    if (type === 'cars' || type === 'all') {
      console.log(`🚗 Job ${jobId}: Processing car embeddings...`);

      const cars = await db.select().from(carsForSale);

      for (const car of cars) {
        // Skip if embedding exists and force is false
        if (!force && car.embedding) {
          continue;
        }

        try {
          const text = generateCarEmbedding(car);
          const embedding = await generateEmbedding(text);

          await db
            .update(carsForSale)
            .set({ embedding: embedding as any })
            .where(eq(carsForSale.id, car.id));

          carsProcessed++;

          // Small delay to avoid rate limiting
          if (carsProcessed % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error processing car ${car.id}:`, error);
        }
      }

      console.log(`✅ Job ${jobId}: Processed ${carsProcessed} car embeddings`);
    }

    // Regenerate event embeddings
    if (type === 'events' || type === 'all') {
      console.log(`📅 Job ${jobId}: Processing event embeddings...`);

      const events = await db.select().from(carShowEvents);

      for (const event of events) {
        // Skip if embedding exists and force is false
        if (!force && event.embedding) {
          continue;
        }

        try {
          const text = generateEventEmbedding(event);
          const embedding = await generateEmbedding(text);

          await db
            .update(carShowEvents)
            .set({ embedding: embedding as any })
            .where(eq(carShowEvents.id, event.id));

          eventsProcessed++;

          // Small delay to avoid rate limiting
          if (eventsProcessed % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error processing event ${event.id}:`, error);
        }
      }

      console.log(`✅ Job ${jobId}: Processed ${eventsProcessed} event embeddings`);
    }

    console.log(`✅ Job ${jobId}: Completed - ${carsProcessed} cars, ${eventsProcessed} events`);

  } catch (error) {
    console.error(`❌ Job ${jobId} failed:`, error);
    throw error;
  }
}

// ============================================================================
// ENDPOINT 6: GET /api/admin/ai/config
// Get current AI configuration
// ============================================================================

router.get('/config', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log('⚙️ Admin: Fetching AI configuration');

    res.json({
      success: true,
      data: {
        config: aiConfig,
      },
    });

  } catch (error: any) {
    console.error('Error fetching AI config:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch AI configuration',
      },
    });
  }
});

// ============================================================================
// ENDPOINT 7: PUT /api/admin/ai/config
// Update AI configuration (SuperAdmin only)
// ============================================================================

router.put('/config', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const updates = updateConfigSchema.parse(req.body);
    console.log('⚙️ SuperAdmin: Updating AI configuration', updates);

    // Update config
    if (updates.model !== undefined) {
      aiConfig.model = updates.model;
    }
    if (updates.maxTokens !== undefined) {
      aiConfig.maxTokens = updates.maxTokens;
    }
    if (updates.temperature !== undefined) {
      aiConfig.temperature = updates.temperature;
    }
    if (updates.vectorSearchThreshold !== undefined) {
      aiConfig.vectorSearchThreshold = updates.vectorSearchThreshold;
    }
    if (updates.contextLimit !== undefined) {
      aiConfig.contextLimit = updates.contextLimit;
    }

    // Log admin action
    console.log(`✅ AI configuration updated by ${req.user?.email}`);

    res.json({
      success: true,
      data: {
        config: aiConfig,
        message: 'AI configuration updated successfully',
      },
    });

  } catch (error: any) {
    console.error('Error updating AI config:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid configuration values',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update AI configuration',
      },
    });
  }
});

export default router;
