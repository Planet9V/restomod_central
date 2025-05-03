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
        {/* Logo area with premium hover effects */}
        <div className="relative group">
          <Link href="/" className="flex items-center space-x-2">
            <span className={`text-xl font-playfair font-bold tracking-tight ${textColorClass} transition-all duration-300 group-hover:text-gold relative`}>
              <span className="transition-transform duration-300 inline-block group-hover:scale-105">McKenney</span> 
              <span className="text-gold transition-all duration-300 inline-block group-hover:scale-110 group-hover:rotate-3">&</span> 
              <span className="transition-transform duration-300 inline-block group-hover:scale-105">Skinny's</span>
              {/* Enhanced hover indicator */}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-500"></span>
            </span>
          </Link>
          {/* Subtle shine animation on hover */}
          <span className="absolute inset-0 w-0 opacity-0 group-hover:opacity-20 group-hover:w-full bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-700 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></span>
        </div>
        
        {/* Desktop Navigation - center aligned links with micro-interactions */}
        <div className="hidden md:flex items-center justify-center flex-1 space-x-8 text-sm font-medium tracking-wide uppercase">
          {NAV_LINKS.slice(0, 5).map((link) => (
            <div key={link.href} className="group relative">
              <Link 
                href={link.href} 
                className={`${textColorClass} group-hover:text-gold transition-all duration-300 py-2 ${
                  location === link.href ? "text-gold" : ""
                }`}
              >
                {link.name}
                {/* Animated underline effect */}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full ${
                  location === link.href ? "w-full" : ""
                }`}></span>
              </Link>
              {/* Subtle tooltip on hover - Porsche style */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-charcoal/90 text-white text-xs py-1 px-2 rounded-sm whitespace-nowrap">
                  {link.name}
                </div>
                <div className="w-2 h-2 bg-charcoal/90 transform rotate-45 absolute -top-1 left-1/2 -translate-x-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Right side CTA and mobile menu */}
        <div className="flex items-center">
          {/* Desktop consultation button with micro-interactions */}
          {hasConsultationButton && (
            <div className="hidden md:block relative group mr-4">
              <Link 
                href="#contact" 
                className="relative z-10 bg-burgundy text-white px-6 py-3 rounded-sm block overflow-hidden"
              >
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-y-0 block">
                  Consultation
                </span>
                {/* Animated background slide effect */}
                <span className="absolute inset-0 bg-gold transform translate-y-full transition-transform duration-300 group-hover:translate-y-0"></span>
              </Link>
              {/* Subtle glow effect */}
              <div className="absolute -inset-0.5 bg-gold/20 rounded-sm opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
            </div>
          )}
          
          {/* Hamburger menu with micro-interactions */}
          <button
            className={`focus:outline-none group ${textColorClass} relative`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105">
              <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 transition-opacity duration-300"
                  style={{ opacity: isMobileMenuOpen ? 0 : 1, position: 'absolute' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 transition-opacity duration-300"
                  style={{ opacity: isMobileMenuOpen ? 1 : 0, position: 'absolute' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <span className="text-xs mt-1 transition-colors duration-300 group-hover:text-gold">Menu</span>
            </div>
            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-pulse"></span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu overlay with premium micro-interactions */}
      <div 
        className={`fixed inset-0 bg-charcoal/95 z-50 flex flex-col pt-20 pb-8 px-6 transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col space-y-6 mt-8">
          {NAV_LINKS.map((link, index) => (
            <div 
              key={link.href}
              className="overflow-hidden"
              style={{ 
                transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                opacity: isMobileMenuOpen ? 1 : 0,
                transition: `transform 0.5s ease ${0.1 + index * 0.1}s, opacity 0.5s ease ${0.1 + index * 0.1}s`
              }}
            >
              <Link 
                href={link.href}
                className="text-white text-2xl font-playfair font-bold hover:text-gold transition-all duration-300 group flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative">
                  {link.name}
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                </span>
                <svg 
                  className="w-5 h-5 ml-2 transform transition-transform duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
          
          {hasConsultationButton && (
            <div 
              className="overflow-hidden mt-4"
              style={{ 
                transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                opacity: isMobileMenuOpen ? 1 : 0,
                transition: `transform 0.5s ease ${0.1 + NAV_LINKS.length * 0.1}s, opacity 0.5s ease ${0.1 + NAV_LINKS.length * 0.1}s`
              }}
            >
              <Link 
                href="#contact"
                className="text-white text-2xl font-playfair font-bold hover:text-gold transition-all duration-300 group flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative">
                  Consultation
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                </span>
                <svg 
                  className="w-5 h-5 ml-2 transform transition-transform duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
        
        <div 
          className="mt-auto"
          style={{ 
            transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: 'transform 0.5s ease 0.4s, opacity 0.5s ease 0.4s'
          }}
        >
          <div className="flex justify-between items-center">
            <div className="text-white">
              <p className="text-xl font-bold">Get in touch</p>
              <p className="text-sm mt-2 text-gold">contact@mckenneyandskinnys.com</p>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative bg-burgundy text-white px-6 py-3 rounded-sm overflow-hidden group"
            >
              <span className="relative z-10">Close</span>
              <span className="absolute inset-0 bg-gold transform translate-y-full transition-transform duration-300 group-hover:translate-y-0"></span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;