import { Link } from 'wouter';
import { useLuxuryShowcases } from '@/hooks/use-luxury-showcase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LuxuryShowcasesPage = () => {
  const { data: showcases, isLoading, error } = useLuxuryShowcases();
  
  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  // Item animation
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto py-12">
          <Skeleton className="w-1/2 h-12 bg-gray-800 mb-8" />
          <Skeleton className="w-full h-8 bg-gray-800 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="w-full h-[300px] bg-gray-800 mb-4" />
                <Skeleton className="w-3/4 h-8 bg-gray-800 mb-2" />
                <Skeleton className="w-full h-4 bg-gray-800 mb-1" />
                <Skeleton className="w-2/3 h-4 bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !showcases) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 lg:px-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Something Went Wrong</h1>
          <p className="text-xl mb-8 text-gray-400">
            We couldn't load the luxury showcases. Please try again later.
          </p>
          <Link href="/">
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // No showcases
  if (showcases.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 lg:px-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">No Luxury Showcases Available</h1>
          <p className="text-xl mb-8 text-gray-400">
            Check back soon for our upcoming luxury vehicle showcases.
          </p>
          <Link href="/">
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto py-12">
        {/* Hero Section */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair mb-6 tracking-tight font-bold">
            Luxury Showcases
          </h1>
          <p className="text-xl text-gray-400">
            Explore our collection of meticulously crafted restomod masterpieces, each representing the pinnacle of automotive artistry and engineering excellence.
          </p>
        </div>
        
        {/* Showcases Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {showcases.map((showcase) => (
            <motion.div 
              key={showcase.id} 
              className="group cursor-pointer"
              variants={itemVariants}
            >
              <Link href={`/showcases/${showcase.slug}`}>
                <div className="flex flex-col h-full">
                  <div className="h-[300px] overflow-hidden rounded-lg mb-4">
                    <img 
                      src={showcase.heroImage} 
                      alt={showcase.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h2 className="text-2xl font-medium mb-2 group-hover:text-burgundy transition-colors duration-300">
                    {showcase.title}
                  </h2>
                  <p className="text-gray-400 mb-4 flex-grow">
                    {showcase.shortDescription}
                  </p>
                  <div className="flex items-center text-burgundy">
                    Explore <ChevronRight className="ml-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {/* CTA */}
        <div className="bg-charcoal text-white p-8 rounded-sm text-center">
          <h2 className="font-playfair text-2xl font-medium mb-4">
            Ready to Create Your Own Masterpiece?
          </h2>
          <p className="mb-6 text-white/80 max-w-2xl mx-auto">
            Let's discuss how we can bring your vision to life with our unique combination of engineering excellence and master craftsmanship.
          </p>
          <Link href="/#contact">
            <Button className="bg-burgundy hover:bg-burgundy/90 text-white transition-colors duration-200">
              Request a Consultation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LuxuryShowcasesPage;
