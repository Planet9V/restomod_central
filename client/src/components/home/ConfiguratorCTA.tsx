import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Car, Wrench, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const ConfiguratorCTA = () => {
  return (
    <section className="py-16 md:py-24 px-6 bg-charcoal/5">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
                Design Your Dream Restomod
              </h2>
              <p className="text-lg text-charcoal/80 mb-8">
                Bring your vision to life with our advanced interactive configurator. 
                Customize every detail from power to aesthetics with expert AI-enhanced guidance.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 mb-10">
                <div className="p-4 rounded-md bg-white shadow-sm text-center">
                  <div className="flex justify-center mb-3">
                    <Car className="h-6 w-6 text-burgundy" />
                  </div>
                  <h3 className="font-bold mb-1">Classic Models</h3>
                  <p className="text-sm text-charcoal/70">Iconic vehicles ready for transformation</p>
                </div>
                
                <div className="p-4 rounded-md bg-white shadow-sm text-center">
                  <div className="flex justify-center mb-3">
                    <Wrench className="h-6 w-6 text-burgundy" />
                  </div>
                  <h3 className="font-bold mb-1">Modern Power</h3>
                  <p className="text-sm text-charcoal/70">Performance engine and drivetrain options</p>
                </div>
                
                <div className="p-4 rounded-md bg-white shadow-sm text-center">
                  <div className="flex justify-center mb-3">
                    <Settings className="h-6 w-6 text-burgundy" />
                  </div>
                  <h3 className="font-bold mb-1">AI Assistance</h3>
                  <p className="text-sm text-charcoal/70">Expert recommendations and research</p>
                </div>
              </div>
              
              <Link href="/car-configurator">
                <Button className="bg-burgundy hover:bg-burgundy/90 text-white font-medium px-8 py-6">
                  Start Building Your Restomod <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1590008790423-a7bfa99417f9?q=80&w=2070&auto=format&fit=crop" 
                  alt="Custom car configurator interface" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                  <div className="absolute bottom-0 left-0 p-6">
                    <div className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-burgundy/90 text-white mb-4">
                      NEW: AI-Enhanced Experience
                    </div>
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                      Interactive Configurator
                    </h3>
                    <p className="text-white/80 max-w-xs">
                      Powered by our authentic research system with real vehicle images and specifications
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-charcoal/70">Starting from</p>
                    <p className="text-xl font-bold text-burgundy">$75,000</p>
                  </div>
                  <Link href="/car-configurator">
                    <Button variant="outline" className="border-burgundy text-burgundy hover:bg-burgundy/5">
                      Explore Options
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ConfiguratorCTA;
