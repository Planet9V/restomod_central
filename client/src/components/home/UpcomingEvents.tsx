import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Calendar, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Type for research article from schema
type ResearchArticle = {
  id: number;
  title: string;
  slug: string;
  author: string;
  publishDate: string;
  featuredImage: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured: boolean;
};

export function UpcomingEvents() {
  const { toast } = useToast();
  
  // Query for car show articles
  const { data: articles, isLoading, error } = useQuery<ResearchArticle[]>({
    queryKey: ['/api/research-articles/category/events'],
    retry: 1,
  });
  
  if (error) {
    toast({
      title: 'Error loading event articles',
      description: 'Could not load upcoming events information',
      variant: 'destructive',
    });
  }
  
  // Get the most recent events (limit to 3)
  const upcomingEvents = articles?.filter(article => article.category === 'events')
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 3);
  
  return (
    <section className="container py-12 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upcoming Car Shows</h2>
          <p className="text-muted-foreground mt-2">
            Stay up-to-date with the latest classic car and restomod events
          </p>
        </div>
        <Link href="/research-articles/category/events">
          <Button variant="outline" className="group">
            View All Events
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-[200px] w-full" />
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : upcomingEvents && upcomingEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((article) => (
            <Card key={article.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="relative h-[200px] overflow-hidden">
                <img 
                  src={article.featuredImage.startsWith('/') ? article.featuredImage : `/${article.featuredImage}`} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {article.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="outline" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/research-articles/${article.slug}`}>
                  <Button className="w-full">
                    View Event Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No upcoming events found</p>
          <p className="mt-2">Check back soon for the latest car shows and events</p>
        </div>
      )}
    </section>
  );
}