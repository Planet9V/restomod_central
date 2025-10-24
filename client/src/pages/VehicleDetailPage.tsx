/**
 * Phase 5: Vehicle Detail Page
 * Complete vehicle information with event cross-linking and price trends
 */

import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Award,
  TrendingUp,
  Share2,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { VehicleEventLinks } from "@/components/vehicles/VehicleEventLinks";
import { PriceTrendChart } from "@/components/analytics/PriceTrendChart";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: string;
  description?: string;
  imageUrl?: string;
  locationCity?: string;
  locationState?: string;
  locationRegion?: string;
  category?: string;
  condition?: string;
  mileage?: number;
  exteriorColor?: string;
  interiorColor?: string;
  engine?: string;
  transmission?: string;
  investmentGrade?: string;
  appreciationRate?: string;
  marketTrend?: string;
  sourceType?: string;
  sourceName?: string;
  stockNumber?: string;
  features?: any;
  researchNotes?: string;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = parseInt(params.id as string);

  const { data: vehicle, isLoading, error } = useQuery<Vehicle>({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      // Try the cars API endpoint
      const response = await fetch(`/api/cars/${vehicleId}`);
      if (!response.ok) {
        // Fallback to cars-for-sale endpoint
        const fallbackResponse = await fetch(`/api/cars-for-sale/${vehicleId}`);
        if (!fallbackResponse.ok) throw new Error('Vehicle not found');
        return fallbackResponse.json();
      }
      return response.json();
    },
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

  const getInvestmentBadgeColor = (grade?: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-600 text-white';
      case 'A': return 'bg-green-500 text-white';
      case 'A-': return 'bg-blue-500 text-white';
      case 'B+': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#222222] text-[#F8F8F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-48 mb-8 bg-[#2A2A2A]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 bg-[#2A2A2A]" />
            <Skeleton className="h-96 bg-[#2A2A2A]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-[#222222] text-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">Vehicle Not Found</h1>
          <p className="text-[#888888] mb-8">The vehicle you're looking for doesn't exist.</p>
          <Button asChild className="bg-[#7D2027] hover:bg-[#5D1820]">
            <Link href="/cars-for-sale">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vehicles
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] text-[#F8F8F8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2A2A2A] to-[#1A1A1A] border-b border-[#3A3A3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            asChild
            variant="ghost"
            className="text-[#C9A770] hover:text-[#F8F8F8] mb-4"
          >
            <Link href="/cars-for-sale">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Vehicles
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-2">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                {vehicle.category && (
                  <Badge variant="outline" className="border-[#C9A770] text-[#C9A770]">
                    {vehicle.category}
                  </Badge>
                )}
                {vehicle.investmentGrade && (
                  <Badge className={getInvestmentBadgeColor(vehicle.investmentGrade)}>
                    <Award className="h-3 w-3 mr-1" />
                    Investment Grade: {vehicle.investmentGrade}
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold text-[#C9A770] mb-2">
                {formatPrice(vehicle.price)}
              </div>
              {vehicle.appreciationRate && (
                <div className="flex items-center justify-end gap-1 text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{vehicle.appreciationRate} appreciation</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-[#2A2A2A] border-[#3A3A3A] overflow-hidden">
                <div className="relative h-96 bg-[#1A1A1A]">
                  <img
                    src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=1200&q=80'}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            </motion.div>

            {/* Description */}
            {vehicle.description && (
              <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
                <CardHeader>
                  <CardTitle className="text-xl font-playfair text-[#C9A770]">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#F8F8F8] leading-relaxed">{vehicle.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Specifications */}
            <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
              <CardHeader>
                <CardTitle className="text-xl font-playfair text-[#C9A770]">
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {vehicle.mileage && (
                    <div className="flex items-center gap-3">
                      <Gauge className="h-5 w-5 text-[#C9A770]" />
                      <div>
                        <div className="text-sm text-[#888888]">Mileage</div>
                        <div className="text-[#F8F8F8] font-medium">
                          {vehicle.mileage.toLocaleString()} miles
                        </div>
                      </div>
                    </div>
                  )}

                  {vehicle.engine && (
                    <div className="flex items-center gap-3">
                      <Fuel className="h-5 w-5 text-[#C9A770]" />
                      <div>
                        <div className="text-sm text-[#888888]">Engine</div>
                        <div className="text-[#F8F8F8] font-medium">{vehicle.engine}</div>
                      </div>
                    </div>
                  )}

                  {vehicle.transmission && (
                    <div>
                      <div className="text-sm text-[#888888]">Transmission</div>
                      <div className="text-[#F8F8F8] font-medium">{vehicle.transmission}</div>
                    </div>
                  )}

                  {vehicle.exteriorColor && (
                    <div>
                      <div className="text-sm text-[#888888]">Exterior Color</div>
                      <div className="text-[#F8F8F8] font-medium">{vehicle.exteriorColor}</div>
                    </div>
                  )}

                  {vehicle.interiorColor && (
                    <div>
                      <div className="text-sm text-[#888888]">Interior Color</div>
                      <div className="text-[#F8F8F8] font-medium">{vehicle.interiorColor}</div>
                    </div>
                  )}

                  {vehicle.condition && (
                    <div>
                      <div className="text-sm text-[#888888]">Condition</div>
                      <div className="text-[#F8F8F8] font-medium">{vehicle.condition}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price Trend Chart */}
            <PriceTrendChart vehicleId={vehicle.id} timeframe={12} />

            {/* Event Links - See Similar at Shows */}
            <VehicleEventLinks
              vehicleId={vehicle.id}
              make={vehicle.make}
              model={vehicle.model}
              year={vehicle.year}
            />
          </div>

          {/* Right Column - Actions and Info */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
              <CardHeader>
                <CardTitle className="text-xl font-playfair text-[#C9A770]">
                  Interested?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-[#7D2027] hover:bg-[#5D1820]">
                  Contact Seller
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#C9A770] text-[#C9A770] hover:bg-[#C9A770]/10"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Vehicle
                </Button>
              </CardContent>
            </Card>

            {/* Location */}
            {vehicle.locationCity && vehicle.locationState && (
              <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
                <CardHeader>
                  <CardTitle className="text-xl font-playfair text-[#C9A770]">
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-[#F8F8F8]">
                    <MapPin className="h-5 w-5 text-[#C9A770]" />
                    <span>
                      {vehicle.locationCity}, {vehicle.locationState}
                    </span>
                  </div>
                  {vehicle.locationRegion && (
                    <div className="mt-2 text-sm text-[#888888]">
                      Region: {vehicle.locationRegion}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Seller Info */}
            {vehicle.sourceName && (
              <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
                <CardHeader>
                  <CardTitle className="text-xl font-playfair text-[#C9A770]">
                    Seller
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-[#F8F8F8] font-medium">{vehicle.sourceName}</div>
                    {vehicle.stockNumber && (
                      <div className="text-sm text-[#888888]">
                        Stock #: {vehicle.stockNumber}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
