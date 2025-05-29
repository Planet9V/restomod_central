import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, TrendingUp, CheckCircle, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  vehicle: string;
  rating: number;
  content: string;
  investmentReturn?: string;
  purchaseDate?: string;
  verified: boolean;
  imageUrl?: string;
}

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data: testimonials, isLoading, error } = useQuery<{ testimonials: Testimonial[] }>({
    queryKey: ['/api/testimonials'],
    queryFn: async () => {
      const response = await fetch('/api/testimonials');
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      return response.json();
    },
  });

  const testimonialsData = testimonials?.testimonials || [];

  // Auto-rotate testimonials
  useEffect(() => {
    if (isPaused || testimonialsData.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonialsData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, testimonialsData.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonialsData.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);
  };

  if (isLoading) {
    return (
      <div className="py-16 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-700 rounded w-1/3 mx-auto"></div>
            <div className="h-32 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testimonialsData.length) {
    return null;
  }

  const currentTestimonial = testimonialsData[currentIndex];

  return (
    <section className="py-16 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Investment Success Stories
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real customers, authentic results, verified returns on classic car investments
          </p>
        </motion.div>

        {/* Testimonials Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-2xl">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-3 gap-8 items-center">
                    {/* Customer Info */}
                    <div className="text-center md:text-left">
                      <div className="relative inline-block mb-4">
                        <img
                          src={currentTestimonial.imageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`}
                          alt={currentTestimonial.name}
                          className="w-20 h-20 rounded-full mx-auto md:mx-0 object-cover border-4 border-blue-500"
                        />
                        {currentTestimonial.verified && (
                          <CheckCircle className="absolute -bottom-1 -right-1 h-6 w-6 text-green-400 bg-slate-800 rounded-full" />
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-1">{currentTestimonial.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{currentTestimonial.location}</p>
                      <p className="text-blue-400 font-medium text-sm">{currentTestimonial.vehicle}</p>
                      
                      {/* Star Rating */}
                      <div className="flex justify-center md:justify-start gap-1 mt-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < currentTestimonial.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Testimonial Content */}
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Quote className="absolute top-0 left-0 h-8 w-8 text-blue-400/30 -translate-x-2 -translate-y-2" />
                        <blockquote className="text-gray-200 text-lg leading-relaxed pl-6">
                          "{currentTestimonial.content}"
                        </blockquote>
                      </div>
                      
                      {/* Investment Return Info */}
                      {currentTestimonial.investmentReturn && (
                        <div className="mt-6 p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
                          <div className="flex items-center gap-2 text-green-400">
                            <TrendingUp className="h-5 w-5" />
                            <span className="font-semibold">Investment Return: {currentTestimonial.investmentReturn}</span>
                          </div>
                          {currentTestimonial.purchaseDate && (
                            <p className="text-gray-400 text-sm mt-1">
                              Since purchase in {currentTestimonial.purchaseDate}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {testimonialsData.length > 1 && (
            <>
              <Button
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-700/80 hover:bg-slate-600 text-white p-2 rounded-full shadow-lg"
                size="sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-700/80 hover:bg-slate-600 text-white p-2 rounded-full shadow-lg"
                size="sm"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {testimonialsData.length > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {testimonialsData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-400 scale-125' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
            <h4 className="text-white font-semibold">Verified Purchases</h4>
            <p className="text-gray-400 text-sm">All testimonials from authenticated customers</p>
          </div>
          
          <div className="flex flex-col items-center">
            <TrendingUp className="h-8 w-8 text-blue-400 mb-2" />
            <h4 className="text-white font-semibold">Real Returns</h4>
            <p className="text-gray-400 text-sm">Documented investment performance</p>
          </div>
          
          <div className="flex flex-col items-center">
            <Star className="h-8 w-8 text-yellow-400 mb-2" />
            <h4 className="text-white font-semibold">Expert Guidance</h4>
            <p className="text-gray-400 text-sm">Professional investment advice included</p>
          </div>
        </div>
      </div>
    </section>
  );
}