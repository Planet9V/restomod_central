import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Calendar, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Type for car show events from database
type CarShowEvent = {
  id: number;
  eventName: string;
  eventSlug: string;
  venue: string;
  venueName: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string | null;
  eventType: string;
  eventCategory: string;
  description: string;
  featured: boolean;
  imageUrl: string | null;
};

export function UpcomingEvents() {
  const { toast } = useToast();
  
  // Query for featured car show events from database
  const { data: eventsResponse, isLoading, error } = useQuery<{success: boolean, events: CarShowEvent[]}>({
    queryKey: ['/api/car-show-events?featured=true&limit=6'],
    retry: 1,
  });
  
  // Handle error with useEffect to prevent render issues
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading car show events',
        description: 'Could not load upcoming car show calendar',
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  // Get upcoming events sorted by date
  const upcomingEvents = eventsResponse?.events
    ?.filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 6) || [];
  
  return (
    <section className="container py-12 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upcoming Car Shows & Events</h2>
          <p className="text-muted-foreground mt-2">
            Discover authentic car shows across the country • {eventsResponse?.events?.length || 203} events in our database
          </p>
        </div>
        <Link href="/car-show-events">
          <Button variant="outline" className="group">
            View All Events
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-[160px] w-full" />
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
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="relative h-[160px] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.eventName}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-zinc-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-orange-500 text-white">
                    {event.eventType}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-2 text-lg">{event.eventName}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pb-2">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.city}, {event.state}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {event.venueName || event.venue}
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {event.eventCategory}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/car-show-events?search=${encodeURIComponent(event.eventName)}`}>
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
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No upcoming events found</p>
          <p className="text-muted-foreground mt-2">Check our full events calendar for more car shows</p>
          <Link href="/car-show-events">
            <Button className="mt-4">
              Browse All Events
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}