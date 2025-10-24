/**
 * Phase 5: EventVehicleLinks Component
 * Displays vehicles matching a specific event
 * Transforms event browsing into purchase intent
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, TrendingUp, MapPin, Award, ArrowRight } from "lucide-react";

interface EventVehicleLinksProps {
  eventId: number;
  eventName: string;
  eventCategory?: string;
}

interface VehicleMatch {
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
  matchType: 'exact_make' | 'exact_model' | 'category' | 'geographic' | 'general';
  matchScore: number;
  distance?: number;
}

interface EventVehiclesResponse {
  success: boolean;
  total: number;
  vehicles: VehicleMatch[];
}

export function EventVehicleLinks({ eventId, eventName, eventCategory }: EventVehicleLinksProps) {
  const { data, isLoading, error } = useQuery<EventVehiclesResponse>({
    queryKey: ['event-vehicles', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/event-vehicle-links/events/${eventId}/vehicles?limit=12`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'exact_make':
        return { label: 'Exact Match', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'category':
        return { label: 'Category Match', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'geographic':
        return { label: 'Nearby', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      default:
        return { label: 'Suggested', color: 'bg-[#7D2027]/20 text-[#C9A770] border-[#C9A770]/30' };
    }
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

  if (error) {
    return null; // Fail silently - this is enhancement, not critical
  }

  if (isLoading) {
    return (
      <Card className="bg-[#222222] border-[#3A3A3A]">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 bg-[#2A2A2A]" />
          <Skeleton className="h-4 w-1/2 bg-[#2A2A2A]" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 bg-[#2A2A2A]" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.vehicles || data.vehicles.length === 0) {
    return null; // No matches - don't show empty section
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-[#222222] border-[#3A3A3A] shadow-xl">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-[#7D2027]/20 rounded-lg">
              <Car className="h-6 w-6 text-[#C9A770]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-playfair text-[#F8F8F8] mb-2">
                🚗 Vehicles You Might See at {eventName}
              </CardTitle>
              <CardDescription className="text-[#888888]">
                Browse {data.total} {data.total === 1 ? 'vehicle' : 'vehicles'} for sale that match this event.
                Reduce purchase anxiety by seeing similar cars in person!
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Vehicle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.vehicles.slice(0, 6).map((vehicle, index) => {
              const matchBadge = getMatchTypeLabel(vehicle.matchType);

              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/vehicles/${vehicle.id}`}>
                    <div className="bg-[#2A2A2A] rounded-lg overflow-hidden border border-[#3A3A3A] hover:border-[#C9A770] transition-all duration-300 hover:shadow-lg hover:shadow-[#C9A770]/10 cursor-pointer group">
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden bg-[#1A1A1A]">
                        <img
                          src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&q=80'}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <Badge className={matchBadge.color}>
                            {matchBadge.label}
                          </Badge>
                          {vehicle.investmentGrade && (
                            <Badge className={getInvestmentBadgeColor(vehicle.investmentGrade)}>
                              <Award className="h-3 w-3 mr-1" />
                              {vehicle.investmentGrade}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4">
                        <h4 className="font-medium text-[#F8F8F8] mb-2 line-clamp-1">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h4>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold text-[#C9A770]">
                            {formatPrice(vehicle.price)}
                          </span>
                        </div>

                        {vehicle.locationCity && vehicle.locationState && (
                          <div className="flex items-center gap-1 text-sm text-[#888888]">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">
                              {vehicle.locationCity}, {vehicle.locationState}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="flex justify-center pt-4">
            <Button
              asChild
              className="bg-[#7D2027] hover:bg-[#5D1820] text-white px-8"
            >
              <Link href={eventCategory ? `/cars-for-sale?category=${eventCategory}` : '/cars-for-sale'}>
                View All {data.total} Matching Vehicles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Educational Note */}
          <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#C9A770]/20 rounded">
                <TrendingUp className="h-5 w-5 text-[#C9A770]" />
              </div>
              <div>
                <p className="text-sm text-[#F8F8F8] font-medium mb-1">
                  Why see similar vehicles at shows?
                </p>
                <p className="text-sm text-[#888888]">
                  Meeting owners and seeing similar models in person helps you make informed purchase decisions.
                  You can compare condition, ask questions, and network with the community before buying.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
