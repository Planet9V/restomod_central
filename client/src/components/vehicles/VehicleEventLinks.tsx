/**
 * Phase 5: VehicleEventLinks Component
 * Shows upcoming events where similar vehicles will appear
 * Reduces purchase anxiety by letting buyers see cars in person
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, ArrowRight, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VehicleEventLinksProps {
  vehicleId: number;
  make: string;
  model: string;
  year: number;
}

interface EventMatch {
  id: number;
  eventName: string;
  eventSlug: string;
  city: string;
  state: string;
  startDate: string;
  eventType: string;
  eventCategory: string;
  expectedAttendance?: number;
  expectedAttendanceMin?: number;
  expectedAttendanceMax?: number;
  matchType: 'exact_make' | 'exact_model' | 'category' | 'geographic' | 'temporal';
  matchScore: number;
  daysUntilEvent: number;
}

interface VehicleEventsResponse {
  success: boolean;
  total: number;
  events: EventMatch[];
}

export function VehicleEventLinks({ vehicleId, make, model, year }: VehicleEventLinksProps) {
  const { data, isLoading, error } = useQuery<VehicleEventsResponse>({
    queryKey: ['vehicle-events', vehicleId],
    queryFn: async () => {
      const response = await fetch(`/api/event-vehicle-links/vehicles/${vehicleId}/events?limit=6`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilText = (days: number) => {
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    if (days < 30) return `In ${Math.floor(days / 7)} weeks`;
    return `In ${Math.floor(days / 30)} months`;
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'exact_make':
        return { label: `${make} Show`, color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'category':
        return { label: 'Category Match', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'geographic':
        return { label: 'Nearby Event', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      default:
        return { label: 'Major Show', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    }
  };

  const getAttendanceText = (event: EventMatch) => {
    if (event.expectedAttendanceMax) {
      return `${event.expectedAttendanceMin || 50}-${event.expectedAttendanceMax}+ vehicles`;
    }
    if (event.expectedAttendance) {
      return `${event.expectedAttendance}+ vehicles`;
    }
    return 'Multiple vehicles expected';
  };

  if (error) {
    return null; // Fail silently
  }

  if (isLoading) {
    return (
      <Card className="bg-[#222222] border-[#3A3A3A]">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 bg-[#2A2A2A]" />
          <Skeleton className="h-4 w-1/2 bg-[#2A2A2A]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-[#2A2A2A]" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.events || data.events.length === 0) {
    return null; // No upcoming events
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="bg-[#222222] border-[#3A3A3A] shadow-xl">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-[#C9A770]/20 rounded-lg">
              <Calendar className="h-6 w-6 text-[#C9A770]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-playfair text-[#F8F8F8] mb-2">
                🏁 See Similar {year} {make} {model}s at Upcoming Shows
              </CardTitle>
              <CardDescription className="text-[#888888]">
                Reduce purchase anxiety by seeing similar vehicles in person before you buy.
                {data.total > 6 && ` ${data.total} events found in the next 6 months.`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Event List */}
          <div className="space-y-3">
            {data.events.map((event, index) => {
              const matchBadge = getMatchTypeLabel(event.matchType);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/events/${event.eventSlug}`}>
                    <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4 hover:border-[#C9A770] hover:bg-[#2A2A2A]/80 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-start justify-between gap-4">
                        {/* Event Info */}
                        <div className="flex-1 min-w-0">
                          {/* Date and Countdown */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2 text-sm text-[#888888]">
                              <Calendar className="h-4 w-4 text-[#C9A770]" />
                              <span>{formatDate(event.startDate)}</span>
                            </div>
                            <Badge className="bg-[#7D2027]/20 text-[#C9A770] border-[#C9A770]/30">
                              {getDaysUntilText(event.daysUntilEvent)}
                            </Badge>
                          </div>

                          {/* Event Name */}
                          <h4 className="font-medium text-[#F8F8F8] mb-2 group-hover:text-[#C9A770] transition-colors line-clamp-1">
                            {event.eventName}
                          </h4>

                          {/* Location and Attendance */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#888888]">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.city}, {event.state}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{getAttendanceText(event)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Match Badge */}
                        <div className="flex-shrink-0">
                          <Badge className={matchBadge.color}>
                            {matchBadge.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="flex justify-center pt-2">
            <Button
              asChild
              variant="outline"
              className="border-[#C9A770] text-[#C9A770] hover:bg-[#C9A770]/10"
            >
              <Link href={`/events?make=${make}`}>
                Find More {make} Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Educational Note */}
          <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#C9A770]/20 rounded flex-shrink-0">
                <Info className="h-5 w-5 text-[#C9A770]" />
              </div>
              <div>
                <p className="text-sm text-[#F8F8F8] font-medium mb-1">
                  Why attend car shows before buying?
                </p>
                <ul className="text-sm text-[#888888] space-y-1">
                  <li>• Compare condition and quality in person</li>
                  <li>• Ask owners about maintenance and issues</li>
                  <li>• Network with the {make} community</li>
                  <li>• See market trends and pricing firsthand</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
