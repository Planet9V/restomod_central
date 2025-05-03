import { useState, useEffect, useRef } from "react";
import Navigation from "./Navigation";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  // Handle scroll behavior for header with enhanced effects
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Detect if user has scrolled beyond threshold
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY.current + 5) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current - 5) {
        setScrollDirection('up');
      }
      
      // Store current scroll position
      lastScrollY.current = currentScrollY;
      setScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Apply blur effect based on scroll depth
  const calculateBlur = () => {
    if (!isScrolled) return 0;
    // Max blur of 10px when scrolled 300px down
    const maxBlur = 10;
    const maxScrollForBlur = 300;
    const blur = Math.min((scrollY / maxScrollForBlur) * maxBlur, maxBlur);
    return Math.floor(blur);
  };

  // Calculate header transform for hide/show effect
  const headerTransform = () => {
    if (!isScrolled) return 'translateY(0)';
    if (scrollDirection === 'down' && scrollY > 300) return 'translateY(-100%)';
    return 'translateY(0)';
  };

  return (
    <header
      ref={headerRef}
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${isScrolled ? "shadow-lg" : ""}`}
      style={{
        transform: headerTransform(),
        backdropFilter: isScrolled ? `blur(${calculateBlur()}px)` : 'none',
        background: isScrolled ? 'rgba(21, 21, 21, 0.85)' : 'transparent'
      }}
    >
      <Navigation isTransparent={!isScrolled} isDarkMode={true} />
    </header>
  );
};

export default Header;
