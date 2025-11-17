/**
 * ChatInput Component
 * Message input with K.I.T.T. styling and typing indicator
 */

import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  disabled = false,
  isStreaming = false,
  placeholder = 'Ask K.I.T.T. anything about classic cars...',
  maxLength = 2000,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() || disabled || isStreaming) return;

    onSend(message.trim());
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const remainingChars = maxLength - message.length;
  const isNearLimit = remainingChars < 100;

  return (
    <div className="relative">
      {/* Input Container */}
      <div className="relative bg-black/40 border border-purple-500/30 rounded-2xl p-3 focus-within:border-purple-500/50 transition-colors">
        {/* K.I.T.T. Scanner Glow */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-purple-500/10 to-transparent pointer-events-none"
        />

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          maxLength={maxLength}
          className={cn(
            'min-h-[44px] max-h-[120px] bg-transparent border-0 resize-none',
            'text-gray-100 placeholder:text-gray-500',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            'pr-12' // Space for send button
          )}
          rows={1}
        />

        {/* Send Button */}
        <div className="absolute right-3 bottom-3">
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled || isStreaming}
            size="sm"
            className={cn(
              'h-9 w-9 rounded-full p-0',
              'bg-gradient-to-br from-purple-600 to-purple-700',
              'hover:from-purple-500 hover:to-purple-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Character Counter */}
      {isNearLimit && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-6 right-0 text-xs text-gray-500"
        >
          <span className={cn(remainingChars < 20 && 'text-red-400')}>
            {remainingChars} characters remaining
          </span>
        </motion.div>
      )}

      {/* Keyboard Hint */}
      {!isStreaming && (
        <div className="mt-2 text-xs text-gray-600 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">Enter</kbd> to send,{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">Shift+Enter</kbd> for new line
        </div>
      )}
    </div>
  );
}
