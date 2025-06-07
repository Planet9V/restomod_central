import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, DollarSign, Calendar, Filter, Search, Star, ExternalLink, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GatewayVehicle {
  id: number;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  price: string;
  mileage?: number;
  engine?: string;
  transmission?: string;
  exterior?: string;
  interior?: string;
  category: string;
  condition: string;
  location: string;
  description?: string;
  imageUrl?: string;
  featured: boolean;
  investmentGrade?: string;
  appreciationPotential?: string;
  rarity?: string;
  restorationLevel?: string;
  marketTrend?: string;
}

export default function GatewayVehicles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [makeFilter, setMakeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [vehiclesData, setVehiclesData] = useState<{ vehicles: GatewayVehicle[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAuthenticVehicles = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (makeFilter !== "all") params.append('make', makeFilter);
        if (categoryFilter !== "all") params.append('category', categoryFilter);
        if (featuredOnly) params.append('featured', 'true');

        const response = await fetch(`/api/gateway-vehicles?${params.toString()}`);
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          setVehiclesData({ vehicles: data });
          setError(null);
          console.log(`✅ Loaded ${data.length} authentic Gateway Classic Cars from Neon database`);
        } else if (data.success && data.vehicles) {
          setVehiclesData({ vehicles: data.vehicles });
          setError(null);
          console.log(`✅ Loaded ${data.vehicles.length} authentic Gateway Classic Cars from Neon database`);
        } else {
          throw new Error('Failed to fetch Gateway Classic Cars inventory');
        }
      } catch (err) {
        setError(err as Error);
        setVehiclesData(null);
        console.error('❌ Failed to load Gateway vehicles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthenticVehicles();
  }, [makeFilter, categoryFilter, featuredOnly]);

  const vehicles = vehiclesData?.vehicles || [];

  // Filter vehicles by search term
  const filteredVehicles = vehicles.filter((vehicle: GatewayVehicle) =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.year.toString().includes(searchTerm.toLowerCase())
  );

  // Get unique makes for filter dropdown
  const availableMakes = [...new Set(vehicles.map(v => v.make))].sort();
  const availableCategories = [...new Set(vehicles.map(v => v.category))].sort();

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getInvestmentBadgeColor = (grade?: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800 border-green-300';
      case 'A': return 'bg-green-50 text-green-700 border-green-200';
      case 'B+': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'B': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Car className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Gateway Classic Cars</h2>
            <p className="text-gray-600">Fetching authentic inventory from St. Louis showroom...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Vehicles</h2>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Premium Classic Cars
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"> Collection</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Curated collection of investment-grade classic cars from authenticated auction houses, 
              certified dealers, and private collections worldwide. {vehicles.length} vehicles with AI-powered market analysis.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Global Inventory</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <span>{vehicles.length} Vehicles</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>AI Curated</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Investment Grade</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Authenticated Sources & AI Features Section */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authenticated Global Sources & AI Curation</h2>
            <p className="text-gray-600 max-w-4xl mx-auto">
              Our unified automotive database aggregates investment-grade vehicles from verified auction houses, 
              certified dealers, and private collections. Advanced AI algorithms provide market analysis, 
              investment recommendations, and personalized vehicle matching.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-sm text-gray-900">Barrett-Jackson</div>
              <div className="text-xs text-gray-600">Scottsdale Auctions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-sm text-gray-900">Mecum Auctions</div>
              <div className="text-xs text-gray-600">Premier Classic Cars</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-sm text-gray-900">RM Sotheby's</div>
              <div className="text-xs text-gray-600">Luxury Collections</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-sm text-gray-900">Bonhams</div>
              <div className="text-xs text-gray-600">European Classics</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-sm text-gray-900">RK Motors</div>
              <div className="text-xs text-gray-600">Performance Builds</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-sm text-gray-900">Gateway Classic</div>
              <div className="text-xs text-gray-600">St. Louis Showroom</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Search</h3>
              <p className="text-sm text-gray-600">Intelligent vehicle matching based on preferences, budget, and investment goals</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Market Analysis</h3>
              <p className="text-sm text-gray-600">Real-time valuation, appreciation trends, and investment grade scoring</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Curation</h3>
              <p className="text-sm text-gray-600">Authenticated provenance, condition reports, and investment recommendations</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
              onClick={() => window.open('/ai-assistant', '_blank')}
            >
              <Search className="h-5 w-5 mr-2" />
              Get AI Vehicle Recommendations
            </Button>
            <p className="text-sm text-gray-500 mt-2">Chat with our AI assistant for personalized vehicle matching and investment advice</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-sm border-b py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={makeFilter} onValueChange={setMakeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {availableMakes.map((make) => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant={featuredOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Featured Only
              </Button>
              <span className="text-sm text-gray-600">
                {filteredVehicles.length} of {vehicles.length} vehicles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg flex items-center justify-center">
                      <Car className="h-16 w-16 text-gray-400" />
                    </div>
                    {vehicle.featured && (
                      <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-900">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {vehicle.investmentGrade && (
                      <Badge className={`absolute top-3 left-3 ${getInvestmentBadgeColor(vehicle.investmentGrade)}`}>
                        Grade {vehicle.investmentGrade}
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <CardDescription>
                      Stock #{vehicle.stockNumber} • {vehicle.condition}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(vehicle.price)}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {vehicle.category}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        {vehicle.mileage && (
                          <div>
                            <span className="font-medium">Mileage:</span>
                            <br />
                            {vehicle.mileage.toLocaleString()} mi
                          </div>
                        )}
                        {vehicle.engine && (
                          <div>
                            <span className="font-medium">Engine:</span>
                            <br />
                            {vehicle.engine}
                          </div>
                        )}
                        {vehicle.transmission && (
                          <div>
                            <span className="font-medium">Trans:</span>
                            <br />
                            {vehicle.transmission}
                          </div>
                        )}
                        {vehicle.exterior && (
                          <div>
                            <span className="font-medium">Exterior:</span>
                            <br />
                            {vehicle.exterior}
                          </div>
                        )}
                      </div>

                      {vehicle.appreciationPotential && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Investment Potential:</span>
                          <Badge 
                            variant="outline" 
                            className={
                              vehicle.appreciationPotential === 'High' ? 'text-green-700 border-green-300' :
                              vehicle.appreciationPotential === 'Medium' ? 'text-blue-700 border-blue-300' :
                              'text-gray-700 border-gray-300'
                            }
                          >
                            {vehicle.appreciationPotential}
                          </Badge>
                        </div>
                      )}

                      <Button className="w-full" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}