import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Info, Settings, Check, Search } from "lucide-react";
import VideoHeader from "@/components/layout/VideoHeader";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import ResearchPanel from "@/components/configurator/ResearchPanel";
import PartResearchPanel from "@/components/configurator/PartResearchPanel";
import ConfiguratorDashboard from "@/components/configurator/ConfiguratorDashboard";

const CarConfigurator = () => {
  // Configuration state
  const [step, setStep] = useState<number>(1);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedConfig, setSelectedConfig] = useState<{
    model: string;
    bodyType: string;
    engineType: string;
    transmission: string;
    color: string;
    wheels: string;
    interior: string;
    options: string[];
    aiFeatures: string[];
  }>({ 
    model: "", 
    bodyType: "", 
    engineType: "", 
    transmission: "", 
    color: "", 
    wheels: "", 
    interior: "", 
    options: [], 
    aiFeatures: []
  });
  
  // AI recommendation state
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  
  // Research panel state
  const [showVehicleResearch, setShowVehicleResearch] = useState<boolean>(false);
  const [showPartResearch, setShowPartResearch] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<string>("");
  const [realVehicleImage, setRealVehicleImage] = useState<string>("");
  const [realPartImage, setRealPartImage] = useState<string>("");
  
  // Car models data
  const models = [
    {
      id: "mustang1967",
      name: "1967 Ford Mustang Fastback",
      description: "The iconic American pony car with timeless styling",
      price: 85000,
      image: "https://images.luxuryautodirect.com/19997/1967-ford-mustang-restomod-3.jpg",
      bodyTypes: ["Fastback", "Coupe", "Convertible"],
      baseHp: 450,
      baseAcceleration: 4.5,
      baseTopSpeed: 155
    },
    {
      id: "camaro1968",
      name: "1968 Chevrolet Camaro",
      description: "Chevrolet's answer to the Mustang with aggressive styling",
      price: 82000,
      image: "https://www.speednik.com/wp-content/blogs.dir/1/files/2020/04/the-great-camaro-debate-first-gen-vs-second-gen-pro-touring-2020-04-13_12-54-36_551288.jpg",
      bodyTypes: ["Coupe", "Convertible"],
      baseHp: 430,
      baseAcceleration: 4.7,
      baseTopSpeed: 150
    },
    {
      id: "fordF1001953",
      name: "1953 Ford F-100 Pickup",
      description: "The iconic American workhorse reimagined",
      price: 95000,
      image: "https://i.ebayimg.com/images/g/f4wAAOSw36NgnEbh/s-l1600.jpg",
      bodyTypes: ["Pickup", "Extended Cab"],
      baseHp: 400,
      baseAcceleration: 5.2,
      baseTopSpeed: 130
    },
    {
      id: "chevyII1966",
      name: "1966 Chevrolet Nova",
      description: "Compact muscle with classic lines",
      price: 78000,
      image: "https://cdn.mecum.com/auctions/fl0122/fl0122-488549/images/20211021195321-1634862802378@2x.jpg",
      bodyTypes: ["Coupe", "Sedan"],
      baseHp: 425,
      baseAcceleration: 4.6,
      baseTopSpeed: 145
    }
  ];
  
  // Engine options
  const engineOptions = [
    {
      id: "coyote50",
      name: "Ford Coyote 5.0L V8",
      power: "460 hp",
      description: "Modern Ford V8 with excellent power and reliability",
      price: 18500,
      compatibleModels: ["mustang1967", "fordF1001953"]
    },
    {
      id: "ls376",
      name: "Chevrolet LS3 6.2L V8",
      power: "525 hp",
      description: "Powerful and versatile GM small block V8",
      price: 19800,
      compatibleModels: ["camaro1968", "chevyII1966", "fordF1001953"]
    },
    {
      id: "hellcrate",
      name: "Mopar Hellcrate 6.2L Supercharged V8",
      power: "707 hp",
      description: "Supercharged powerhouse for serious performance",
      price: 29500,
      compatibleModels: ["mustang1967", "camaro1968", "chevyII1966"]
    },
    {
      id: "windsor351",
      name: "Ford Windsor 351 Stroker",
      power: "450 hp",
      description: "Classic Ford V8 with modern internals",
      price: 16500,
      compatibleModels: ["mustang1967", "fordF1001953"]
    },
    {
      id: "ls7",
      name: "GM LS7 7.0L V8",
      power: "625 hp",
      description: "Naturally aspirated, high-revving performance",
      price: 25800,
      compatibleModels: ["camaro1968", "chevyII1966"]
    }
  ];
  
  // Transmission options
  const transmissionOptions = [
    {
      id: "tremec6",
      name: "TREMEC 6-Speed Manual",
      description: "Modern 6-speed manual with precise shifts and overdrive",
      price: 8900
    },
    {
      id: "4l80e",
      name: "GM 4L80E Automatic",
      description: "Heavy-duty 4-speed automatic with electronic controls",
      price: 7500
    },
    {
      id: "10r80",
      name: "Ford 10R80 10-Speed Automatic",
      description: "State-of-the-art 10-speed automatic with adaptive shifting",
      price: 12800
    },
    {
      id: "t56",
      name: "TREMEC T-56 Magnum",
      description: "Legendary 6-speed manual, overbuilt for high torque applications",
      price: 9500
    }
  ];
  
  // Color options
  const colorOptions = [
    { id: "vintage-white", name: "Vintage White", hex: "#F5F5F5", price: 0 },
    { id: "rally-red", name: "Rally Red", hex: "#B22222", price: 0 },
    { id: "gulf-blue", name: "Gulf Blue", hex: "#2981BC", price: 0 },
    { id: "british-racing-green", name: "British Racing Green", hex: "#004225", price: 0 },
    { id: "sunset-orange", name: "Sunset Orange", hex: "#E55B13", price: 850 },
    { id: "midnight-purple", name: "Midnight Purple", hex: "#2E1A47", price: 850 },
    { id: "titanium-silver", name: "Titanium Silver", hex: "#C0C0C0", price: 850 },
    { id: "custom-paint", name: "Custom Color", hex: "gradient", price: 3500 },
  ];
  
  // Wheels options
  const wheelOptions = [
    { 
      id: "torq-thrust", 
      name: "American Racing Torq Thrust", 
      description: "Classic 5-spoke design, 18-inch", 
      image: "https://www.americanracing.com/globalassets/wheels/torq-thrust-original/vn1095773.png", 
      price: 3200 
    },
    { 
      id: "rally", 
      name: "Rally Wheels with Trim Rings", 
      description: "Period-correct look, 17-inch", 
      image: "https://www.summitracing.com/images/D/wv-421-grv1-0.jpg", 
      price: 2800 
    },
    { 
      id: "forgeline", 
      name: "Forgeline Heritage Series", 
      description: "Modern 3-piece forged wheels, 19-inch", 
      image: "https://www.forgeline.com/wp-content/uploads/GA3C-SL-CCC_front.jpg", 
      price: 7500 
    },
    { 
      id: "rotiform", 
      name: "Rotiform BUC-M", 
      description: "Modern monoblock design, 20-inch", 
      image: "https://www.whelenpublicsafety.com/wp-content/uploads/2021/05/rotiform_wheel_buc_machined_22xj750.jpg", 
      price: 5200 
    },
  ];
  
  // Interior options
  const interiorOptions = [
    { 
      id: "classic", 
      name: "Classic Restoration", 
      description: "Period-correct materials and details with subtle modern upgrades", 
      image: "https://i.pinimg.com/originals/1a/8a/31/1a8a31c8ebad9ad24a10cb2fd71e2dd1.jpg", 
      price: 12000 
    },
    { 
      id: "vintage-luxury", 
      name: "Vintage Luxury", 
      description: "Premium leather throughout with contrast stitching and modern amenities", 
      image: "https://i.pinimg.com/736x/b3/1d/60/b31d6008c56f0c95c8f8c0d92c212e04.jpg", 
      price: 18500 
    },
    { 
      id: "modern-sport", 
      name: "Modern Sport", 
      description: "Recaro seats, Alcantara accents, and racing-inspired details", 
      image: "https://i.pinimg.com/736x/cb/7b/46/cb7b46e03342d3d0fe5183740f042cc7.jpg", 
      price: 21000 
    },
    { 
      id: "custom-bespoke", 
      name: "Custom Bespoke", 
      description: "Fully customized interior to your exact specifications", 
      image: "https://www.autolifenation.net/wp-content/uploads/2022/11/Custom-Car-Interior-Components-and-What-They-Cost.jpg", 
      price: 35000 
    },
  ];
  
  // Additional options
  const additionalOptions = [
    { id: "custom-audio", name: "Premium Audio System", description: "High-end sound system with modern connectivity", price: 4500 },
    { id: "ac", name: "Modern Climate Control", description: "Vintage Air Gen IV system with digital controls", price: 5200 },
    { id: "power-windows", name: "Power Windows", description: "Electric window conversion with OEM-style switches", price: 2800 },
    { id: "wilwood-brakes", name: "Wilwood Performance Brakes", description: "6-piston front, 4-piston rear with 14-inch rotors", price: 8900 },
    { id: "coilover-suspension", name: "Detroit Speed Coilover Suspension", description: "Adjustable performance suspension system", price: 12500 },
    { id: "digital-gauges", name: "Dakota Digital Gauges", description: "Modern functionality with classic appearance", price: 3200 },
    { id: "power-steering", name: "Power Steering", description: "Modern power steering conversion", price: 3800 },
    { id: "led-lighting", name: "LED Lighting Package", description: "Modern lighting with vintage appearance", price: 2400 },
  ];
  
  // AI enhancement features
  const aiFeatureOptions = [
    { 
      id: "kitt-voice", 
      name: "K.I.T.T. Voice Assistant", 
      description: "AI-powered voice assistant with custom personality and vehicle integration", 
      price: 7500 
    },
    { 
      id: "predictive-dynamics", 
      name: "Predictive Driving Dynamics", 
      description: "AI system that learns your driving style and adjusts vehicle performance accordingly", 
      price: 9800 
    },
    { 
      id: "mood-sensing", 
      name: "Mood-Sensing Environment", 
      description: "Interior lighting, sound, and climate that adapts to driver mood and preferences", 
      price: 5400 
    },
    { 
      id: "augmented-reality", 
      name: "Augmented Reality HUD", 
      description: "Heads-up display with AR navigation and vehicle information", 
      price: 12500 
    },
    { 
      id: "autonomous-mode", 
      name: "Limited Autonomous Capability", 
      description: "Self-driving features for specific scenarios like highway cruising", 
      price: 18500 
    },
  ];
  
  // Get selected model data
  const getSelectedModelData = () => {
    return models.find(model => model.id === selectedModel) || null;
  };
  
  // Calculate total price
  const calculateTotalPrice = () => {
    let totalPrice = 0;
    const model = models.find(m => m.id === selectedConfig.model);
    if (model) totalPrice += model.price;
    
    const engine = engineOptions.find(e => e.id === selectedConfig.engineType);
    if (engine) totalPrice += engine.price;
    
    const transmission = transmissionOptions.find(t => t.id === selectedConfig.transmission);
    if (transmission) totalPrice += transmission.price;
    
    const color = colorOptions.find(c => c.id === selectedConfig.color);
    if (color) totalPrice += color.price;
    
    const wheels = wheelOptions.find(w => w.id === selectedConfig.wheels);
    if (wheels) totalPrice += wheels.price;
    
    const interior = interiorOptions.find(i => i.id === selectedConfig.interior);
    if (interior) totalPrice += interior.price;
    
    // Add additional options
    selectedConfig.options.forEach(optionId => {
      const option = additionalOptions.find(o => o.id === optionId);
      if (option) totalPrice += option.price;
    });
    
    // Add AI features
    selectedConfig.aiFeatures.forEach(featureId => {
      const feature = aiFeatureOptions.find(f => f.id === featureId);
      if (feature) totalPrice += feature.price;
    });
    
    return totalPrice;
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };
  
  // Get AI recommendation
  const getAiRecommendation = async () => {
    setIsLoadingAI(true);
    try {
      // Create a detailed prompt about the current configuration
      const selectedModel = models.find(m => m.id === selectedConfig.model);
      const selectedEngine = engineOptions.find(e => e.id === selectedConfig.engineType);
      const selectedTransmission = transmissionOptions.find(t => t.id === selectedConfig.transmission);
      const selectedColor = colorOptions.find(c => c.id === selectedConfig.color);
      const selectedWheels = wheelOptions.find(w => w.id === selectedConfig.wheels);
      const selectedInterior = interiorOptions.find(i => i.id === selectedConfig.interior);
      
      // Build the list of selected options
      const selectedOptions = selectedConfig.options.map(optionId => {
        return additionalOptions.find(o => o.id === optionId)?.name || "";
      }).filter(name => name !== "");
      
      // Build the list of selected AI features
      const selectedAiFeatures = selectedConfig.aiFeatures.map(featureId => {
        return aiFeatureOptions.find(f => f.id === featureId)?.name || "";
      }).filter(name => name !== "");
      
      // Construct a prompt about the car and asking for recommendations
      const prompt = `I'm configuring a classic restomod car with the following specs:
      - Model: ${selectedModel?.name || "Not selected"}
      - Engine: ${selectedEngine?.name || "Not selected"}
      - Transmission: ${selectedTransmission?.name || "Not selected"}
      - Color: ${selectedColor?.name || "Not selected"}
      - Wheels: ${selectedWheels?.name || "Not selected"}
      - Interior: ${selectedInterior?.name || "Not selected"}
      - Additional options: ${selectedOptions.length > 0 ? selectedOptions.join(", ") : "None"}
      - AI features: ${selectedAiFeatures.length > 0 ? selectedAiFeatures.join(", ") : "None"}
      
      Based on this configuration, can you recommend any modifications, improvements, or alternatives that would enhance the driving experience, performance, or value of this restomod build? Please keep your response concise and specific to this particular configuration.`;
      
      // Make the API call
      const response = await apiRequest<{ recommendation: string }>('/api/ai/configurator-recommendation', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
      
      if (response && response.recommendation) {
        setAiRecommendation(response.recommendation);
      }
    } catch (error) {
      console.error("Error getting AI recommendation:", error);
      setAiRecommendation("Unable to generate AI recommendation at this time. Please try again later.");
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setSelectedConfig(prev => ({
      ...prev,
      model: modelId,
      bodyType: "", // Reset dependent fields when model changes
      engineType: "",
      transmission: "",
      color: "",
      wheels: "",
      interior: "",
      options: [],
      aiFeatures: []
    }));
    setStep(2); // Move to next step
  };
  
  // Handle body type selection
  const handleBodyTypeSelect = (bodyType: string) => {
    setSelectedConfig(prev => ({
      ...prev,
      bodyType
    }));
    setStep(3); // Move to next step
  };
  
  // Handle engine selection
  const handleEngineSelect = (engineId: string) => {
    setSelectedConfig(prev => ({
      ...prev,
      engineType: engineId
    }));
    setStep(4); // Move to next step
  };
  
  // Handle transmission selection
  const handleTransmissionSelect = (transmissionId: string) => {
    setSelectedConfig(prev => ({
      ...prev,
      transmission: transmissionId
    }));
    setStep(5); // Move to next step
  };
  
  // Handle color selection
  const handleColorSelect = (colorId: string) => {
    setSelectedConfig(prev => ({
      ...prev,
      color: colorId
    }));
    setStep(6); // Move to next step
  };
  
  // Handle wheels selection
  const handleWheelsSelect = (wheelsId: string) => {
    setSelectedConfig(prev => ({
      ...prev,
      wheels: wheelsId
    }));
    setStep(7); // Move to next step
  };
  
  // Handle interior selection
  const handleInteriorSelect = (interiorId: string) => {
    setSelectedConfig(prev => ({
      ...prev,
      interior: interiorId
    }));
    setStep(8); // Move to next step
  };
  
  // Toggle additional option
  const toggleAdditionalOption = (optionId: string) => {
    setSelectedConfig(prev => {
      if (prev.options.includes(optionId)) {
        return {
          ...prev,
          options: prev.options.filter(id => id !== optionId)
        };
      } else {
        return {
          ...prev,
          options: [...prev.options, optionId]
        };
      }
    });
  };
  
  // Toggle AI feature
  const toggleAiFeature = (featureId: string) => {
    setSelectedConfig(prev => {
      if (prev.aiFeatures.includes(featureId)) {
        return {
          ...prev,
          aiFeatures: prev.aiFeatures.filter(id => id !== featureId)
        };
      } else {
        return {
          ...prev,
          aiFeatures: [...prev.aiFeatures, featureId]
        };
      }
    });
  };
  
  // Navigate to previous step
  const goToPrevStep = () => {
    if (step > 1) setStep(step - 1);
  };
  
  // Navigate to next step
  const goToNextStep = () => {
    if (step < 10) setStep(step + 1);
  };
  
  // Complete configuration
  const completeConfiguration = () => {
    // In a real application, this would submit the configuration to the backend
    alert("Your configuration has been saved! Our team will contact you soon to discuss your custom build.");
    // Reset everything or redirect
  };
  
  // Effect to request AI recommendation when reaching the AI step
  useEffect(() => {
    if (step === 9) {
      getAiRecommendation();
    }
  }, [step]);
  
  // Get compatible engines for selected model
  const getCompatibleEngines = () => {
    if (!selectedModel) return [];
    return engineOptions.filter(engine => engine.compatibleModels.includes(selectedModel));
  };
  
  // Get selected model's body types
  const getBodyTypes = () => {
    const model = getSelectedModelData();
    return model ? model.bodyTypes : [];
  };
  
  // Determine if a step can be navigated to
  const canNavigateToStep = (stepNumber: number) => {
    switch(stepNumber) {
      case 1: return true; // Can always go to model selection
      case 2: return !!selectedConfig.model; // Body type selection
      case 3: return !!selectedConfig.bodyType; // Engine selection
      case 4: return !!selectedConfig.engineType; // Transmission selection
      case 5: return !!selectedConfig.transmission; // Color selection
      case 6: return !!selectedConfig.color; // Wheels selection
      case 7: return !!selectedConfig.wheels; // Interior selection
      case 8: return !!selectedConfig.interior; // Additional options
      case 9: return true; // AI recommendations (can always view)
      case 10: return true; // Summary (can always view)
      default: return false;
    }
  };
  
  // Render step content based on current step
  const renderStepContent = () => {
    switch(step) {
      case 1: // Model Selection
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-playfair font-bold">Select Your Classic Model</h2>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowVehicleResearch(!showVehicleResearch)}
              >
                <Search className="w-4 h-4" />
                {showVehicleResearch ? "Hide Research" : "Research Real Examples"}
              </Button>
            </div>
            <p className="text-charcoal/80">Choose the iconic vehicle you want to transform into a modern masterpiece.</p>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className={`col-span-1 ${showVehicleResearch ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {models.map((model) => (
                    <Card 
                      key={model.id} 
                      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${selectedModel === model.id ? 'ring-2 ring-burgundy' : ''}`}
                      onClick={() => {
                        handleModelSelect(model.id);
                        if (showVehicleResearch) {
                          setRealVehicleImage(""); // Reset previously selected image
                        }
                      }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={realVehicleImage && selectedModel === model.id ? realVehicleImage : model.image} 
                          alt={model.name} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-white text-xl font-bold">{model.name}</h3>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <p className="text-charcoal/80 mb-2">{model.description}</p>
                        <div className="flex justify-between items-end mt-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-xs font-medium text-charcoal/60">BASE POWER</p>
                                <p className="font-medium">{model.baseHp} hp</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-charcoal/60">0-60 MPH</p>
                                <p className="font-medium">{model.baseAcceleration}s</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-charcoal/60">STARTING FROM</p>
                            <p className="text-burgundy font-bold text-xl">{formatPrice(model.price)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Research Panel */}
              {showVehicleResearch && selectedModel && (
                <div className="col-span-1">
                  <ResearchPanel 
                    modelId={selectedModel}
                    modelName={getSelectedModelData()?.name || ""}
                    onImageSelect={(imageUrl) => {
                      setRealVehicleImage(imageUrl);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
        
      case 2: // Body Type Selection
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-playfair font-bold">Select Body Type</h2>
              <Badge variant="outline" className="bg-charcoal/10 text-charcoal">
                {getSelectedModelData()?.name}
              </Badge>
            </div>
            <p className="text-charcoal/80">Choose the body style for your classic restomod.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {getBodyTypes().map((bodyType) => (
                <Card 
                  key={bodyType} 
                  className={`overflow-hidden cursor-pointer transition-all ${selectedConfig.bodyType === bodyType ? 'ring-2 ring-burgundy' : ''}`}
                  onClick={() => handleBodyTypeSelect(bodyType)}
                >
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">{bodyType}</h3>
                    {/* Replace with actual body type images in a real application */}
                    <div className="h-40 bg-charcoal/10 flex items-center justify-center rounded-md mb-4">
                      <p className="text-charcoal/60 font-medium">{bodyType} Silhouette</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className={selectedConfig.bodyType === bodyType ? "bg-burgundy text-white hover:bg-burgundy/90" : ""}
                      onClick={() => handleBodyTypeSelect(bodyType)}
                    >
                      Select {bodyType}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 3: // Engine Selection
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-playfair font-bold">Power & Performance</h2>
                <Badge variant="outline" className="bg-charcoal/10 text-charcoal">
                  {getSelectedModelData()?.name} {selectedConfig.bodyType}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  setShowPartResearch(!showPartResearch);
                  setSelectedPart("engine");
                }}
              >
                <Search className="w-4 h-4" />
                {showPartResearch ? "Hide Research" : "Research Real Engines"}
              </Button>
            </div>
            <p className="text-charcoal/80">Select the heart of your restomod - the engine that will deliver the performance you desire.</p>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className={`col-span-1 ${showPartResearch ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
                <div className="grid grid-cols-1 gap-4">
                  {getCompatibleEngines().map((engine) => (
                    <Card 
                      key={engine.id} 
                      className={`overflow-hidden cursor-pointer transition-all ${selectedConfig.engineType === engine.id ? 'ring-2 ring-burgundy' : ''}`}
                      onClick={() => handleEngineSelect(engine.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                          <div className="flex gap-4 items-center">
                            {realPartImage && selectedConfig.engineType === engine.id && (
                              <div className="hidden md:block w-24 h-24 shrink-0 rounded-md overflow-hidden bg-charcoal/5">
                                <img src={realPartImage} alt={engine.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-xl font-bold mb-1">{engine.name}</h3>
                              <p className="text-charcoal/80 mb-3">{engine.description}</p>
                              <div className="flex items-center gap-4">
                                <Badge variant="secondary">{engine.power}</Badge>
                                <span className="text-sm text-charcoal/60">Compatible with your {getSelectedModelData()?.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-burgundy font-bold text-xl mb-2">+ {formatPrice(engine.price)}</p>
                            <Button 
                              variant="outline" 
                              className={selectedConfig.engineType === engine.id ? "bg-burgundy text-white hover:bg-burgundy/90" : ""}
                              onClick={() => handleEngineSelect(engine.id)}
                            >
                              Select Engine
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Part Research Panel */}
              {showPartResearch && selectedPart === "engine" && (
                <div className="col-span-1">
                  <PartResearchPanel 
                    partType="Engine"
                    partName={engineOptions.find(e => e.id === selectedConfig.engineType)?.name || "V8 Engine"}
                    modelName={getSelectedModelData()?.name}
                    onImageSelect={(imageUrl) => {
                      setRealPartImage(imageUrl);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
        
      case 4: // Transmission Selection
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-playfair font-bold">Transmission</h2>
              <Badge variant="outline" className="bg-charcoal/10 text-charcoal">
                {getSelectedModelData()?.name} | {engineOptions.find(e => e.id === selectedConfig.engineType)?.name}
              </Badge>
            </div>
            <p className="text-charcoal/80">Choose how you want to harness the power of your engine.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {transmissionOptions.map((transmission) => (
                <Card 
                  key={transmission.id} 
                  className={`overflow-hidden cursor-pointer transition-all ${selectedConfig.transmission === transmission.id ? 'ring-2 ring-burgundy' : ''}`}
                  onClick={() => handleTransmissionSelect(transmission.id)}
                >
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-1">{transmission.name}</h3>
                    <p className="text-charcoal/80 mb-4">{transmission.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-burgundy font-bold text-lg">+ {formatPrice(transmission.price)}</p>
                      <Button 
                        variant="outline" 
                        className={selectedConfig.transmission === transmission.id ? "bg-burgundy text-white hover:bg-burgundy/90" : ""}
                        onClick={() => handleTransmissionSelect(transmission.id)}
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 5: // Color Selection
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-playfair font-bold">Exterior Color</h2>
              <Badge variant="outline" className="bg-charcoal/10 text-charcoal">
                {getSelectedModelData()?.name}
              </Badge>
            </div>
            <p className="text-charcoal/80">Select the perfect color to showcase your restomod's lines and curves.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {colorOptions.map((color) => (
                <div 
                  key={color.id} 
                  className={`cursor-pointer transition-all ${selectedConfig.color === color.id ? 'ring-2 ring-burgundy' : ''}`}
                  onClick={() => handleColorSelect(color.id)}
                >
                  <div className="aspect-square rounded-md mb-2 overflow-hidden">
                    {color.hex === "gradient" ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500" />
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{color.name}</p>
                    {color.price > 0 && (
                      <p className="text-sm text-burgundy">+{formatPrice(color.price)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 6: // Wheels Selection
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-playfair font-bold">Wheels</h2>
              <Badge variant="outline" className="bg-charcoal/10 text-charcoal">
                {getSelectedModelData()?.name}
              </Badge>
            </div>
            <p className="text-charcoal/80">Choose the perfect wheels to complement your restomod's style and enhance its performance.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {wheelOptions.map((wheel) => (
                <Card 
                  key={wheel.id} 
                  className={`overflow-hidden cursor-pointer transition-all ${selectedConfig.wheels === wheel.id ? 'ring-2 ring-burgundy' : ''}`}
                  onClick={() => handleWheelsSelect(wheel.id)}
                >
                  <div className="h-48 bg-charcoal/5 p-4 flex items-center justify-center">
                    <img 
                      src={wheel.image} 
                      alt={wheel.name} 
                      className="max-h-full object-contain" 
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-1">{wheel.name}</h3>
                    <p className="text-charcoal/80 mb-4">{wheel.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-burgundy font-bold text-lg">+ {formatPrice(wheel.price)}</p>
                      <Button 
                        variant="outline" 
                        className={selectedConfig.wheels === wheel.id ? "bg-burgundy text-white hover:bg-burgundy/90" : ""}
                        onClick={() => handleWheelsSelect(wheel.id)}
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 7: // Interior Selection
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-playfair font-bold">Interior Styling</h2>
              <Badge variant="outline" className="bg-charcoal/10 text-charcoal">
                {getSelectedModelData()?.name}
              </Badge>
            </div>
            <p className="text-charcoal/80">Select the interior style that defines your dream restomod's cabin experience.</p>
            
            <div className="grid grid-cols-1 gap-6">
              {interiorOptions.map((interior) => (
                <Card 
                  key={interior.id} 
                  className={`overflow-hidden cursor-pointer transition-all ${selectedConfig.interior === interior.id ? 'ring-2 ring-burgundy' : ''}`}
                  onClick={() => handleInteriorSelect(interior.id)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={interior.image} 
                      alt={interior.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-xl font-bold">{interior.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-charcoal/80 mb-4">{interior.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-burgundy font-bold text-lg">+ {formatPrice(interior.price)}</p>
                      <Button 
                        variant="outline" 
                        className={selectedConfig.interior === interior.id ? "bg-burgundy text-white hover:bg-burgundy/90" : ""}
                        onClick={() => handleInteriorSelect(interior.id)}
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 8: // Additional Options & AI Features
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-playfair font-bold">Additional Options</h2>
              <p className="text-charcoal/80">Customize your restomod with performance and comfort upgrades.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {additionalOptions.map((option) => (
                <Card 
                  key={option.id} 
                  className={`cursor-pointer transition-all ${selectedConfig.options.includes(option.id) ? 'ring-2 ring-burgundy' : ''}`}
                  onClick={() => toggleAdditionalOption(option.id)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{option.name}</h3>
                      <p className="text-sm text-charcoal/70">{option.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-burgundy font-bold">{formatPrice(option.price)}</p>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedConfig.options.includes(option.id) ? 'bg-burgundy text-white' : 'border border-charcoal/30'}`}>
                        {selectedConfig.options.includes(option.id) && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-3xl font-playfair font-bold flex items-center gap-2">
                  <Settings className="w-6 h-6" /> McKenney AI Integration
                </h2>
                <p className="text-charcoal/80">Enhance your driving experience with our exclusive AI technologies.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {aiFeatureOptions.map((feature) => (
                  <Card 
                    key={feature.id} 
                    className={`cursor-pointer transition-all ${selectedConfig.aiFeatures.includes(feature.id) ? 'ring-2 ring-burgundy' : ''}`}
                    onClick={() => toggleAiFeature(feature.id)}
                  >
                    <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{feature.name}</h3>
                        <p className="text-charcoal/70">{feature.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-burgundy font-bold">{formatPrice(feature.price)}</p>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedConfig.aiFeatures.includes(feature.id) ? 'bg-burgundy text-white' : 'border border-charcoal/30'}`}>
                          {selectedConfig.aiFeatures.includes(feature.id) && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 9: // AI Recommendations
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-playfair font-bold">AI-Enhanced Recommendations</h2>
              <Badge variant="outline" className="bg-charcoal/10 text-charcoal flex items-center gap-1">
                <Settings className="w-4 h-4" /> Powered by Perplexity AI
              </Badge>
            </div>
            <p className="text-charcoal/80">Our AI has analyzed your configuration to offer personalized insights and suggestions.</p>
            
            <Card className="border border-burgundy/20">
              <CardContent className="p-6">
                {isLoadingAI ? (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy mb-4"></div>
                    <p className="text-charcoal/70">AI is analyzing your configuration...</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-burgundy/10 rounded-full p-3 flex-shrink-0">
                        <Settings className="w-6 h-6 text-burgundy" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">Personalized Recommendations</h3>
                        <p className="text-charcoal/70">Based on your selections, our AI suggests:</p>
                      </div>
                    </div>
                    
                    <div className="pl-16">
                      <div className="prose prose-burgundy">
                        {aiRecommendation ? (
                          <p className="whitespace-pre-line">{aiRecommendation}</p>
                        ) : (
                          <p className="text-charcoal/70">No recommendations available. Please try again later.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="bg-charcoal/5 p-6 rounded-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-burgundy" /> About Our AI Integration
              </h3>
              <p className="text-sm text-charcoal/80">
                Our AI recommendations are powered by advanced machine learning models that analyze thousands of custom builds, 
                performance data, and customer satisfaction ratings. The system learns continuously from each new build to 
                provide increasingly accurate and personalized suggestions.
              </p>
            </div>
          </div>
        );
        
      case 10: // Summary & Checkout
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-playfair font-bold">Your Custom Configuration</h2>
            <p className="text-charcoal/80">Review your selections before finalizing your custom restomod build.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                {/* Configuration Summary */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Build Specifications</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-charcoal/70">Model</div>
                        <div className="col-span-2 font-medium">
                          {models.find(m => m.id === selectedConfig.model)?.name || "Not selected"}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-charcoal/70">Body Type</div>
                        <div className="col-span-2 font-medium">{selectedConfig.bodyType || "Not selected"}</div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-charcoal/70">Engine</div>
                        <div className="col-span-2 font-medium">
                          {engineOptions.find(e => e.id === selectedConfig.engineType)?.name || "Not selected"}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-charcoal/70">Transmission</div>
                        <div className="col-span-2 font-medium">
                          {transmissionOptions.find(t => t.id === selectedConfig.transmission)?.name || "Not selected"}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-charcoal/70">Color</div>
                        <div className="col-span-2 font-medium flex items-center gap-2">
                          {selectedConfig.color && (
                            <>
                              <div 
                                className="w-5 h-5 rounded-full border border-charcoal/20" 
                                style={{ 
                                  backgroundColor: colorOptions.find(c => c.id === selectedConfig.color)?.hex || "#FFFFFF",
                                  background: colorOptions.find(c => c.id === selectedConfig.color)?.hex === "gradient" ? 
                                    "linear-gradient(135deg, #667eea, #764ba2)" : undefined
                                }}
                              />
                              {colorOptions.find(c => c.id === selectedConfig.color)?.name || "Not selected"}
                            </>
                          )}
                          {!selectedConfig.color && "Not selected"}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-charcoal/70">Wheels</div>
                        <div className="col-span-2 font-medium">
                          {wheelOptions.find(w => w.id === selectedConfig.wheels)?.name || "Not selected"}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-charcoal/70">Interior</div>
                        <div className="col-span-2 font-medium">
                          {interiorOptions.find(i => i.id === selectedConfig.interior)?.name || "Not selected"}
                        </div>
                      </div>
                      
                      {selectedConfig.options.length > 0 && (
                        <>
                          <Separator />
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-charcoal/70">Additional Options</div>
                            <div className="col-span-2">
                              <ul className="space-y-1">
                                {selectedConfig.options.map(optionId => {
                                  const option = additionalOptions.find(o => o.id === optionId);
                                  return option ? (
                                    <li key={optionId} className="flex justify-between">
                                      <span>{option.name}</span>
                                      <span className="font-medium">{formatPrice(option.price)}</span>
                                    </li>
                                  ) : null;
                                })}
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {selectedConfig.aiFeatures.length > 0 && (
                        <>
                          <Separator />
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-charcoal/70 flex items-center gap-1">
                              <Settings className="w-4 h-4" /> AI Integration
                            </div>
                            <div className="col-span-2">
                              <ul className="space-y-1">
                                {selectedConfig.aiFeatures.map(featureId => {
                                  const feature = aiFeatureOptions.find(f => f.id === featureId);
                                  return feature ? (
                                    <li key={featureId} className="flex justify-between">
                                      <span>{feature.name}</span>
                                      <span className="font-medium">{formatPrice(feature.price)}</span>
                                    </li>
                                  ) : null;
                                })}
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* AI Recommendation Summary */}
                {aiRecommendation && (
                  <Card className="border border-burgundy/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-burgundy" /> AI Recommendation Highlights
                      </h3>
                      <div className="text-charcoal/80 prose prose-sm max-w-full">
                        <p className="whitespace-pre-line">{aiRecommendation.split('\n').slice(0, 3).join('\n')}</p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-burgundy" 
                          onClick={() => setStep(9)}
                        >
                          View Full Recommendations
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Price Summary */}
              <div className="md:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Price Summary</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-charcoal/70">Base Vehicle</span>
                        <span className="font-medium">
                          {formatPrice(models.find(m => m.id === selectedConfig.model)?.price || 0)}
                        </span>
                      </div>
                      
                      {selectedConfig.engineType && (
                        <div className="flex justify-between">
                          <span className="text-charcoal/70">Engine</span>
                          <span className="font-medium">
                            {formatPrice(engineOptions.find(e => e.id === selectedConfig.engineType)?.price || 0)}
                          </span>
                        </div>
                      )}
                      
                      {selectedConfig.transmission && (
                        <div className="flex justify-between">
                          <span className="text-charcoal/70">Transmission</span>
                          <span className="font-medium">
                            {formatPrice(transmissionOptions.find(t => t.id === selectedConfig.transmission)?.price || 0)}
                          </span>
                        </div>
                      )}
                      
                      {selectedConfig.color && colorOptions.find(c => c.id === selectedConfig.color)?.price !== 0 && (
                        <div className="flex justify-between">
                          <span className="text-charcoal/70">Paint</span>
                          <span className="font-medium">
                            {formatPrice(colorOptions.find(c => c.id === selectedConfig.color)?.price || 0)}
                          </span>
                        </div>
                      )}
                      
                      {selectedConfig.wheels && (
                        <div className="flex justify-between">
                          <span className="text-charcoal/70">Wheels</span>
                          <span className="font-medium">
                            {formatPrice(wheelOptions.find(w => w.id === selectedConfig.wheels)?.price || 0)}
                          </span>
                        </div>
                      )}
                      
                      {selectedConfig.interior && (
                        <div className="flex justify-between">
                          <span className="text-charcoal/70">Interior</span>
                          <span className="font-medium">
                            {formatPrice(interiorOptions.find(i => i.id === selectedConfig.interior)?.price || 0)}
                          </span>
                        </div>
                      )}
                      
                      {selectedConfig.options.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-charcoal/70">Additional Options</span>
                          <span className="font-medium">
                            {formatPrice(selectedConfig.options.reduce((total, optionId) => {
                              const option = additionalOptions.find(o => o.id === optionId);
                              return total + (option ? option.price : 0);
                            }, 0))}
                          </span>
                        </div>
                      )}
                      
                      {selectedConfig.aiFeatures.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-charcoal/70">AI Integration</span>
                          <span className="font-medium">
                            {formatPrice(selectedConfig.aiFeatures.reduce((total, featureId) => {
                              const feature = aiFeatureOptions.find(f => f.id === featureId);
                              return total + (feature ? feature.price : 0);
                            }, 0))}
                          </span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-burgundy">{formatPrice(calculateTotalPrice())}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-burgundy hover:bg-burgundy/90 text-white py-6 text-lg font-bold"
                      onClick={completeConfiguration}
                    >
                      Request This Build
                    </Button>
                    
                    <p className="text-xs text-charcoal/60 text-center mt-4">
                      By clicking above, you're requesting a detailed quote and consultation for your custom build. 
                      Our team will contact you within 48 hours to discuss your project.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Invalid step</div>;
    }
  };
  
  return (
    <div>
      {/* Premium Porsche-style Video Header */}
      <VideoHeader
        title="Custom Restomod Configurator"
        subtitle="Engineer your dream classic with modern technology and premium craftsmanship"
        hashtag="EngineeredArtistry"
        videoSrc="https://cdn.videvo.net/videvo_files/video/premium/video0290/large_watermarked/902-2_902-2923-PD2_preview.mp4"
        imageSrc="https://images.luxuryautodirect.com/19997/1967-ford-mustang-restomod-3.jpg"
      />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Progress Steps */}
        <div className="mb-12">
          <Tabs 
            value={step.toString()} 
            onValueChange={(value) => canNavigateToStep(parseInt(value)) && setStep(parseInt(value))}
            className="w-full"
          >
            <TabsList className="grid grid-cols-11 w-full">
              <TabsTrigger 
                value="1" 
                className={`text-xs sm:text-sm ${!canNavigateToStep(1) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canNavigateToStep(1)}
              >
                Model
              </TabsTrigger>
              <TabsTrigger 
                value="2" 
                className={`text-xs sm:text-sm ${!canNavigateToStep(2) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canNavigateToStep(2)}
              >
                Body
              </TabsTrigger>
              <TabsTrigger 
                value="3" 
                className={`text-xs sm:text-sm ${!canNavigateToStep(3) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canNavigateToStep(3)}
              >
                Engine
              </TabsTrigger>
              <TabsTrigger 
                value="4" 
                className={`text-xs sm:text-sm ${!canNavigateToStep(4) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canNavigateToStep(4)}
              >
                Transmission
              </TabsTrigger>
              <TabsTrigger 
                value="5" 
                className={`text-xs sm:text-sm ${!canNavigateToStep(5) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canNavigateToStep(5)}
              >
                Color
              </TabsTrigger>
              <TabsTrigger 
                value="6" 
                className={`text-xs sm:text-sm ${!canNavigateToStep(6) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canNavigateToStep(6)}
              >
                Wheels
              </TabsTrigger>
              <TabsTrigger 
                value="7" 
                className={`text-xs sm:text-sm ${!canNavigateToStep(7) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canNavigateToStep(7)}
              >
                Interior
              </TabsTrigger>
              <TabsTrigger 
                value="8" 
                className={`text-xs sm:text-sm ${!canNavigateToStep(8) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canNavigateToStep(8)}
              >
                Options
              </TabsTrigger>
              <TabsTrigger 
                value="9" 
                className={`text-xs sm:text-sm flex items-center gap-1 ${!canNavigateToStep(9) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canNavigateToStep(9)}
              >
                <Settings className="w-3 h-3" /> AI
              </TabsTrigger>
              <TabsTrigger 
                value="10" 
                className={`text-xs sm:text-sm ${!canNavigateToStep(10) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!canNavigateToStep(10)}
              >
                Summary
              </TabsTrigger>
              <TabsTrigger 
                value="11" 
                className="text-xs sm:text-sm flex items-center gap-1"
              >
                <Search size={12} /> Research
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Step Content */}
        <div className="mb-12">
          {renderStepContent()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={goToPrevStep} 
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    onClick={step === 10 ? completeConfiguration : goToNextStep} 
                    disabled={!canNavigateToStep(step + 1) && step !== 10}
                    className={`flex items-center gap-2 ${step === 10 ? 'bg-burgundy hover:bg-burgundy/90' : ''}`}
                  >
                    {step === 10 ? 'Complete Configuration' : 'Next'} 
                    {step !== 10 && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
              </TooltipTrigger>
              {!canNavigateToStep(step + 1) && step !== 10 && (
                <TooltipContent>
                  Please complete current selections before proceeding
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default CarConfigurator;