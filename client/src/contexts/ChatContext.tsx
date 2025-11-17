/**
 * Chat Context - Global state management for K.I.T.T. AI Chat
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatMessage, getCurrentConversation, saveCurrentConversation, clearCurrentConversation } from '@/lib/chatStorage';
import { sendChatMessage, PageContext, SSEEvent } from '@/lib/chatService';
import { useToast } from '@/hooks/use-toast';

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isMinimized: boolean;
  isStreaming: boolean;
  conversationId: number | null;
  error: string | null;
  rateLimitRemaining: number;
}

export interface ChatContextValue {
  state: ChatState;
  sendMessage: (message: string, pageContext?: PageContext) => Promise<void>;
  openChat: () => void;
  closeChat: () => void;
  toggleMinimize: () => void;
  clearConversation: () => void;
  setPageContext: (context: PageContext) => void;
  pageContext: PageContext | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [pageContext, setPageContext] = useState<PageContext | null>(null);

  const [state, setState] = useState<ChatState>(() => {
    // Initialize from localStorage
    const saved = getCurrentConversation();
    return {
      messages: saved?.messages || [],
      isOpen: false,
      isMinimized: true,
      isStreaming: false,
      conversationId: saved?.id || null,
      error: null,
      rateLimitRemaining: 20,
    };
  });

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (state.messages.length > 0 && state.conversationId) {
      saveCurrentConversation({
        id: state.conversationId,
        title: state.messages[0]?.content.substring(0, 50) || 'New Conversation',
        messages: state.messages,
        lastMessageAt: Date.now(),
        pageContext: pageContext?.page,
      });
    }
  }, [state.messages, state.conversationId, pageContext]);

  /**
   * Send a chat message with SSE streaming
   */
  const sendMessage = useCallback(async (message: string, context?: PageContext) => {
    if (!message.trim() || state.isStreaming) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
      conversationId: state.conversationId || undefined,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isStreaming: true,
      error: null,
    }));

    // Create placeholder for assistant message
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, assistantMessage],
    }));

    try {
      let fullResponse = '';
      let newConversationId = state.conversationId;

      // Stream the response
      const stream = sendChatMessage({
        message,
        conversationId: state.conversationId || undefined,
        pageContext: context || pageContext || undefined,
      });

      for await (const event of stream) {
        switch (event.type) {
          case 'start':
            if (event.conversationId && !newConversationId) {
              newConversationId = event.conversationId;
              setState(prev => ({
                ...prev,
                conversationId: event.conversationId || prev.conversationId,
              }));
            }
            break;

          case 'content':
            if (event.text) {
              fullResponse += event.text;

              // Update assistant message with streaming content
              setState(prev => ({
                ...prev,
                messages: prev.messages.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: fullResponse }
                    : msg
                ),
              }));
            }
            break;

          case 'done':
            setState(prev => ({
              ...prev,
              isStreaming: false,
              messages: prev.messages.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, conversationId: event.conversationId }
                  : msg
              ),
            }));
            break;

          case 'error':
            throw new Error(event.error?.message || 'Chat error occurred');
        }
      }

      // Update rate limit
      setState(prev => ({
        ...prev,
        rateLimitRemaining: Math.max(0, prev.rateLimitRemaining - 1),
      }));

    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';

      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage,
        // Remove the placeholder assistant message on error
        messages: prev.messages.filter(msg => msg.id !== assistantMessageId),
      }));

      toast({
        title: 'Chat Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [state.conversationId, state.isStreaming, pageContext, toast]);

  /**
   * Open chat widget
   */
  const openChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true, isMinimized: false }));
  }, []);

  /**
   * Close chat widget
   */
  const closeChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Toggle minimize state
   */
  const toggleMinimize = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  /**
   * Clear current conversation
   */
  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      conversationId: null,
      error: null,
    }));
    clearCurrentConversation();
  }, []);

  const value: ChatContextValue = {
    state,
    sendMessage,
    openChat,
    closeChat,
    toggleMinimize,
    clearConversation,
    setPageContext,
    pageContext,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Hook to use chat context
 */
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
