import { useState } from "react";
import { Link, useLocation } from "wouter";
import { NAV_LINKS } from "@/lib/constants";

interface NavigationProps {
  isTransparent?: boolean;
  isDarkMode?: boolean;
  hasConsultationButton?: boolean;
}

const Navigation = ({ 
  isTransparent = false, 
  isDarkMode = false,
  hasConsultationButton = true
}: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  
  // Determine text color based on dark mode
  const textColorClass = isDarkMode ? "text-white" : "text-charcoal";
  
  // Determine background color based on transparency
  const bgClass = isTransparent 
    ? "bg-transparent" 
    : isDarkMode ? "bg-charcoal" : "bg-white";
  
  return (
    <nav className={`w-full z-50 transition-all duration-300 ${bgClass}`}>
      {/* Main navigation bar - Porsche style */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo area */}
        <Link href="/" className="flex items-center space-x-2">
          <span className={`text-xl font-playfair font-bold tracking-tight ${textColorClass}`}>
            McKenney <span className="text-gold">&</span> Skinny's
          </span>
        </Link>
        
        {/* Desktop Navigation - center aligned links */}
        <div className="hidden md:flex items-center justify-center flex-1 space-x-8 text-sm font-medium tracking-wide uppercase">
          {NAV_LINKS.slice(0, 5).map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${textColorClass} hover:text-gold transition-colors duration-200 ${
                location === link.href ? "text-gold" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        {/* Right side CTA and mobile menu */}
        <div className="flex items-center">
          {/* Desktop consultation button */}
          {hasConsultationButton && (
            <Link href="#contact" className="hidden md:block bg-burgundy hover:bg-opacity-90 text-white transition-all duration-200 px-6 py-3 mr-4 rounded-sm">
              Consultation
            </Link>
          )}
          
          {/* Hamburger menu - Porsche style */}
          <button
            className={`focus:outline-none ${textColorClass}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen 
                    ? "M6 18L18 6M6 6l12 12" // X shape when open
                    : "M4 6h16M4 12h16M4 18h16" // Hamburger when closed
                  }
                />
              </svg>
              <span className="text-xs mt-1">Menu</span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile menu overlay - Porsche inspired */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-charcoal/95 z-50 flex flex-col pt-20 pb-8 px-6">
          <div className="flex flex-col space-y-6 mt-8">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-white text-2xl font-playfair font-bold hover:text-gold transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {hasConsultationButton && (
              <Link 
                href="#contact"
                className="text-white text-2xl font-playfair font-bold hover:text-gold transition-colors duration-200 mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Consultation
              </Link>
            )}
          </div>
          
          <div className="mt-auto">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <p className="text-xl font-bold">Get in touch</p>
                <p className="text-sm mt-2">contact@mckenneyandskinnys.com</p>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-burgundy text-white px-6 py-3 rounded-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;