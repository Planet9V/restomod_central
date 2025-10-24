/**
 * Phase 5: Make/Model Hub Page
 * SEO-optimized landing pages for popular makes
 * Routes: /mustang, /corvette, /camaro, /ford, /chevrolet, etc.
 */

import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  Award,
  Car,
  BarChart3
} from "lucide-react";
import { PriceTrendChart } from "@/components/analytics/PriceTrendChart";

interface MakeStats {
  success: boolean;
  make: string;
  totalListings: number;
  averagePrice: number;
  investmentGradeDistribution: Array<{ grade: string; count: number }>;
}

interface MakeEvents {
  success: boolean;
  make: string;
  total: number;
  events: Array<{
    id: number;
    eventName: string;
    eventSlug: string;
    city: string;
    state: string;
    startDate: string;
    expectedAttendance?: number;
    expectedAttendanceMin?: number;
  }>;
}

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: string;
  imageUrl?: string;
  locationCity?: string;
  locationState?: string;
  investmentGrade?: string;
  category?: string;
}

// Make configurations
const MAKE_CONFIG: Record<string, {
  displayName: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  searchQuery: string;
}> = {
  'mustang': {
    displayName: 'Ford Mustang',
    heroTitle: 'Ford Mustang Hub',
    heroDescription: 'Discover classic and modern Mustangs - America\'s iconic pony car. Track market trends, find events, and explore investment opportunities.',
    heroImage: 'https://images.unsplash.com/photo-1584345604476-8ec52ba59f88?w=1920&q=80',
    searchQuery: 'Mustang'
  },
  'corvette': {
    displayName: 'Chevrolet Corvette',
    heroTitle: 'Corvette Hub',
    heroDescription: 'America\'s sports car across all generations. From C1 classics to modern supercars, find your dream Corvette.',
    heroImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1920&q=80',
    searchQuery: 'Corvette'
  },
  'camaro': {
    displayName: 'Chevrolet Camaro',
    heroTitle: 'Camaro Hub',
    heroDescription: 'First-gen legends to modern muscle. Track Camaro market trends and investment potential.',
    heroImage: 'https://images.unsplash.com/photo-1552519507-704c2cdeb1d4?w=1920&q=80',
    searchQuery: 'Camaro'
  },
  'ford': {
    displayName: 'Ford',
    heroTitle: 'Ford Classics Hub',
    heroDescription: 'Explore Ford\'s legendary lineup - Mustangs, Thunderbirds, F-Series, and more.',
    heroImage: 'https://images.unsplash.com/photo-1547744152-14d985cb937f?w=1920&q=80',
    searchQuery: 'Ford'
  },
  'chevrolet': {
    displayName: 'Chevrolet',
    heroTitle: 'Chevrolet Classics Hub',
    heroDescription: 'Corvettes, Camaros, Chevelles, and Impalas - discover Chevy\'s finest.',
    heroImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&q=80',
    searchQuery: 'Chevrolet'
  }
};

