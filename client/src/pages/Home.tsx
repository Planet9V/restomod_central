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

  return (
    <>
      <HeroSection />
      <FeaturedProject />
      <EngineeringMeetsArtistry />
      <ProjectGallery />
      <ProcessSection />
      <ConfiguratorCTA />
      <MarketInsights />
      <AboutUs />
      <Testimonials />
      <ContactSection />
    </>
  );
};

export default Home;
