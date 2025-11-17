/**
 * ChatWidget Component
 * Main K.I.T.T. AI chat widget with floating UI
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Minus,
  RotateCcw,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSuggestions } from './ChatSuggestions';
import { KittVoiceWave, KittScanner } from './KittVoiceWave';

export function ChatWidget() {
  const {
    state,
    sendMessage,
    openChat,
    closeChat,
    toggleMinimize,
    clearConversation,
    pageContext,
  } = useChat();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && !state.isMinimized) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [state.messages, state.isMinimized]);

  // Check if user has scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleSuggestionSelect = (prompt: string) => {
    sendMessage(prompt, pageContext || undefined);
  };

  // Keyboard shortcut: Cmd/Ctrl + K to open chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!state.isOpen) {
          openChat();
        } else {
          closeChat();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, openChat, closeChat]);

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!state.isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={openChat}
              className={cn(
                'h-14 w-14 rounded-full shadow-2xl',
                'bg-gradient-to-br from-purple-600 via-purple-700 to-black',
                'hover:from-purple-500 hover:via-purple-600 hover:to-black',
                'border border-purple-500/50',
                'relative overflow-hidden group'
              )}
            >
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 bg-purple-500/30 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <MessageCircle className="w-6 h-6 text-white relative z-10" />

              {/* Unread indicator (if needed in future) */}
              {/* <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" /> */}
            </Button>

            {/* Keyboard hint */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -top-10 right-0 px-3 py-1.5 bg-black/80 border border-purple-500/30 rounded-lg text-xs text-gray-300 whitespace-nowrap"
            >
              Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">⌘K</kbd> to chat
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50',
              // Mobile: full screen
              'bottom-0 left-0 right-0 top-0 md:top-auto',
              // Desktop: bottom-right corner
              'md:bottom-6 md:right-6 md:left-auto',
              'md:w-[400px] md:h-[600px]',
              'md:rounded-2xl',
              'shadow-2xl'
            )}
          >
            <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-purple-900/20 border border-purple-500/30 md:rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 bg-black/60 border-b border-purple-500/30 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-black border border-purple-500/50 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">K.I.T.T.</h3>
                      <p className="text-xs text-gray-400">
                        {state.isStreaming ? 'Responding...' : 'Your AI Automotive Assistant'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={clearConversation}
                      disabled={state.messages.length === 0}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-purple-500/10"
                      title="Clear conversation"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-400" />
                    </Button>

                    <Button
                      onClick={toggleMinimize}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-purple-500/10 hidden md:flex"
                      title="Minimize"
                    >
                      <Minus className="w-4 h-4 text-gray-400" />
                    </Button>

                    <Button
                      onClick={closeChat}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-purple-500/10"
                      title="Close"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </div>

                {/* K.I.T.T. Voice Wave */}
                {state.isStreaming && (
                  <div className="mt-2">
                    <KittVoiceWave isActive={state.isStreaming} />
                  </div>
                )}

                {/* Scanner line */}
                <KittScanner className="mt-2" />
              </div>

              {/* Messages Area */}
              {!state.isMinimized && (
                <>
                  <ScrollArea
                    ref={scrollAreaRef}
                    className="flex-1 px-4 py-4"
                    onScrollCapture={handleScroll}
                  >
                    {state.messages.length === 0 ? (
                      // Empty state with suggestions
                      <div className="space-y-6">
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-purple-300" />
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-2">
                            Welcome to K.I.T.T.
                          </h4>
                          <p className="text-sm text-gray-400 max-w-xs mx-auto">
                            Your Knowledge Intelligence for Timeless Transportation.
                            Ask me anything about classic cars, events, or market insights.
                          </p>
                        </div>

                        <ChatSuggestions
                          onSelect={handleSuggestionSelect}
                          pageContext={pageContext?.page}
                          disabled={state.isStreaming}
                        />
                      </div>
                    ) : (
                      // Messages
                      <div className="space-y-1">
                        {state.messages.map((message, index) => (
                          <ChatMessage
                            key={message.id}
                            role={message.role}
                            content={message.content}
                            timestamp={message.timestamp}
                            isStreaming={
                              state.isStreaming &&
                              index === state.messages.length - 1 &&
                              message.role === 'assistant'
                            }
                          />
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Scroll to bottom button */}
                  <AnimatePresence>
                    {showScrollButton && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-24 right-8"
                      >
                        <Button
                          onClick={scrollToBottom}
                          size="sm"
                          className="h-8 w-8 rounded-full p-0 bg-purple-600 hover:bg-purple-500 shadow-lg"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input Area */}
                  <div className="flex-shrink-0 border-t border-purple-500/30 bg-black/40 px-4 py-4">
                    <ChatInput
                      onSend={(message) => sendMessage(message, pageContext || undefined)}
                      disabled={false}
                      isStreaming={state.isStreaming}
                    />

                    {/* Rate limit indicator */}
                    {state.rateLimitRemaining < 5 && (
                      <div className="mt-2 text-xs text-amber-400 text-center">
                        {state.rateLimitRemaining} messages remaining this minute
                      </div>
                    )}

                    {/* Error message */}
                    {state.error && (
                      <div className="mt-2 text-xs text-red-400 text-center">
                        {state.error}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Minimized State */}
              {state.isMinimized && (
                <div className="flex-1 flex items-center justify-center p-4">
                  <Button
                    onClick={toggleMinimize}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    Click to expand
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
