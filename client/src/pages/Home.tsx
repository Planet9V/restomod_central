import { useEffect } from "react";
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
import { motion } from "framer-motion";

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
