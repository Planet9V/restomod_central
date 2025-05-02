import { useState, useEffect } from "react";
import { Link } from "wouter";
import { NAV_LINKS } from "@/lib/constants";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll behavior for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-charcoal shadow-md py-4" : "py-6"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-playfair font-bold tracking-tight">
              McKenney <span className="text-gold">&</span> Skinny's
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide uppercase">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gold transition-colors duration-200">
              {link.name}
            </Link>
          ))}
          <Link href="#contact" className="bg-burgundy hover:bg-opacity-90 transition-all duration-200 px-6 py-3 rounded-sm">
            Consultation
          </Link>
        </div>
        
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>
      
      {/* Mobile menu */}
      <div
        className={`px-4 pt-2 pb-4 bg-charcoal md:hidden ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        {NAV_LINKS.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className="block py-3 text-sm font-medium tracking-wide uppercase hover:text-gold transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <Link 
          href="#contact"
          className="block py-3 text-sm font-medium tracking-wide uppercase hover:text-gold transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Consultation
        </Link>
      </div>
    </header>
  );
};

export default Header;
