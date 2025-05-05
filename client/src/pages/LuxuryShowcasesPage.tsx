import React from 'react';
import { useLuxuryShowcases } from '@/hooks/use-luxury-showcase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarIcon, Star } from 'lucide-react';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

export default function LuxuryShowcasesPage() {
  const { data: showcases, isLoading, error } = useLuxuryShowcases();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Luxury Showcases</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our collection of exceptional restomod projects, each representing the pinnacle of automotive design, engineering, and craftsmanship.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="flex flex-col h-[450px] animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">Error loading showcases</h3>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        ) : !showcases || showcases.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No showcases found</h3>
            <p className="text-muted-foreground">Check back soon for new additions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {showcases.map((showcase) => (
              <Card key={showcase.id} className="flex flex-col h-full overflow-hidden group transition-all duration-300 hover:shadow-lg">
                <div 
                  className="h-64 bg-cover bg-center transition-all duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${showcase.heroImage})` }}
                ></div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">{showcase.title}</CardTitle>
                    {showcase.featured && (
                      <Badge variant="secondary" className="bg-amber-500 text-white border-none">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">{showcase.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {showcase.shortDescription}
                  </p>
                  
                  {showcase.publishedAt && (
                    <div className="flex items-center mt-4 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(showcase.publishedAt), { addSuffix: true })}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-muted/20 pt-4">
                  <Button variant="default" className="group" asChild>
                    <Link to={`/showcases/${showcase.slug}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