export default function MakeHubPage() {
  const params = useParams();
  const slug = (params.slug as string)?.toLowerCase();

  const config = MAKE_CONFIG[slug];

  // Get make statistics
  const { data: stats, isLoading: statsLoading } = useQuery<MakeStats>({
    queryKey: ['make-stats', config?.searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/event-vehicle-links/makes/${config.searchQuery}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!config,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Get upcoming events
  const { data: events, isLoading: eventsLoading } = useQuery<MakeEvents>({
    queryKey: ['make-events', config?.searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/event-vehicle-links/makes/${config.searchQuery}/events?limit=6`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    enabled: !!config,
    staleTime: 1000 * 60 * 30,
  });

  // Get current listings
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ['make-vehicles', config?.searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/cars-for-sale?make=${config.searchQuery}&limit=12`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      return data.vehicles || [];
    },
    enabled: !!config,
    staleTime: 1000 * 60 * 10,
  });

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInvestmentBadgeColor = (grade?: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-600 text-white';
      case 'A': return 'bg-green-500 text-white';
      case 'A-': return 'bg-blue-500 text-white';
      case 'B+': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-[#222222] text-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">Make Not Found</h1>
          <p className="text-[#888888] mb-8">This make hub doesn't exist yet.</p>
          <Button asChild className="bg-[#7D2027] hover:bg-[#5D1820]">
            <Link href="/cars-for-sale">Browse All Vehicles</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222]">
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-r from-[#2A2A2A] to-[#1A1A1A]">
        <div className="absolute inset-0">
          <img
            src={config.heroImage}
            alt={config.displayName}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#222222]/80 to-transparent" />
        </div>

        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-4 bg-gradient-to-r from-[#C9A770] to-[#7D2027] bg-clip-text text-transparent">
                {config.heroTitle}
              </h1>
              <p className="text-xl text-[#F8F8F8] leading-relaxed">
                {config.heroDescription}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-[#2A2A2A] border-[#3A3A3A] shadow-xl">
            <CardContent className="pt-6 text-center">
              {statsLoading ? (
                <Skeleton className="h-12 w-24 mx-auto bg-[#1A1A1A]" />
              ) : (
                <>
                  <Car className="h-6 w-6 text-[#C9A770] mx-auto mb-2" />
                  <div className="text-3xl font-bold text-[#C9A770]">
                    {stats?.totalListings || 0}
                  </div>
                  <div className="text-sm text-[#888888]">For Sale</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#2A2A2A] border-[#3A3A3A] shadow-xl">
            <CardContent className="pt-6 text-center">
              {statsLoading ? (
                <Skeleton className="h-12 w-24 mx-auto bg-[#1A1A1A]" />
              ) : (
                <>
                  <DollarSign className="h-6 w-6 text-[#C9A770] mx-auto mb-2" />
                  <div className="text-3xl font-bold text-[#C9A770]">
                    {formatPrice(stats?.averagePrice || 0)}
                  </div>
                  <div className="text-sm text-[#888888]">Avg Price</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#2A2A2A] border-[#3A3A3A] shadow-xl">
            <CardContent className="pt-6 text-center">
              {statsLoading ? (
                <Skeleton className="h-12 w-24 mx-auto bg-[#1A1A1A]" />
              ) : (
                <>
                  <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-400">
                    +15%
                  </div>
                  <div className="text-sm text-[#888888]">5yr Growth*</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#2A2A2A] border-[#3A3A3A] shadow-xl">
            <CardContent className="pt-6 text-center">
              {eventsLoading ? (
                <Skeleton className="h-12 w-24 mx-auto bg-[#1A1A1A]" />
              ) : (
                <>
                  <Calendar className="h-6 w-6 text-[#C9A770] mx-auto mb-2" />
                  <div className="text-3xl font-bold text-[#C9A770]">
                    {events?.total || 0}
                  </div>
                  <div className="text-sm text-[#888888]">Upcoming Shows</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Listings */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-playfair font-bold text-[#F8F8F8]">
              {config.displayName} For Sale Now
            </h2>
          </div>

          {vehiclesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 bg-[#2A2A2A]" />
              ))}
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link href={`/vehicles/${vehicle.id}`}>
                      <Card className="bg-[#2A2A2A] border-[#3A3A3A] hover:border-[#C9A770] transition-all duration-300 cursor-pointer group overflow-hidden">
                        <div className="relative h-48 overflow-hidden bg-[#1A1A1A]">
                          <img
                            src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&q=80'}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {vehicle.investmentGrade && (
                            <Badge className={`absolute top-2 right-2 ${getInvestmentBadgeColor(vehicle.investmentGrade)}`}>
                              <Award className="h-3 w-3 mr-1" />
                              {vehicle.investmentGrade}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-[#F8F8F8] mb-2 line-clamp-1">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-[#C9A770]">
                              {formatPrice(vehicle.price)}
                            </span>
                          </div>
                          {vehicle.locationCity && vehicle.locationState && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-[#888888]">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">
                                {vehicle.locationCity}, {vehicle.locationState}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <Button
                  asChild
                  className="bg-[#7D2027] hover:bg-[#5D1820]"
                >
                  <Link href={`/cars-for-sale?make=${config.searchQuery}`}>
                    View All {stats?.totalListings || 0} {config.displayName} Vehicles →
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <Card className="bg-[#2A2A2A] border-[#3A3A3A] p-8 text-center">
              <p className="text-[#888888]">No {config.displayName} vehicles currently listed.</p>
            </Card>
          )}
        </section>

        {/* Upcoming Events */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-playfair font-bold text-[#F8F8F8]">
              Upcoming {config.displayName} Events
            </h2>
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 bg-[#2A2A2A]" />
              ))}
            </div>
          ) : events && events.events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link href={`/events/${event.eventSlug}`}>
                      <Card className="bg-[#2A2A2A] border-[#3A3A3A] hover:border-[#C9A770] transition-all duration-300 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2 text-sm text-[#C9A770]">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                          <h3 className="font-medium text-[#F8F8F8] mb-2 line-clamp-2">
                            {event.eventName}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-[#888888]">
                            <MapPin className="h-3 w-3" />
                            <span>{event.city}, {event.state}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <Button
                  asChild
                  variant="outline"
                  className="border-[#C9A770] text-[#C9A770] hover:bg-[#C9A770]/10"
                >
                  <Link href={`/events?make=${config.searchQuery}`}>
                    Find All {config.displayName} Shows →
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <Card className="bg-[#2A2A2A] border-[#3A3A3A] p-8 text-center">
              <p className="text-[#888888]">No upcoming {config.displayName} events found.</p>
            </Card>
          )}
        </section>

        {/* Investment Grade Distribution */}
        {stats && stats.investmentGradeDistribution && stats.investmentGradeDistribution.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-playfair font-bold text-[#F8F8F8] mb-6">
              Investment Grade Distribution
            </h2>
            <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.investmentGradeDistribution.map((item) => (
                    <div key={item.grade} className="text-center">
                      <Badge className={getInvestmentBadgeColor(item.grade)}>
                        {item.grade}
                      </Badge>
                      <div className="text-2xl font-bold text-[#C9A770] mt-2">
                        {item.count}
                      </div>
                      <div className="text-sm text-[#888888]">vehicles</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
