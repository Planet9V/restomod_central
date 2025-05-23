import { useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProject from "@/components/home/FeaturedProject";
import EngineeringMeetsArtistry from "@/components/home/EngineeringMeetsArtistry";
import ProjectGallery from "@/components/home/ProjectGallery";
import ProcessSection from "@/components/home/ProcessSection";
import MarketInsights from "@/components/home/MarketInsights";
import AboutUs from "@/components/home/AboutUs";
import Testimonials from "@/components/home/Testimonials";
import ContactSection from "@/components/home/ContactSection";
import ConfiguratorCTA from "@/components/home/ConfiguratorCTA";
import LuxuryShowcasesSection from "@/components/home/LuxuryShowcasesSection";

const Home = () => {
  // Initialize scroll reveal animations
  useEffect(() => {
    const handleScroll = () => {
      const revealElements = document.querySelectorAll('.reveal');
      const windowHeight = window.innerHeight;
      const revealPoint = 150;
      
      revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - revealPoint) {
          element.classList.add('active');
        }
      });
    };
    
    // Initial check and scroll event listener
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <>
      <HeroSection />
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <FeaturedProject />
      </motion.div>
      
      {/* Mustang Guide Promo Section */}
      <motion.div
        className="bg-gradient-to-r from-burgundy to-charcoal py-12 md:py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-10">
              <h2 className="text-2xl md:text-3xl font-playfair text-white font-bold mb-3">
                1960s Ford Mustang Restomod Guide
              </h2>
              <p className="text-white/80 max-w-2xl">
                Explore our comprehensive guide on Coyote-powered classic Mustang restomods. Learn about modern engine swaps, suspension upgrades, and investment potential.
              </p>
            </div>
            <Link href="/guides/mustang-restomods" className="shrink-0">
              <motion.button 
                className="bg-white text-burgundy px-6 py-3 rounded-sm font-medium flex items-center group relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="relative z-10">View Guide</span>
                <ChevronRight className="ml-2 h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="absolute inset-0 bg-gold transform translate-y-full transition-transform duration-300 group-hover:translate-y-0"></span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <EngineeringMeetsArtistry />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <ProjectGallery />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <ProcessSection />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <LuxuryShowcasesSection />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <ConfiguratorCTA />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <MarketInsights />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <AboutUs />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Testimonials />
      </motion.div>
      
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <ContactSection />
      </motion.div>
    </>
  );
};

export default Home;
