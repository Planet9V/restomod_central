import { useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { AreaChart, ArrowLeft, ChevronRight, Database, Landmark, LineChart, Search, Trophy } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import PageHeader from "@/components/ui/page-header";
import { ModelValueAnalysis } from "@/components/market/ModelValueAnalysis";
import { RealtimeResearch } from "@/components/market/RealtimeResearch";
import { useInView } from "react-intersection-observer";

/**
 * ModelValues page featuring premium animations and transitions
 * Displays detailed pricing analytics for specific restomod models
 */
const ModelValues = () => {
  const [location] = useLocation();
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  const featureItemVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  // Breadcrumb items for navigation clarity
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Market Analysis", href: "/market-analysis" },
    { label: "Model Valuations", href: "/model-values", isCurrentPage: true }
  ];
  
  // Key features of the valuations page
  const keyFeatures = [
    {
      icon: <Database className="h-5 w-5 text-burgundy" />,
      title: "Accurate Data",
      description: "Exact valuations from real auction results and market research"
    },
    {
      icon: <LineChart className="h-5 w-5 text-burgundy" />,
      title: "Value Trends",
      description: "Five-year growth patterns and future projections"
    },
    {
      icon: <Landmark className="h-5 w-5 text-burgundy" />,
      title: "Auction History",
      description: "Detailed records from Barrett-Jackson, Mecum and RM Sotheby's"
    },
    {
      icon: <Search className="h-5 w-5 text-burgundy" />,
      title: "AI Research",
      description: "Real-time market data powered by Perplexity AI"
    }
  ];
  
  return (
    <div className="bg-white">
      {/* Hero section with animated PageHeader */}
      <PageHeader
        title="Premium Restomod Valuations"
        subtitle="Comprehensive Model-Specific Investment Data & Current Market Values"
        imageSrc="https://images.unsplash.com/photo-1603553388677-6a75232d2d7c?q=80&w=1600&auto=format&fit=crop"
      />
      
      {/* Breadcrumb navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      {/* Introduction Section with enhanced animations */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.7, 
                delay: 0.1,
                type: "spring",
                stiffness: 60
              }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 bg-burgundy hover:bg-burgundy text-white px-3 py-1">
                Based on 2024 Market Research
              </Badge>
              <h2 className="text-5xl font-bold font-playfair mb-4 tracking-tight">
                Exact Restomod Values by Model
              </h2>
              <p className="text-lg text-muted-foreground">
                Explore detailed market pricing data for premium restomod models, 
                with exact dollar figures based on recent auction results, builder pricing,
                and market trends. Our valuation data is updated quarterly to reflect
                the latest market dynamics.
              </p>
            </motion.div>
            
            {/* Key features with staggered animation */}
            <motion.div
              ref={ref}
              variants={containerVariants}
              initial="hidden"
              animate={controls}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {keyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={featureItemVariants}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-burgundy/10 p-3 rounded-full mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
                <Button 
                  className="bg-burgundy hover:bg-burgundy/90 text-white group"
                  size="lg"
                  asChild
                >
                  <Link href="/contact">
                    Request Valuation Consultation
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/market-analysis">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Market Analysis
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Interactive pricing summary */}
      <section className="py-10 bg-offwhite border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-burgundy"
            >
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground mb-1">Highest Valuation</div>
                <div className="text-3xl font-bold text-burgundy mb-1">$962,000</div>
                <div className="text-sm font-medium">1967 Corvette Restomod</div>
                <div className="text-xs text-muted-foreground">Barrett-Jackson (2024)</div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-burgundy"
            >
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground mb-1">Fastest Growing</div>
                <div className="text-3xl font-bold text-burgundy mb-1">+42.3%</div>
                <div className="text-sm font-medium">Ford Bronco (1966-1970)</div>
                <div className="text-xs text-muted-foreground">5-Year Appreciation Rate</div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-burgundy"
            >
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground mb-1">Best Value</div>
                <div className="text-3xl font-bold text-burgundy mb-1">$215,000</div>
                <div className="text-sm font-medium">1967-1972 C10 Pickup</div>
                <div className="text-xs text-muted-foreground">914% Above Original Value</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Model-Specific Valuation Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 50
            }}
          >
            <div className="mb-12 max-w-3xl">
              <div className="flex items-center text-burgundy mb-2">
                <Trophy className="h-5 w-5 mr-2" />
                <h3 className="text-sm font-medium uppercase tracking-wider">Premium Analytics</h3>
              </div>
              <h2 className="text-4xl font-bold font-playfair mb-4">Model-Specific Valuations</h2>
              <p className="text-muted-foreground text-lg">
                Detailed investment metrics and premium pricing for specific restomod platforms,
                featuring exact dollar figures from recent completed builds and auction results.
                Based on comprehensive research from Hagerty, Barrett-Jackson, Mecum, and RM Sotheby's.
              </p>
            </div>
            
            <ModelValueAnalysis />
          </motion.div>
        </div>
      </section>
      
      {/* Realtime Market Research Section */}
      <section className="py-16 bg-offwhite border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 50
            }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <div className="max-w-3xl">
                <div className="flex items-center text-burgundy mb-2">
                  <AreaChart className="h-5 w-5 mr-2" />
                  <h3 className="text-sm font-medium uppercase tracking-wider">AI-Powered Insights</h3>
                </div>
                <h2 className="text-4xl font-bold font-playfair mb-4">Realtime Market Research</h2>
                <p className="text-muted-foreground text-lg">
                  Access current market data and specific value projections powered by Perplexity AI research.
                  Search for detailed information on specific models, trends, or investment metrics.
                </p>
              </div>
            </div>
            
            <RealtimeResearch />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ModelValues;