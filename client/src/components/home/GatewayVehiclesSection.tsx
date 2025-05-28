import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Car, ChevronRight, DollarSign, Calendar, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Type for Gateway vehicles from database
type GatewayVehicle = {
  id: number;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  price: number;
  mileage: number | null;
  engine: string | null;
  transmission: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  description: string | null;
  features: string[] | null;
  condition: string | null;
  category: string | null;
  imageUrl: string | null;
  galleryImages: string[] | null;
  featured: boolean;
};

export function GatewayVehiclesSection() {
  // Query for featured Gateway vehicles from database
  const { data: vehiclesResponse, isLoading } = useQuery<{success: boolean, vehicles: GatewayVehicle[]}>({
    queryKey: ['/api/gateway-vehicles?featured=true&limit=6'],
    retry: 1,
  });

  // Get featured vehicles for valuation reference
  const featuredVehicles = vehiclesResponse?.vehicles?.slice(0, 6) || [];

  return (
    <section className="container py-12 space-y-6 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vehicle Valuations & Market Data</h2>
          <p className="text-muted-foreground mt-2">
            Real market prices from Gateway Classic Cars • {vehiclesResponse?.vehicles?.length || 90} vehicles for reference
          </p>
        </div>
        <Link href="/gateway-vehicles">
          <Button variant="outline" className="group">
            View All Vehicles
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-[180px] w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : featuredVehicles && featuredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="relative h-[180px] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                {vehicle.imageUrl ? (
                  <img 
                    src={vehicle.imageUrl} 
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="h-12 w-12 text-zinc-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-green-500 text-white font-semibold">
                    <DollarSign className="mr-1 h-3 w-3" />
                    ${vehicle.price.toLocaleString()}
                  </Badge>
                </div>
                {vehicle.featured && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-orange-500 text-white">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                  {vehicle.trim && <span className="text-sm font-normal text-muted-foreground"> {vehicle.trim}</span>}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  Stock #{vehicle.stockNumber} • {vehicle.category || 'Classic Vehicle'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pb-2">
                <div className="space-y-2">
                  {vehicle.mileage && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Gauge className="mr-2 h-4 w-4" />
                      {vehicle.mileage.toLocaleString()} miles
                    </div>
                  )}
                  {vehicle.engine && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {vehicle.engine}
                    </div>
                  )}
                  {vehicle.condition && (
                    <Badge variant="outline" className="w-fit">
                      {vehicle.condition}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Vehicle data loading...</p>
          <p className="text-muted-foreground mt-2">Check our full vehicle database for market valuations</p>
          <Link href="/gateway-vehicles">
            <Button className="mt-4">
              Browse All Vehicles
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}