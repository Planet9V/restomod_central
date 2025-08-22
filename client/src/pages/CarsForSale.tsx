import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, MapPin, Calendar, DollarSign, TrendingUp, Award, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

interface CarForSale {
  id: number;
  make: string;
  model: string;
  year: number;
  price: string;
  sourceType: string;
  sourceName: string;
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
  valuationConfidence?: string;
  imageUrl?: string;
  description?: string;
  stockNumber?: string;
  features?: any;
  researchNotes?: string;
}

interface CarsForSaleResponse {
  success: boolean;
  vehicles: CarForSale[];
  organizedByRegion: {
    west: CarForSale[];
    south: CarForSale[];
    midwest: CarForSale[];
    northeast: CarForSale[];
    europe: CarForSale[];
    asia: CarForSale[];
    oceania: CarForSale[];
    worldwide: CarForSale[];
  };
  sourceBreakdown: {
    gateway: number;
    rkMotors: number;
    barrettJackson: number;
    mecum: number;
    rmSothebys: number;
    research: number;
  };
  total: number;
  summary: {
    totalVehicles: number;
    premiumGrades: number;
    averagePrice: number;
    regions: number;
    sources: number;
  };
}

export default function CarsForSale() {
  const [filters, setFilters] = useState({
    make: 'all',
    category: 'all',
    priceMin: '',
    priceMax: '',
    year: '',
    region: 'all',
    sourceType: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated } = useAuth();

  const { data: vehiclesData, isLoading, error } = useQuery<CarsForSaleResponse>({
    queryKey: ['/api/cars-for-sale', filters, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.make && filters.make !== 'all') params.set('make', filters.make);
      if (filters.category && filters.category !== 'all') params.set('category', filters.category);
      if (filters.priceMin) params.set('priceMin', filters.priceMin);
      if (filters.priceMax) params.set('priceMax', filters.priceMax);
      if (filters.year) params.set('year', filters.year);
      if (filters.region && filters.region !== 'all') params.set('region', filters.region);
      if (filters.sourceType && filters.sourceType !== 'all') params.set('sourceType', filters.sourceType);
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`/api/cars-for-sale?${params}`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      return response.json();
    },
  });

  const filteredVehicles = vehiclesData?.vehicles || [];

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'Price on Request';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numPrice);
  };

  const getInvestmentBadgeColor = (grade?: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-600 hover:bg-green-700';
      case 'A': return 'bg-green-500 hover:bg-green-600';
      case 'A-': return 'bg-blue-500 hover:bg-blue-600';
      case 'B+': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getSourceBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'gateway': return 'bg-blue-600 hover:bg-blue-700';
      case 'research': return 'bg-purple-600 hover:bg-purple-700';
      case 'import': return 'bg-orange-600 hover:bg-orange-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Cars for Sale</h1>
          <p className="text-red-400">Error loading vehicles: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Classic Cars for Sale
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover authenticated classic cars from trusted dealers nationwide with investment analysis and market insights
            </p>
            
            {vehiclesData?.sources && (
              <div className="flex justify-center gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{vehiclesData.sources.gateway}</div>
                  <div className="text-sm text-gray-400">Gateway Classics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{vehiclesData.sources.research}</div>
                  <div className="text-sm text-gray-400">Research Finds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{vehiclesData.sources.import}</div>
                  <div className="text-sm text-gray-400">Market Imports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{vehiclesData.total}</div>
                  <div className="text-sm text-gray-400">Total Vehicles</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by make, model, year, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              <Select value={filters.make} onValueChange={(value) => setFilters({...filters, make: value})}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                  <SelectItem value="Ford">Ford</SelectItem>
                  <SelectItem value="Dodge">Dodge</SelectItem>
                  <SelectItem value="Plymouth">Plymouth</SelectItem>
                  <SelectItem value="Pontiac">Pontiac</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Muscle Cars">Muscle Cars</SelectItem>
                  <SelectItem value="Sports Cars">Sports Cars</SelectItem>
                  <SelectItem value="Classic Cars">Classic Cars</SelectItem>
                  <SelectItem value="Luxury Cars">Luxury Cars</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.region} onValueChange={(value) => setFilters({...filters, region: value})}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="midwest">Midwest</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                  <SelectItem value="northeast">Northeast</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sourceType} onValueChange={(value) => setFilters({...filters, sourceType: value})}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="gateway">Gateway Classic Cars</SelectItem>
                  <SelectItem value="research">Research Finds</SelectItem>
                  <SelectItem value="import">Market Imports</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Year"
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />

              <div className="flex gap-2">
                <Input
                  placeholder="Min Price"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 text-gray-300 flex items-center gap-4">
          {isLoading ? (
            <div>Loading vehicles...</div>
          ) : (
            <div>Showing {filteredVehicles.length} vehicles</div>
          )}
          {isAuthenticated && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              <Star className="w-3 h-3 mr-1" />
              Personalized For You
            </Badge>
          )}
        </div>

        {/* Vehicle Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="p-0">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={vehicle.imageUrl || `https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&q=80`}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        {vehicle.investmentGrade && (
                          <Badge className={`${getInvestmentBadgeColor(vehicle.investmentGrade)} text-white`}>
                            <Award className="h-3 w-3 mr-1" />
                            {vehicle.investmentGrade}
                          </Badge>
                        )}
                        <Badge className={`${getSourceBadgeColor(vehicle.sourceType)} text-white`}>
                          {vehicle.sourceType === 'gateway' ? 'Gateway' : 
                           vehicle.sourceType === 'research' ? 'Research' : 'Import'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl text-white mb-2">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </CardTitle>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-xl font-semibold text-green-400">
                        {formatPrice(vehicle.price)}
                      </span>
                    </div>

                    {vehicle.locationCity && vehicle.locationState && (
                      <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{vehicle.locationCity}, {vehicle.locationState}</span>
                      </div>
                    )}

                    {vehicle.appreciationRate && (
                      <div className="flex items-center gap-2 mb-2 text-green-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">{vehicle.appreciationRate} appreciation</span>
                      </div>
                    )}

                    {vehicle.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {vehicle.description}
                      </p>
                    )}

                    <div className="flex gap-2 flex-wrap mb-4">
                      {vehicle.category && (
                        <Badge variant="outline" className="border-slate-600 text-gray-300">
                          {vehicle.category}
                        </Badge>
                      )}
                      {vehicle.condition && (
                        <Badge variant="outline" className="border-slate-600 text-gray-300">
                          {vehicle.condition}
                        </Badge>
                      )}
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredVehicles.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">No vehicles found matching your criteria</div>
            <Button 
              onClick={() => {
                setFilters({
                  make: 'all',
                  category: 'all',
                  priceMin: '',
                  priceMax: '',
                  year: '',
                  region: 'all',
                  sourceType: 'all'
                });
                setSearchTerm('');
              }}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}