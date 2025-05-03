import { useState, useEffect } from "react";
import { Pause, Play } from "lucide-react";
import Navigation from "./Navigation";

interface VideoHeaderProps {
  videoSrc?: string;
  imageSrc?: string; // Fallback image
  title: string;
  subtitle?: string;
  hashtag?: string;
  showNavigation?: boolean; // Whether to show the navigation menu
}

const VideoHeader = ({
  videoSrc,
  imageSrc,
  title,
  subtitle,
  hashtag,
  showNavigation = false // Default to false to avoid duplicate navigation
}: VideoHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);

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
        
        {/* Navigation - Only show if showNavigation is true */}
        {showNavigation && (
          <div className="absolute top-0 left-0 right-0">
            <Navigation isTransparent={!isScrolled} isDarkMode={true} hasConsultationButton={false} />
          </div>
        )}
        
        {/* Video Controls - Porsche inspired */}
        {videoSrc && (
          <button
            onClick={toggleVideo}
            className="absolute bottom-8 right-8 bg-burgundy/80 hover:bg-burgundy text-white p-3 rounded-full transition-colors duration-300 z-10"
            aria-label={isVideoPaused ? "Play video" : "Pause video"}
          >
            {isVideoPaused ? (
              <Play className="h-6 w-6" />
            ) : (
              <Pause className="h-6 w-6" />
            )}
          </button>
        )}
        
        {/* Hero Content - Centered for Porsche-inspired look */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          {hashtag && <p className="text-gold text-xl mb-4 font-medium">#{hashtag}</p>}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold max-w-4xl leading-tight mb-4">
            {title}
          </h1>
          {subtitle && <p className="text-xl md:text-2xl max-w-2xl opacity-90">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
};

export default VideoHeader;
