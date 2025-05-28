import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { GatewayVehiclesSection } from "@/components/home/GatewayVehiclesSection";

/**
 * Enhanced Home page with smooth transitions and optimized layout
 * Features improved scroll animations and section transitions
 */
const Home = () => {
  const mainRef = useRef(null);
  const [activeSection, setActiveSection] = useState("");
  const { scrollYProgress } = useScroll({ target: mainRef });
  const opacity = useTransform(scrollYProgress, [0, 0.02], [0, 1]);
  
  // Optimized scroll reveal animations
  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("id");
            if (sectionId) {
              setActiveSection(sectionId);
              entry.target.classList.add("active");
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: "-10% 0px -10% 0px" }
    );
    
    // Observe all sections with IDs
    document.querySelectorAll("section[id]").forEach((section) => {
      sectionObserver.observe(section);
    });
    
    return () => sectionObserver.disconnect();
  }, []);
  
  // Enhanced section transition variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
        duration: 0.8
      },
    },
  };
  
  // Staggered element animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };
  
  // Link to specific section for smooth scrolling
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div 
      ref={mainRef}
      className="relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <section id="hero">
        <HeroSection />
      </section>
      
      {/* Featured Project Section */}
      <section id="featured" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <FeaturedProject />
        </motion.div>
      </section>
      
      {/* Mustang Guide Promo Section */}
      <motion.section
        id="mustang-guide"
        className="relative z-10 bg-gradient-to-r from-burgundy to-charcoal py-14 md:py-18 transform-gpu"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-10">
              <motion.h2 
                className="text-2xl md:text-3xl font-playfair text-white font-bold mb-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                1960s Ford Mustang Restomod Guide
              </motion.h2>
              <motion.p 
                className="text-white/80 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Explore our comprehensive guide on Coyote-powered classic Mustang restomods. Learn about modern engine swaps, suspension upgrades, and investment potential.
              </motion.p>
            </div>
            <Link href="/guides/mustang-restomods" className="shrink-0">
              <motion.button 
                className="bg-white text-burgundy px-6 py-3 rounded-sm font-medium flex items-center group relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="relative z-10">View Guide</span>
                <ChevronRight className="ml-2 h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="absolute inset-0 bg-gold transform translate-y-full transition-transform duration-300 group-hover:translate-y-0"></span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>
      
      {/* Engineering Section with Parallax Effect */}
      <section id="engineering" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <EngineeringMeetsArtistry />
        </motion.div>
      </section>
      
      {/* Project Gallery */}
      <section id="projects" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <ProjectGallery />
        </motion.div>
      </section>
      
      {/* Process Section */}
      <section id="process" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <ProcessSection />
        </motion.div>
      </section>
      
      {/* Luxury Showcases */}
      <section id="showcases" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <LuxuryShowcasesSection />
        </motion.div>
      </section>
      
      {/* Configurator CTA */}
      <section id="configurator" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <ConfiguratorCTA />
        </motion.div>
      </section>
      
      {/* Market Insights */}
      <section id="insights" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <MarketInsights />
        </motion.div>
      </section>
      
      {/* Upcoming Events */}
      <section id="events" className="relative z-10 bg-gray-50 dark:bg-gray-900">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <UpcomingEvents />
        </motion.div>
      </section>
      
      {/* Gateway Vehicles Valuation */}
      <section id="valuations" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <GatewayVehiclesSection />
        </motion.div>
      </section>
      
      {/* About Section */}
      <section id="about" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <AboutUs />
        </motion.div>
      </section>
      
      {/* Testimonials */}
      <section id="testimonials" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Testimonials />
        </motion.div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <ContactSection />
        </motion.div>
      </section>
      
      {/* Smooth scroll indicator */}
      <motion.div 
        className="fixed right-6 bottom-6 z-50 hidden md:block"
        style={{ opacity }}
      >
        <motion.div 
          className="bg-burgundy/80 text-white rounded-full w-12 h-12 flex items-center justify-center cursor-pointer backdrop-blur-sm hover:bg-burgundy transition-colors duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
