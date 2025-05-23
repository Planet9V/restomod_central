import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface HeroData {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
}

/**
 * Enhanced hero section with smooth animations and parallax effect
 * Features staggered text reveal and interactive CTA buttons
 */
const HeroSection = () => {
  const { data: heroData } = useQuery<HeroData>({
    queryKey: ['/api/hero'],
    staleTime: Infinity,
  });
  
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax effect values
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  
  // Content for the hero section
  const heroBackground = heroData?.imageUrl || "https://images.unsplash.com/photo-1611566026373-c6c8da0945b8?q=80&w=2000&auto=format&fit=crop";
  const title = heroData?.title || "Skinny's Rod and Custom";
  const subtitle = heroData?.subtitle || "Meticulously crafted hot rods and restomods by master builders with over 25 years of experience. The perfect fusion of classic soul and modern performance.";

  // Animation variants for staggered text reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  // Button hover animation
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.98 }
  };

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0 overflow-hidden"
        style={{ scale, opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 to-charcoal/60 z-10"></div>
        <motion.div
          className="absolute inset-0"
          style={{ y }}
        >
          <img
            src={heroBackground}
            alt="Classic car restomod"
            className="absolute w-full h-full object-cover object-center scale-105"
          />
        </motion.div>
      </motion.div>
      
      {/* Hero Content */}
      <div className="relative h-full z-20 container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <motion.div 
          className="max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="overflow-hidden">
            <motion.h1 
              className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 text-white"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {title.split(' ').map((word, index) => (
                <span key={index} className="inline-block">
                  {word}{' '}
                </span>
              ))}
            </motion.h1>
          </motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl mb-10 text-white/90 max-w-xl leading-relaxed"
          >
            {subtitle}
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <motion.div
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link href="#projects" className="block bg-burgundy hover:bg-opacity-90 text-white px-8 py-4 text-center text-sm uppercase tracking-wider font-medium transition-all duration-200 border border-burgundy group">
                <span className="relative flex items-center justify-center">
                  Explore Our Collection
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gold transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
            </motion.div>
            
            <motion.div
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <Link href="#process" className="block bg-transparent border border-white hover:border-gold hover:text-gold text-white px-8 py-4 text-center text-sm uppercase tracking-wider font-medium transition-all duration-300">
                <span className="relative flex items-center justify-center">
                  Discover Our Process
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-0 right-0 z-20 flex justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <Link href="#featured">
          <motion.div 
            className="group flex flex-col items-center cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm text-white/70 mb-2 group-hover:text-white transition-colors duration-300">
              Scroll Down
            </span>
            <motion.div 
              className="bg-white/10 rounded-full p-2 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300"
              animate={{ 
                y: [0, 8, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut" 
              }}
            >
              <ChevronDown className="h-6 w-6 text-white" />
            </motion.div>
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
};

export default HeroSection;
