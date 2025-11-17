/**
 * ChatMessage Component
 * Displays individual chat messages with K.I.T.T. luxury styling
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, timestamp, isStreaming = false }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 mb-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-gradient-to-br from-purple-500 to-purple-700'
            : 'bg-gradient-to-br from-purple-900 to-black border border-purple-500/30'
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-purple-300" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          'flex flex-col max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-3 relative',
            isUser
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
              : 'bg-black/40 border border-purple-500/20 text-gray-100'
          )}
        >
          {/* K.I.T.T. Scanner Effect for Assistant */}
          {!isUser && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-scanner" />
            </div>
          )}

          {/* Message Content */}
          <div className="relative z-10">
            {content ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {content}
              </p>
            ) : (
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            {/* Streaming Indicator */}
            {isStreaming && content && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block ml-1 w-1.5 h-4 bg-purple-400 rounded"
              />
            )}
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 mt-1 px-2">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </motion.div>
  );
}
