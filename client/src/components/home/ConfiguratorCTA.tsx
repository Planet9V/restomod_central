import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings, Wrench, Layers } from "lucide-react";

const ConfiguratorCTA = () => {
  return (
    <section className="py-20 bg-charcoal">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center space-x-2 mb-6">
            <div className="bg-gold/20 p-3 rounded-full">
              <Settings className="h-10 w-10 text-gold" />
            </div>
            <div className="bg-gold/20 p-3 rounded-full">
              <Wrench className="h-10 w-10 text-gold" />
            </div>
            <div className="bg-gold/20 p-3 rounded-full">
              <Layers className="h-10 w-10 text-gold" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-6">
            Build Your Dream Restomod
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto">
            Our AI-enhanced configurator allows you to create a custom restomod with K.I.T.T.-like AI integration. 
            Design your perfect vehicle with cutting-edge technology and classic style.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-charcoal/40 p-8 rounded-sm text-center">
              <h3 className="text-gold font-bold text-2xl mb-3">Select Your Model</h3>
              <p className="text-white/70">
                Choose from our curated collection of iconic classic vehicles as your starting point.
              </p>
            </div>
            
            <div className="bg-charcoal/40 p-8 rounded-sm text-center">
              <h3 className="text-gold font-bold text-2xl mb-3">Customize Everything</h3>
              <p className="text-white/70">
                From powertrains to interior details, tailor every aspect to your exact specifications.
              </p>
            </div>
            
            <div className="bg-charcoal/40 p-8 rounded-sm text-center">
              <h3 className="text-gold font-bold text-2xl mb-3">AI-Enhanced Experience</h3>
              <p className="text-white/70">
                Add advanced AI integration for a futuristic driving experience with personalized features.
              </p>
            </div>
          </div>
          
          <Link href="/car-configurator">
            <Button className="bg-gold hover:bg-gold/90 text-charcoal px-10 py-6 text-lg">
              Start Building Your Restomod
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ConfiguratorCTA;
