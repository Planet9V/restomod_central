import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { NAV_LINKS } from "@/lib/constants";
import { Pause, Play } from "lucide-react";

interface VideoHeaderProps {
  videoSrc?: string;
  imageSrc?: string; // Fallback image
  title: string;
  subtitle?: string;
  hashtag?: string;
  darkMode?: boolean;
}

const VideoHeader = ({
  videoSrc,
  imageSrc,
  title,
  subtitle,
  hashtag,
  darkMode = true
}: VideoHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [_, navigate] = useLocation();

  // Handle scroll behavior for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle video playback
  const toggleVideo = () => {
    const video = document.getElementById('background-video') as HTMLVideoElement;
    if (video) {
      if (video.paused) {
        video.play();
        setIsVideoPaused(false);
      } else {
        video.pause();
        setIsVideoPaused(true);
      }
    }
  };

  return (
    <header className="relative">
      {/* Background Video or Image */}
      <div className="relative w-full h-screen">
        {videoSrc ? (
          <video
            id="background-video"
            autoPlay
            muted
            loop
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : imageSrc ? (
          <div 
            className="absolute w-full h-full bg-cover bg-center" 
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
        ) : null}
        
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Navigation Bar */}
        <nav 
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-charcoal/90 backdrop-blur-sm' : 'bg-transparent'}`}
        >
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-playfair font-bold tracking-tight text-white">
                McKenney <span className="text-gold">&</span> Skinny's
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide uppercase text-white">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-gold transition-colors duration-200">
                  {link.name}
                </Link>
              ))}
              <Link href="/vehicle-archive" className="hover:text-gold transition-colors duration-200">
                Archives
              </Link>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white focus:outline-none"
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
          </div>
          
          {/* Mobile Menu */}
          <div
            className={`px-4 pt-2 pb-4 bg-charcoal md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          >
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="block py-3 text-sm font-medium tracking-wide uppercase text-white hover:text-gold transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/vehicle-archive" 
              className="block py-3 text-sm font-medium tracking-wide uppercase text-white hover:text-gold transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Archives
            </Link>
          </div>
        </nav>
        
        {/* Video Controls */}
        {videoSrc && (
          <button 
            onClick={toggleVideo}
            className="absolute z-10 top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-200"
            aria-label={isVideoPaused ? "Play video" : "Pause video"}
          >
            {isVideoPaused ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </button>
        )}
        
        {/* Header Content */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white">
          <div className="container mx-auto">
            <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-3">
              {title}
            </h1>
            {hashtag && (
              <p className="text-2xl md:text-3xl font-medium mb-6">
                #{hashtag}
              </p>
            )}
            {subtitle && (
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl mb-12">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation (optional) */}
      <div className="absolute bottom-0 left-0 right-0 bg-charcoal/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center md:justify-start items-center py-4 space-x-8 text-white text-sm font-medium">
            <button className="hover:text-gold transition-colors duration-200" onClick={() => navigate('/projects')}>Projects</button>
            <button className="hover:text-gold transition-colors duration-200" onClick={() => navigate('/resources')}>Resources</button>
            <button className="hover:text-gold transition-colors duration-200" onClick={() => navigate('/#about')}>About</button>
            <button className="hover:text-gold transition-colors duration-200" onClick={() => navigate('/#contact')}>Contact</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default VideoHeader;
