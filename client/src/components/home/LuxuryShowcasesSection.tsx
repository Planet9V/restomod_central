import React from 'react';
import { FeaturedShowcases } from '@/components/showcase/FeaturedShowcases';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

const LuxuryShowcasesSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto mb-16">
          <div className="reveal text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Luxury Showcases
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our collection of exceptional restomod projects, each representing the pinnacle of automotive design, engineering, and craftsmanship.
            </p>
          </div>
        </div>
        
        <div className="reveal">
          <FeaturedShowcases />
        </div>
        
        <div className="reveal mt-12 text-center">
          <Button variant="outline" size="lg" className="group" asChild>
            <Link to="/showcases">
              View All Showcases
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LuxuryShowcasesSection;
