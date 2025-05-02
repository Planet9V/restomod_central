import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

const HeroSection = () => {
  const { data: heroData } = useQuery({
    queryKey: ['/api/hero'],
    staleTime: Infinity,
  });

  const heroBackground = heroData?.imageUrl || "https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=2000&auto=format&fit=crop";
  const title = heroData?.title || "Engineering Meets Artistry";
  const subtitle = heroData?.subtitle || "Meticulously crafted restomods that combine precision engineering with concourse-level aesthetics. The perfect fusion of classic soul and modern performance.";

  return (
    <section className="relative h-screen">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 to-charcoal/40 z-10"></div>
        <img
          src={heroBackground}
          alt="Classic car restomod"
          className="absolute w-full h-full object-cover object-center"
        />
      </div>
      <div className="relative h-full z-20 container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <motion.div 
          className="max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            {title}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-offwhite/90 max-w-xl">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="#projects">
              <a className="bg-burgundy hover:bg-opacity-90 text-white px-8 py-4 text-center text-sm uppercase tracking-wider font-medium transition-all duration-200">
                Explore Our Collection
              </a>
            </Link>
            <Link href="#process">
              <a className="bg-transparent border border-white hover:border-gold hover:text-gold text-white px-8 py-4 text-center text-sm uppercase tracking-wider font-medium transition-all duration-200">
                Discover Our Process
              </a>
            </Link>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center">
        <Link href="#featured">
          <a className="animate-bounce">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-offwhite"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
