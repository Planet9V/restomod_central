import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon, Settings2, Info, Tool, Car } from 'lucide-react';
import GeneratedImageDisplay from './GeneratedImageDisplay';
import VehicleResearchDetails from './VehicleResearchDetails';
import PartResearchDetails from './PartResearchDetails';

const POPULAR_CLASSIC_CARS = [
  "1967 Ford Mustang",
  "1969 Chevrolet Camaro",
  "1965 Shelby Cobra", 
  "1970 Dodge Charger",
  "1953 Ford F100",
  "1957 Chevrolet Bel Air",
  "1969 Ford Mustang Fastback"
];

const POPULAR_CAR_PARTS = [
  "Engine",
  "Transmission",
  "Suspension",
  "Brakes",
  "Wheels", 
  "Interior",
  "Exhaust",
  "Seats"
];

interface ConfiguratorDashboardProps {
  className?: string;
}

const ConfiguratorDashboard: React.FC<ConfiguratorDashboardProps> = ({ className = '' }) => {
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [carInput, setCarInput] = useState<string>('');
  
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [partInput, setPartInput] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<string>('vehicle');
  
  // Handle car submission
  const handleCarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCar(carInput);
  };
  
  // Handle part submission
  const handlePartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedPart(partInput);
  };
  
  // Handle selecting a car from the dropdown
  const handleSelectCar = (car: string) => {
    setCarInput(car);
    setSelectedCar(car);
  };
  
  // Handle selecting a part from the dropdown
  const handleSelectPart = (part: string) => {
    setPartInput(part);
    setSelectedPart(part);
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Left column - Image and search */}
      <div className="col-span-1">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5" />
              Vehicle Configurator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                <TabsTrigger value="part">Parts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="vehicle" className="mt-4">
                <form onSubmit={handleCarSubmit} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input 
                      placeholder="Enter car model..."
                      value={carInput}
                      onChange={(e) => setCarInput(e.target.value)}
                    />
                    <Button type="submit">
                      <SearchIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Popular Models:</p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_CLASSIC_CARS.map((car) => (
                        <Button 
                          key={car} 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSelectCar(car)}
                          className={selectedCar === car ? 'border-primary' : ''}
                        >
                          {car}
                        </Button>
                      ))}
                    </div>
                  </div>
                </form>
                
                {selectedCar && (
                  <div className="mt-4">
                    <GeneratedImageDisplay 
                      car={selectedCar}
                      className="mb-4"
                    />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="part" className="mt-4">
                <form onSubmit={handlePartSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <Input 
                      placeholder="Enter part name..."
                      value={partInput}
                      onChange={(e) => setPartInput(e.target.value)}
                      className="mb-2"
                    />
                    
                    <Select
                      value={selectedCar}
                      onValueChange={setSelectedCar}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a car model (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_CLASSIC_CARS.map((car) => (
                          <SelectItem key={car} value={car}>{car}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button type="submit" className="w-full">
                      <SearchIcon className="h-4 w-4 mr-2" /> Search
                    </Button>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Popular Parts:</p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_CAR_PARTS.map((part) => (
                        <Button 
                          key={part} 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSelectPart(part)}
                          className={selectedPart === part ? 'border-primary' : ''}
                        >
                          {part}
                        </Button>
                      ))}
                    </div>
                  </div>
                </form>
                
                {selectedPart && (
                  <div className="mt-4">
                    <GeneratedImageDisplay 
                      part={selectedPart}
                      car={selectedCar || undefined}
                      className="mb-4"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Center and right columns - Research details */}
      <div className="col-span-1 lg:col-span-2">
        {activeTab === 'vehicle' && selectedCar ? (
          <VehicleResearchDetails modelName={selectedCar} />
        ) : activeTab === 'part' && selectedPart ? (
          <PartResearchDetails 
            partName={selectedPart} 
            modelName={selectedCar || undefined} 
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Restomod Research Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select a vehicle or part to view detailed information and research. 
                Our AI-powered system will provide you with comprehensive details about 
                classic vehicles, restoration options, and compatible parts.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      Vehicle Research
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Research classic vehicles, discover their history, specifications, and current market value.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Tool className="h-4 w-4 mr-2" />
                      Parts Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Find compatibility information, installation guides, and price ranges for classic car parts.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConfiguratorDashboard;