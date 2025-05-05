import { Link } from 'wouter';
import { useFeaturedLuxuryShowcases } from '@/hooks/use-luxury-showcase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const FeaturedShowcases = () => {
  const { data: showcases, isLoading } = useFeaturedLuxuryShowcases(3);
  
  if (isLoading) {
    return (
      <div className="py-20 bg-black text-white px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <Skeleton className="w-1/3 h-10 bg-gray-800" />
            <Skeleton className="w-32 h-8 bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="w-full aspect-[4/3] bg-gray-800 mb-4" />
                <Skeleton className="w-3/4 h-8 bg-gray-800 mb-2" />
                <Skeleton className="w-full h-4 bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!showcases || showcases.length === 0) {
    return null;
  }
  
  return (
    <div className="py-20 bg-black text-white px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair font-medium tracking-tight">
              Luxury Showcases
            </h2>
            <p className="text-gray-400 mt-2">Discover our flagship restomod masterpieces</p>
          </div>
          <Link href="/showcases">
            <Button variant="ghost" className="text-white hover:text-burgundy hover:bg-transparent p-0 flex items-center group">
              View All Showcases
              <ArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {showcases.map((showcase) => (
            <Link key={showcase.id} href={`/showcases/${showcase.slug}`}>
              <div className="group cursor-pointer h-full flex flex-col">
                <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4">
                  <img 
                    src={showcase.heroImage} 
                    alt={showcase.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-medium mb-2 group-hover:text-burgundy transition-colors duration-300">
                  {showcase.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                  {showcase.shortDescription}
                </p>
                <div className="flex items-center text-burgundy text-sm">
                  Explore <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
