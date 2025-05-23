import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/page-header";
import { ModelValueAnalysis } from "@/components/market/ModelValueAnalysis";
import { RealtimeResearch } from "@/components/market/RealtimeResearch";

const ModelValues = () => {
  return (
    <div className="bg-white">
      <PageHeader
        title="Premium Restomod Valuations"
        subtitle="Comprehensive Model-Specific Investment Data & Current Market Values"
        imageSrc="https://images.unsplash.com/photo-1603553388677-6a75232d2d7c?q=80&w=1600&auto=format&fit=crop"
      />
      
      {/* Introduction Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold font-playfair mb-4">
                Exact Restomod Values by Model
              </h2>
              <p className="text-lg text-muted-foreground">
                Explore detailed market pricing data for premium restomod models, 
                with exact dollar figures based on recent auction results, builder pricing,
                and market trends. Our valuation data is updated quarterly to reflect
                the latest market dynamics.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row justify-center gap-4 items-center mb-8">
                <Button className="bg-burgundy hover:bg-burgundy/90 text-white" asChild>
                  <Link href="/contact">
                    Request Valuation Consultation
                  </Link>
                </Button>
                <Button variant="outline" asChild>
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
      
      {/* Model-Specific Valuation Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-10">
              <h2 className="text-3xl font-bold font-playfair mb-2">Model-Specific Valuations</h2>
              <p className="text-muted-foreground max-w-3xl">
                Detailed investment metrics and premium pricing for specific restomod platforms,
                featuring exact dollar figures from recent completed builds and auction results.
              </p>
            </div>
            
            <ModelValueAnalysis />
          </motion.div>
        </div>
      </section>
      
      {/* Realtime Market Research Section */}
      <section className="py-12 bg-offwhite border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold font-playfair mb-2">Realtime Market Research</h2>
                <p className="text-muted-foreground max-w-2xl">
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