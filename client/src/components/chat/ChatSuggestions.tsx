/**
 * ChatSuggestions Component
 * Quick action buttons for common queries
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Car, Calendar, TrendingUp, MapPin, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Suggestion {
  icon: React.ReactNode;
  label: string;
  prompt: string;
  category: 'search' | 'events' | 'market' | 'general';
}

export interface ChatSuggestionsProps {
  onSelect: (prompt: string) => void;
  pageContext?: string;
  disabled?: boolean;
}

// Default suggestions
const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    icon: <Car className="w-4 h-4" />,
    label: 'Find 1967 Mustangs',
    prompt: 'Show me available 1967 Ford Mustangs under $60,000',
    category: 'search',
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    label: 'Events near me',
    prompt: 'What classic car events are happening near me this month?',
    category: 'events',
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    label: 'Investment advice',
    prompt: 'What are the best investment-grade classic cars right now?',
    category: 'market',
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    label: 'Surprise me',
    prompt: 'Show me something interesting from your inventory',
    category: 'general',
  },
];

// Page-specific suggestions
const PAGE_SUGGESTIONS: Record<string, Suggestion[]> = {
  'car-detail': [
    {
      icon: <Search className="w-4 h-4" />,
      label: 'Tell me about this car',
      prompt: 'Tell me more about this vehicle and its investment potential',
      category: 'general',
    },
    {
      icon: <Car className="w-4 h-4" />,
      label: 'Find similar',
      prompt: 'Find similar vehicles in your inventory',
      category: 'search',
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Market analysis',
      prompt: 'What is the market trend for this make and model?',
      category: 'market',
    },
  ],
  'event-detail': [
    {
      icon: <MapPin className="w-4 h-4" />,
      label: 'How do I get there?',
      prompt: 'How do I get to this event and what should I know?',
      category: 'events',
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'Similar events',
      prompt: 'Find similar car shows and events near me',
      category: 'events',
    },
  ],
  'cars-for-sale': [
    {
      icon: <Search className="w-4 h-4" />,
      label: 'Refine my search',
      prompt: 'Help me refine my search based on what I am looking for',
      category: 'search',
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Best investments',
      prompt: 'Which cars in these results are the best investments?',
      category: 'market',
    },
  ],
  'events': [
    {
      icon: <MapPin className="w-4 h-4" />,
      label: 'Events near me',
      prompt: 'What classic car events are happening near me?',
      category: 'events',
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'This weekend',
      prompt: 'What car shows are happening this weekend?',
      category: 'events',
    },
  ],
};

export function ChatSuggestions({ onSelect, pageContext, disabled = false }: ChatSuggestionsProps) {
  // Get suggestions based on page context
  const suggestions = pageContext && PAGE_SUGGESTIONS[pageContext]
    ? PAGE_SUGGESTIONS[pageContext]
    : DEFAULT_SUGGESTIONS;

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 font-medium px-1">
        Quick Actions
      </div>

      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              onClick={() => onSelect(suggestion.prompt)}
              disabled={disabled}
              variant="outline"
              className={cn(
                'w-full h-auto py-3 px-3 flex flex-col items-start gap-2',
                'bg-black/20 border-purple-500/20 hover:border-purple-500/40',
                'hover:bg-purple-500/10 transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'group'
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
                  {suggestion.icon}
                </div>
                <span className="text-xs font-medium text-gray-200 text-left leading-tight">
                  {suggestion.label}
                </span>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 pt-2">
        {Array.from(new Set(suggestions.map(s => s.category))).map(category => (
          <span
            key={category}
            className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  );
}
