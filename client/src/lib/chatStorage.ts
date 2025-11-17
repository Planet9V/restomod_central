/**
 * Chat Storage Utilities
 * Persists chat conversations and messages to localStorage
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  conversationId?: number;
}

export interface ChatConversation {
  id: number;
  title: string;
  messages: ChatMessage[];
  lastMessageAt: number;
  pageContext?: string;
}

const STORAGE_KEYS = {
  CURRENT_CONVERSATION: 'kitt_current_conversation',
  CONVERSATION_HISTORY: 'kitt_conversation_history',
  PREFERENCES: 'kitt_preferences',
};

/**
 * Get current active conversation from localStorage
 */
export function getCurrentConversation(): ChatConversation | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse current conversation:', error);
    return null;
  }
}

/**
 * Save current conversation to localStorage
 */
export function saveCurrentConversation(conversation: ChatConversation): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_CONVERSATION,
      JSON.stringify(conversation)
    );
  } catch (error) {
    console.error('Failed to save current conversation:', error);
  }
}

/**
 * Clear current conversation
 */
export function clearCurrentConversation(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);
}

/**
 * Get conversation history
 */
export function getConversationHistory(): ChatConversation[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse conversation history:', error);
    return [];
  }
}

/**
 * Add conversation to history
 */
export function addToConversationHistory(conversation: ChatConversation): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getConversationHistory();

    // Check if conversation already exists
    const existingIndex = history.findIndex(c => c.id === conversation.id);

    if (existingIndex >= 0) {
      // Update existing conversation
      history[existingIndex] = conversation;
    } else {
      // Add new conversation
      history.unshift(conversation);
    }

    // Keep only last 50 conversations
    const trimmedHistory = history.slice(0, 50);

    localStorage.setItem(
      STORAGE_KEYS.CONVERSATION_HISTORY,
      JSON.stringify(trimmedHistory)
    );
  } catch (error) {
    console.error('Failed to add to conversation history:', error);
  }
}

/**
 * Delete conversation from history
 */
export function deleteConversation(conversationId: number): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getConversationHistory();
    const filtered = history.filter(c => c.id !== conversationId);

    localStorage.setItem(
      STORAGE_KEYS.CONVERSATION_HISTORY,
      JSON.stringify(filtered)
    );

    // If deleted conversation is current, clear it
    const current = getCurrentConversation();
    if (current && current.id === conversationId) {
      clearCurrentConversation();
    }
  } catch (error) {
    console.error('Failed to delete conversation:', error);
  }
}

/**
 * Chat preferences
 */
export interface ChatPreferences {
  soundEnabled: boolean;
  minimized: boolean;
  theme: 'dark' | 'light';
}

const DEFAULT_PREFERENCES: ChatPreferences = {
  soundEnabled: false,
  minimized: true,
  theme: 'dark',
};

/**
 * Get chat preferences
 */
export function getChatPreferences(): ChatPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

  const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  if (!stored) return DEFAULT_PREFERENCES;

  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to parse chat preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save chat preferences
 */
export function saveChatPreferences(preferences: Partial<ChatPreferences>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getChatPreferences();
    const updated = { ...current, ...preferences };

    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error('Failed to save chat preferences:', error);
  }
}
