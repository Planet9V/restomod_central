/**
 * Chat Service with SSE Streaming
 * Handles communication with the AI chat API
 */

export interface PageContext {
  page: string;
  filters?: Record<string, any>;
  currentItemId?: number;
  currentItemType?: 'car' | 'event';
}

export interface ChatRequest {
  message: string;
  conversationId?: number;
  pageContext?: PageContext;
}

export interface SSEEvent {
  type: 'start' | 'content' | 'done' | 'error';
  conversationId?: number;
  messageId?: number;
  text?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Send chat message with SSE streaming
 * Returns an async generator that yields chunks of the response
 */
export async function* sendChatMessage(
  request: ChatRequest
): AsyncGenerator<SSEEvent, void, unknown> {
  const token = getAuthToken();

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep incomplete message in buffer

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          // Parse SSE format: "data: {...}"
          const dataMatch = line.match(/^data: (.+)$/m);
          if (!dataMatch) continue;

          const event: SSEEvent = JSON.parse(dataMatch[1]);
          yield event;

          // Stop on done or error
          if (event.type === 'done' || event.type === 'error') {
            return;
          }
        } catch (parseError) {
          console.error('Failed to parse SSE event:', parseError, line);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Fetch conversation history
 */
export async function fetchConversations(
  page: number = 1,
  limit: number = 20
): Promise<any> {
  const token = getAuthToken();

  const response = await fetch(
    `/api/ai/conversations?page=${page}&limit=${limit}`,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch specific conversation with messages
 */
export async function fetchConversation(conversationId: number): Promise<any> {
  const token = getAuthToken();

  const response = await fetch(`/api/ai/conversations/${conversationId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Create new conversation
 */
export async function createConversation(
  title?: string,
  pageContext?: string
): Promise<any> {
  const token = getAuthToken();

  const response = await fetch('/api/ai/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify({ title, pageContext }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Delete conversation
 */
export async function deleteConversation(conversationId: number): Promise<void> {
  const token = getAuthToken();

  const response = await fetch(`/api/ai/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.statusText}`);
  }
}

/**
 * Check rate limit status
 * Returns remaining requests and reset time
 */
export async function getRateLimitStatus(): Promise<{
  remaining: number;
  limit: number;
  resetAt: number;
}> {
  // This would be returned in response headers
  // For now, return mock data
  return {
    remaining: 15,
    limit: 20,
    resetAt: Date.now() + 60000, // 1 minute from now
  };
}
