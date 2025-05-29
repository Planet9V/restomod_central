import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Zap, DollarSign, TrendingUp } from "lucide-react";
import VideoHeader from "@/components/layout/VideoHeader";
import { useQuery } from "@tanstack/react-query";

const STEPS = [
  { id: 1, title: "Vehicle Platform", description: "Choose your investment-grade foundation" },
  { id: 2, title: "Engine Swap", description: "Select modern powerplant" },
  { id: 3, title: "Transmission", description: "Choose drivetrain setup" },
  { id: 4, title: "Interior", description: "Luxury appointments" },
  { id: 5, title: "Summary", description: "Review your build" }
];

const CarConfigurator = () => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    platformId: "",
    engineId: "",
    transmissionId: "",
    interiorId: ""
  });

  // Fetch authentic Gateway vehicles for platforms
  const { data: platformsData } = useQuery({
    queryKey: ["/api/configurator/platforms"],
    enabled: step === 1
  });

  // Fetch authentic engine options
  const { data: enginesData } = useQuery({
    queryKey: ["/api/configurator/engines"],
    enabled: step === 2
  });

  // Fetch transmission options
  const { data: transmissionsData } = useQuery({
    queryKey: ["/api/configurator/transmissions"],
    enabled: step === 3
  });

  // Fetch interior options
  const { data: interiorsData } = useQuery({
    queryKey: ["/api/configurator/interiors"],
    enabled: step === 4
  });

  // Calculate final configuration
  const { data: calculationData } = useQuery({
    queryKey: ["/api/configurator/calculate"],
    enabled: step === 5 && !!config.platformId && !!config.engineId,
    queryFn: async () => {
      const response = await fetch("/api/configurator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      return response.json();
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const nextStep = () => {
    if (step < STEPS.length) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepContent = () => {
    switch (step) {
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
                    onClick={() => setConfig({...config, platformId: platform.id})}
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
                    onClick={() => setConfig({...config, engineId: engine.id})}
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
                    onClick={() => setConfig({...config, transmissionId: transmission.id})}
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
                          <span className="text-sm">Speeds:</span>
                          <span className="text-sm">{transmission.speeds}-speed</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Interior Options</h3>
              <p className="text-muted-foreground">Choose your luxury appointments</p>
            </div>
            
            {interiorsData?.success && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {interiorsData.interiors.map((interior: any) => (
                  <Card 
                    key={interior.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      config.interiorId === interior.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setConfig({...config, interiorId: interior.id})}
                  >
                    <CardHeader>
                      <img 
                        src={interior.imageUrl} 
                        alt={interior.name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                      <CardTitle>{interior.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{interior.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Price:</span>
                          <span className="font-semibold">{formatPrice(interior.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Material:</span>
                          <span className="text-sm">{interior.material}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
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
                        <span>Total Investment:</span>
                        <span className="text-lg font-bold text-primary">
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
        return <div>Step content for step {step}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <VideoHeader
        videoSrc="https://static.replit.com/videos/automotive-hero-bg.mp4"
        title="Car Configurator"
        subtitle="Build Your Dream Restomod with Investment-Grade Components"
        overlay="dark"
      />

      {/* Configurator */}
      <div className="relative -mt-20 z-10">
        <div className="max-w-6xl mx-auto p-6">
          {/* Step Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((stepItem, index) => (
                <div key={stepItem.id} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${step === stepItem.id 
                      ? 'bg-primary text-primary-foreground' 
                      : step > stepItem.id 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {step > stepItem.id ? <Check className="h-5 w-5" /> : stepItem.id}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`
                      w-16 h-1 mx-2
                      ${step > stepItem.id ? 'bg-green-500' : 'bg-muted'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">{STEPS[step - 1].title}</h2>
              <p className="text-muted-foreground">{STEPS[step - 1].description}</p>
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
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button 
              onClick={nextStep} 
              disabled={step === STEPS.length}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Back to Projects Link */}
      <div className="container mx-auto px-6 py-8">
        <Link href="/custom-builds">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Custom Builds
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CarConfigurator;