import { useEffect, useState } from "react";

/**
 * PageTransition - A premium micro-interaction component for smooth page transitions
 * Provides a subtle fade and reveal effect when navigating between pages
 */
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial delay for premium feel
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div 
      className="transition-opacity duration-700 ease-in-out relative"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* Premium sequential reveal effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent transform transition-transform duration-1000 ease-out pointer-events-none"
        style={{ 
          transform: isVisible ? "translateY(-100%)" : "translateY(0)",
          opacity: isVisible ? 0 : 0.8,
        }}
      />
      {children}
    </div>
  );
};

export default PageTransition;