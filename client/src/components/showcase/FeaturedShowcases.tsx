import React from 'react';
import { useFeaturedLuxuryShowcases } from '@/hooks/use-luxury-showcase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'wouter';

export const FeaturedShowcases = () => {
  const { data: showcases, isLoading, error } = useFeaturedLuxuryShowcases(3);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
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
    );
  }
  
  if (error || !showcases || showcases.length === 0) {
    return null; // Don't display section if no featured showcases
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {showcases.map((showcase) => (
        <Card key={showcase.id} className="flex flex-col h-full overflow-hidden group transition-all duration-300 hover:shadow-lg">
          <div 
            className="h-64 bg-cover bg-center transition-all duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${showcase.heroImage})` }}
          ></div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl font-bold">{showcase.title}</CardTitle>
              <Badge variant="secondary" className="bg-amber-500 text-white border-none">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </Badge>
            </div>
            <CardDescription className="text-base">{showcase.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {showcase.shortDescription}
            </p>
          </CardContent>
          <CardFooter className="border-t border-muted/20 pt-4">
            <Button variant="default" className="group" asChild>
              <Link to={`/showcases/${showcase.slug}`}>
                Explore
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
