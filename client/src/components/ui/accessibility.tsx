import { useEffect } from "react";

/**
 * Skip to main content link for keyboard navigation and screen readers
 * Improves accessibility by allowing users to skip navigation
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

/**
 * Announces page changes to screen readers
 * Improves accessibility for route navigation
 */
export function RouteAnnouncer({ children }: { children: string }) {
  useEffect(() => {
    // Announce route change to screen readers
    const announcement = document.getElementById('route-announcer');
    if (announcement) {
      announcement.textContent = children;
    }
  }, [children]);

  return (
    <div
      id="route-announcer"
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    />
  );
}

/**
 * Visually hidden text for screen readers only
 * Use with sr-only class for better accessibility
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/**
 * Focus trap for modals and dialogs
 * Ensures keyboard navigation stays within modal
 */
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Let parent component handle escape
        container.dispatchEvent(new CustomEvent('escape-key'));
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscKey);
    };
  }, [isActive, containerRef]);
}

/**
 * Hook to handle keyboard navigation for lists
 * Allows arrow key navigation through items
 */
export function useKeyboardNavigation(items: number, onSelect: (index: number) => void) {
  return (e: React.KeyboardEvent, currentIndex: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        onSelect(Math.min(currentIndex + 1, items - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        onSelect(Math.max(currentIndex - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        onSelect(0);
        break;
      case 'End':
        e.preventDefault();
        onSelect(items - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Item should be selected by parent
        break;
    }
  };
}
