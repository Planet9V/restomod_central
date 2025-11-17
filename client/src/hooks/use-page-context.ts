/**
 * usePageContext Hook
 * Detects current page and provides context for AI chat
 */

import { useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useChat } from '@/contexts/ChatContext';
import { PageContext } from '@/lib/chatService';

/**
 * Hook to automatically set page context for the chat widget
 * This enables context-aware suggestions based on the current page
 */
export function usePageContext(additionalContext?: Partial<PageContext>) {
  const [location] = useLocation();
  const { setPageContext } = useChat();

  useEffect(() => {
    // Determine page type from location
    let page = 'home';
    let currentItemId: number | undefined;
    let currentItemType: 'car' | 'event' | undefined;

    if (location.includes('/vehicles/')) {
      page = 'car-detail';
      const match = location.match(/\/vehicles\/(\d+)/);
      if (match) {
        currentItemId = parseInt(match[1]);
        currentItemType = 'car';
      }
    } else if (location.includes('/events/') || location.includes('/car-show-events/')) {
      if (location.split('/').length > 2) {
        page = 'event-detail';
        // For slug-based routes, we'd need to fetch the ID
        // For now, mark it as event detail without ID
        currentItemType = 'event';
      } else {
        page = 'events';
      }
    } else if (location.includes('/cars-for-sale')) {
      page = 'cars-for-sale';
    } else if (location.includes('/market-analysis')) {
      page = 'market-analysis';
    } else if (location.includes('/car-configurator')) {
      page = 'configurator';
    } else if (location.includes('/showcases')) {
      page = 'showcases';
    } else if (location === '/') {
      page = 'home';
    }

    // Build page context
    const context: PageContext = {
      page,
      currentItemId,
      currentItemType,
      ...additionalContext,
    };

    setPageContext(context);
  }, [location, setPageContext, additionalContext]);
}

/**
 * Hook to provide filters context from search/filter state
 */
export function useChatFiltersContext(filters: Record<string, any>) {
  const { setPageContext, pageContext } = useChat();

  useEffect(() => {
    if (pageContext) {
      setPageContext({
        ...pageContext,
        filters,
      });
    }
  }, [filters, pageContext, setPageContext]);
}
