import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Check, Zap, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ConfigurationState {
  platformId: string;
  engineId: string;
  transmissionId: string;
  suspensionId: string;
  fuelSystemId: string;
  interiorId: string;
  step: number;
}

const STEPS = [
  { id: 1, title: "Vehicle Platform", description: "Choose your investment-grade foundation" },
  { id: 2, title: "Engine Swap", description: "Select modern powerplant" },
  { id: 3, title: "Transmission", description: "Choose drivetrain setup" },
  { id: 4, title: "Suspension", description: "Upgrade handling system" },
  { id: 5, title: "Fuel System", description: "Modern fuel delivery" },
  { id: 6, title: "Interior", description: "Luxury appointments" },
  { id: 7, title: "Summary", description: "Review your build" }
];

export default function EnhancedStepByStep() {
  const [config, setConfig] = useState<ConfigurationState>({
    platformId: "",
    engineId: "",
    transmissionId: "",
    suspensionId: "",
    fuelSystemId: "",
    interiorId: "",
    step: 1
  });

  // Fetch authentic vehicle platforms
  const { data: platformsData } = useQuery({
    queryKey: ["/api/configurator/platforms"],
    enabled: config.step === 1
  });

  // Fetch compatible engines based on selected platform
  const { data: enginesData } = useQuery({
    queryKey: ["/api/configurator/engines", config.platformId],
    enabled: config.step === 2 && !!config.platformId
  });

  // Fetch compatible transmissions based on selected engine
  const { data: transmissionsData } = useQuery({
    queryKey: ["/api/configurator/transmissions", config.engineId],
    enabled: config.step === 3 && !!config.engineId
  });

  // Fetch suspension options based on platform
  const { data: suspensionData } = useQuery({
    queryKey: ["/api/configurator/suspension", config.platformId],
    enabled: config.step === 4 && !!config.platformId
  });

  // Fetch fuel systems based on engine
  const { data: fuelSystemData } = useQuery({
    queryKey: ["/api/configurator/fuel-systems", config.engineId],
    enabled: config.step === 5 && !!config.engineId
  });

  // Fetch interior options based on platform
  const { data: interiorData } = useQuery({
    queryKey: ["/api/configurator/interiors", config.platformId],
    enabled: config.step === 6 && !!config.platformId
  });

  // Calculate final configuration
  const { data: calculationData } = useQuery({
    queryKey: ["/api/configurator/calculate"],
    enabled: config.step === 7 && !!config.platformId && !!config.engineId,
    queryFn: async () => {
      const response = await fetch("/api/configurator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      return response.json();
    }
  });

  const handleSelection = (field: keyof ConfigurationState, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (config.step < STEPS.length) {
      setConfig(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => {
    if (config.step > 1) {
      setConfig(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const renderStepContent = () => {
    switch (config.step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Choose Your Investment Platform</h3>
              <p className="text-muted-foreground">Select a classic car with proven appreciation potential</p>
            </div>
            
            {platformsData?.success && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {platformsData.platforms.map((platform: any) => (
                  <Card 
                    key={platform.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      config.platformId === platform.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelection('platformId', platform.id)}
                  >
                    <CardHeader>
                      <img 
                        src={platform.imageUrl} 
                        alt={platform.name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                      <CardTitle className="flex justify-between items-start">
                        <span>{platform.name}</span>
                        <Badge variant="secondary">{platform.investmentGrade}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{platform.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Base Price:</span>
                          <span className="font-semibold">{formatPrice(platform.basePrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Appreciation:</span>
                          <span className="text-green-600 font-semibold">{platform.appreciationRate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Market Value:</span>
                          <span className="font-semibold">{platform.marketValue}/100</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Select Modern Engine</h3>
              <p className="text-muted-foreground">Choose authentic high-performance powerplant</p>
            </div>
            
            {enginesData?.success && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enginesData.engines.map((engine: any) => (
                  <Card 
                    key={engine.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      config.engineId === engine.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelection('engineId', engine.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span>{engine.name}</span>
                        <Badge variant="outline">{engine.manufacturer}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{engine.description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="font-bold text-2xl text-primary">{engine.horsepower}</div>
                          <div className="text-sm text-muted-foreground">Horsepower</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-2xl text-primary">{engine.torque}</div>
                          <div className="text-sm text-muted-foreground">lb-ft Torque</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Engine Price:</span>
                          <span className="font-semibold">{formatPrice(engine.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Installation:</span>
                          <span className="font-semibold">{formatPrice(engine.installationCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Type:</span>
                          <span className="text-sm">{engine.engineType}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Choose Transmission</h3>
              <p className="text-muted-foreground">Select compatible drivetrain option</p>
            </div>
            
            {transmissionsData?.success && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transmissionsData.transmissions.map((transmission: any) => (
                  <Card 
                    key={transmission.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      config.transmissionId === transmission.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelection('transmissionId', transmission.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span>{transmission.name}</span>
                        <Badge variant="outline">{transmission.type}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{transmission.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Price:</span>
                          <span className="font-semibold">{formatPrice(transmission.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Installation:</span>
                          <span className="font-semibold">{formatPrice(transmission.installationCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Speeds:</span>
                          <span className="text-sm">{transmission.speeds}-speed</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Torque Rating:</span>
                          <span className="text-sm">{transmission.torqueRating} lb-ft</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Configuration Summary</h3>
              <p className="text-muted-foreground">Review your investment-grade restomod build</p>
            </div>
            
            {calculationData?.success && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Performance Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="font-bold text-3xl text-primary">
                          {calculationData.configuration.estimatedPerformance.horsepower}
                        </div>
                        <div className="text-sm text-muted-foreground">Horsepower</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-3xl text-primary">
                          {calculationData.configuration.estimatedPerformance.torque}
                        </div>
                        <div className="text-sm text-muted-foreground">lb-ft Torque</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-2xl text-primary">
                          {calculationData.configuration.estimatedPerformance.acceleration}s
                        </div>
                        <div className="text-sm text-muted-foreground">0-60 mph</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-2xl text-primary">
                          {calculationData.configuration.estimatedPerformance.topSpeed}
                        </div>
                        <div className="text-sm text-muted-foreground">Top Speed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Investment Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Base Vehicle:</span>
                        <span className="font-semibold">
                          {formatPrice(calculationData.configuration.pricing.basePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parts & Components:</span>
                        <span className="font-semibold">
                          {formatPrice(calculationData.configuration.pricing.totalPrice - calculationData.configuration.pricing.basePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Installation Labor:</span>
                        <span className="font-semibold">
                          {formatPrice(calculationData.configuration.pricing.installationCost)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Investment:</span>
                        <span className="text-primary">
                          {formatPrice(calculationData.configuration.pricing.grandTotal)}
                        </span>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-800">Investment Grade</span>
                        </div>
                        <div className="text-sm text-green-700">
                          <div>Grade: {calculationData.configuration.investmentData.investmentGrade}</div>
                          <div>Appreciation: {calculationData.configuration.investmentData.appreciationRate}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      default:
        return <div>Step content for step {config.step}</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${config.step === step.id 
                  ? 'bg-primary text-primary-foreground' 
                  : config.step > step.id 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {config.step > step.id ? <Check className="h-5 w-5" /> : step.id}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${config.step > step.id ? 'bg-green-500' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{STEPS[config.step - 1].title}</h2>
          <p className="text-muted-foreground">{STEPS[config.step - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={config.step === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={nextStep} 
          disabled={config.step === STEPS.length}
          className="flex items-center gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}