import { useEffect, useRef, useState } from 'react';
import { useParams } from 'wouter';
import { useLuxuryShowcase } from '@/hooks/use-luxury-showcase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ChevronDown, ChevronRight, ChevronLeft, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

const LuxuryShowcasePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: showcase, isLoading, error } = useLuxuryShowcase(slug);
  
  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Scroll animation references
  const heroRef = useRef<HTMLDivElement>(null);
  const specSectionRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef(null);
  
  // Toggle video playback
  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };
  
  // Scroll to specifications section
  const scrollToSpecifications = () => {
    specSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Set up parallax and fade effects on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Hero parallax effect
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${scrollPosition * 0.4}px)`;
      }
      
      // Additional scroll animations can be added here
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Gallery navigation
  const goToNextImage = () => {
    if (showcase) {
      setCurrentIndex((prevIndex) => 
        prevIndex === showcase.galleryImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  const goToPrevImage = () => {
    if (showcase) {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? showcase.galleryImages.length - 1 : prevIndex - 1
      );
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto py-12">
          <Skeleton className="w-3/4 h-12 bg-gray-800 mb-4" />
          <Skeleton className="w-1/2 h-8 bg-gray-800 mb-12" />
          <Skeleton className="w-full h-[70vh] bg-gray-800 mb-20" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <Skeleton className="w-3/4 h-10 bg-gray-800 mb-4" />
              <Skeleton className="w-full h-24 bg-gray-800" />
            </div>
            <div>
              <Skeleton className="w-3/4 h-10 bg-gray-800 mb-4" />
              <Skeleton className="w-full h-24 bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !showcase) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 lg:px-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Showcase Not Found</h1>
          <p className="text-xl mb-8 text-gray-400">
            We couldn't find the luxury showcase you're looking for.
          </p>
          <Link href="/">
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* Hero Section with Video Background */}
      <div className="relative h-screen overflow-hidden">
        <div 
          ref={heroRef}
          className="absolute inset-0 w-full h-full z-0 transform scale-110"
        >
          {showcase.videoUrl ? (
            <div className="relative w-full h-full">
              <video 
                ref={videoRef}
                className="absolute w-full h-full object-cover" 
                muted 
                loop
                playsInline
                poster={showcase.heroImage}
              >
                <source src={showcase.videoUrl} type="video/mp4" />
              </video>
              <div className="absolute bottom-10 right-10 z-20">
                <button 
                  onClick={togglePlay} 
                  className="bg-black/50 backdrop-blur-sm p-4 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  {playing ? <Pause size={24} /> : <Play size={24} />}
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="w-full h-full bg-center bg-cover"
              style={{ backgroundImage: `url(${showcase.heroImage})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90" />
        </div>
        
        {/* Hero Content */}
        <div className="relative h-full z-10 flex flex-col justify-end pb-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair mb-4 tracking-tight font-bold">
            {showcase.title}
          </h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-light mb-8 max-w-3xl text-gray-300">
            {showcase.subtitle}
          </h2>
          <p className="text-base md:text-lg max-w-2xl leading-relaxed mb-10 text-gray-400">
            {showcase.shortDescription}
          </p>
          <button 
            onClick={scrollToSpecifications}
            className="flex items-center text-gray-300 hover:text-white transition-colors duration-300 animate-bounce-subtle"
          >
            Explore <ChevronDown className="ml-2" />
          </button>
        </div>
      </div>
      
      {/* Specifications Section */}
      <div 
        ref={specSectionRef}
        className="py-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair mb-8 tracking-tight font-medium">
              Restomod Specifications
            </h2>
            <div className="space-y-12">
              {showcase.specifications.map((spec, index) => (
                <div key={index} className="border-b border-gray-800 pb-8">
                  <h3 className="text-xl font-medium mb-4">{spec.category}</h3>
                  <dl className="space-y-2">
                    {spec.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <dt className="text-gray-400">{item.label}</dt>
                        <dd className="font-medium">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
          
          {/* Gallery Section */}
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair mb-8 tracking-tight font-medium">
              Gallery
            </h2>
            <div className="relative group">
              <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg">
                {showcase.galleryImages.map((image, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "absolute inset-0 w-full h-full transition-opacity duration-500",
                      currentIndex === index ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <img 
                      src={image} 
                      alt={`${showcase.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              {/* Gallery Controls */}
              <div className="flex justify-between mt-4">
                <button 
                  onClick={goToPrevImage}
                  className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex space-x-2">
                  {showcase.galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        currentIndex === index ? "bg-white" : "bg-gray-600 hover:bg-gray-400"
                      )}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
                <button 
                  onClick={goToNextImage}
                  className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detail Sections */}
      <div className="py-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-playfair mb-12 tracking-tight font-medium text-center">
          The Definitive Restomod
        </h2>
        
        <div className="space-y-32" ref={detailsRef}>
          {showcase.detailSections.sort((a, b) => a.order - b.order).map((section, index) => (
            <div 
              key={index}
              className={cn(
                "grid grid-cols-1 gap-10",
                index % 2 === 0 ? "md:grid-cols-[3fr_2fr]" : "md:grid-cols-[2fr_3fr] md:order-first" 
              )}
            >
              <div className={cn(
                "flex flex-col justify-center",
                index % 2 === 0 ? "md:pr-10" : "md:pl-10 md:order-last"
              )}>
                <h3 className="text-2xl md:text-3xl font-playfair mb-6 tracking-tight font-medium">
                  {section.title}
                </h3>
                <div 
                  className="prose prose-lg prose-invert max-w-none opacity-80"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
              
              {section.image && (
                <div className="h-[300px] md:h-[400px] overflow-hidden rounded-lg">
                  <img 
                    src={section.image} 
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-playfair mb-6 tracking-tight font-medium">
            Create Your Own Legacy
          </h2>
          <p className="text-lg mb-10 text-gray-400">
            Inspired to build your custom restomod? Contact us to start your journey with Skinny's Rod and Custom.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/car-configurator">
              <Button className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto">
                Configure Your Dream Car
              </Button>
            </Link>
            <Link href="/#contact">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black w-full sm:w-auto">
                Request Consultation
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Related Projects */}
      {showcase.project && (
        <div className="py-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-playfair mb-12 tracking-tight font-medium">
            Related Build
          </h2>
          <Link href={`/projects/${showcase.project.slug}`}>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 group cursor-pointer">
              <div className="h-[300px] overflow-hidden rounded-lg">
                <img 
                  src={showcase.project.imageUrl} 
                  alt={showcase.project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-medium mb-4 group-hover:text-burgundy transition-colors duration-300">
                  {showcase.project.title}
                </h3>
                <p className="text-gray-400 mb-6">{showcase.project.subtitle}</p>
                <div className="flex items-center text-burgundy">
                  View Project <ChevronRight className="ml-2" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LuxuryShowcasePage;
