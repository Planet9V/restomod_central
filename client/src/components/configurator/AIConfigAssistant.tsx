import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, X, Send, Zap, History, Settings, Activity, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAIAssistant, Recommendation } from "@/hooks/use-ai-assistant";

interface AIConfigAssistantProps {
  selectedConfig: {
    model: string;
    bodyType: string;
    engineType: string;
    transmission: string;
    color: string;
    wheels: string;
    interior: string;
    options: string[];
    aiFeatures: string[];
  };
  onRecommendationApply: (recommendations: any) => void;
  onClose: () => void;
}

export function AIConfigAssistant({ selectedConfig, onRecommendationApply, onClose }: AIConfigAssistantProps) {
  const [messageInput, setMessageInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("chat");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    sendMessage,
    latestRecommendations,
    isLoading,
    getHistoricalContext,
    predictPerformance,
    isHistoricalContextLoading,
    isPredictionLoading,
    historicalContext,
    performancePrediction
  } = useAIAssistant({
    onRecommendationsReceived: (recommendations) => {
      // We can auto-switch to the recommendations tab when new recommendations come in
      if (recommendations && recommendations.length > 0) {
        setActiveTab("recommendations");
      }
    }
  });
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);
  
  // Initial greeting message when the assistant is opened
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting = "Hello! I'm K.I.T.T., your personal car configuration assistant. How can I help with your restomod build today?";
      sendMessage(initialGreeting, "assistant");
    }
  }, []);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;
    
    sendMessage(messageInput);
    setMessageInput("");
  };
  
  // Handle keypress (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Apply recommendations to the configuration
  const applyRecommendations = () => {
    if (latestRecommendations) {
      onRecommendationApply(latestRecommendations);
    }
  };
  
  // Get the vehicle name for display
  const getVehicleName = () => {
    if (!selectedConfig.model) return "Your Vehicle";
    
    // This would normally come from an API lookup, but for demo we'll use a simple mapping
    const modelMap: Record<string, string> = {
      "mustang1967": "1967 Ford Mustang",
      "camaro1968": "1968 Chevrolet Camaro",
      "fordF1001953": "1953 Ford F-100",
      "chevyII1966": "1966 Chevrolet Nova",
    };
    
    return modelMap[selectedConfig.model] || "Your Vehicle";
  };
  
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden shadow-none border-0 rounded-lg">
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-burgundy opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-burgundy"></span>
          </span>
          <h2 className="font-bold text-lg">K.I.T.T. Assistant</h2>
          <Badge variant="outline" className="text-xs bg-charcoal/10">
            {getVehicleName()}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="px-6 py-2 justify-start border-b rounded-none">
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            Vehicle History
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col pt-0 m-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-burgundy text-white"
                        : "bg-charcoal/10 text-charcoal"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-charcoal/10 text-charcoal">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p>K.I.T.T. is thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <CardFooter className="p-4 border-t">
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Ask K.I.T.T. anything about your build..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={messageInput.trim() === "" || isLoading}
                className="bg-burgundy hover:bg-burgundy/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="recommendations" className="flex-1 flex flex-col pt-0 m-0">
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
                <p className="text-muted-foreground">
                  Based on your selections, K.I.T.T. has generated the following recommendations to enhance your custom build.
                </p>
              </div>
              
              {latestRecommendations && latestRecommendations.length > 0 ? (
                <div className="space-y-4">
                  {latestRecommendations.map((rec: Recommendation, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Zap className="h-5 w-5 text-burgundy flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    onClick={applyRecommendations} 
                    className="w-full bg-burgundy hover:bg-burgundy/90 mt-4"
                  >
                    Apply Recommendations
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Chat with K.I.T.T. about your preferences and goals for your restomod, and it will provide customized recommendations for your build.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 flex flex-col pt-0 m-0">
          <ScrollArea className="flex-1 px-6 py-4">
            {isHistoricalContextLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
              </div>
            ) : historicalContext ? (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-2">Historical Context</h3>
                  <p className="text-muted-foreground">
                    Learn about the history and significance of your selected vehicle.
                  </p>
                </div>
                
                {Object.entries(historicalContext.sections || {}).map(([title, content]) => (
                  <div key={title} className="border-b border-border pb-4 last:border-0">
                    <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{content as string}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Historical Context</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Discover the rich history of your selected vehicle and its significance in automotive culture.
                </p>
                <Button 
                  onClick={() => {
                    if (selectedConfig.model) {
                      // Parse model name to extract year and make
                      const modelMap: Record<string, { year: string, make: string, modelName: string }> = {
                        "mustang1967": { year: "1967", make: "Ford", modelName: "Mustang" },
                        "camaro1968": { year: "1968", make: "Chevrolet", modelName: "Camaro" },
                        "fordF1001953": { year: "1953", make: "Ford", modelName: "F-100" },
                        "chevyII1966": { year: "1966", make: "Chevrolet", modelName: "Nova" },
                      };
                      
                      const vehicle = modelMap[selectedConfig.model];
                      if (vehicle) {
                        getHistoricalContext({
                          year: vehicle.year,
                          make: vehicle.make,
                          modelName: vehicle.modelName
                        });
                      }
                    }
                  }}
                  className="bg-burgundy hover:bg-burgundy/90"
                  disabled={!selectedConfig.model || isHistoricalContextLoading}
                >
                  {isHistoricalContextLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Generate Historical Context
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="performance" className="flex-1 flex flex-col pt-0 m-0">
          <ScrollArea className="flex-1 px-6 py-4">
            {isPredictionLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
              </div>
            ) : performancePrediction ? (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-2">Performance Prediction</h3>
                  <p className="text-muted-foreground">
                    AI-calculated performance metrics for your custom configuration.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(performancePrediction.metrics || {}).map(([key, value]) => (
                    <Card key={key} className="overflow-hidden">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-medium capitalize mb-1 text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-xl font-bold text-burgundy">{String(value)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="border-t border-border pt-4">
                  <h3 className="text-lg font-semibold mb-2">Performance Analysis</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{performancePrediction.fullText}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Performance Prediction</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Get AI-powered estimates of how your custom configuration will perform on the road.
                </p>
                <Button 
                  onClick={() => {
                    if (selectedConfig.model && selectedConfig.engineType) {
                      // Get model name
                      const modelMap: Record<string, string> = {
                        "mustang1967": "1967 Ford Mustang",
                        "camaro1968": "1968 Chevrolet Camaro",
                        "fordF1001953": "1953 Ford F-100",
                        "chevyII1966": "1966 Chevrolet Nova",
                      };
                      
                      // Get engine name
                      const engineMap: Record<string, string> = {
                        "coyote50": "Ford Coyote 5.0L V8",
                        "ls376": "Chevrolet LS3 6.2L V8",
                        "hellcrate": "Mopar Hellcrate 6.2L Supercharged V8",
                        "windsor351": "Ford Windsor 351 Stroker",
                        "ls7": "GM LS7 7.0L V8"
                      };
                      
                      // Get transmission name
                      const transmissionMap: Record<string, string> = {
                        "tremec6": "TREMEC 6-Speed Manual",
                        "4l80e": "GM 4L80E Automatic",
                        "10r80": "Ford 10R80 10-Speed Automatic",
                        "t56": "TREMEC T-56 Magnum"
                      };
                      
                      const carModel = modelMap[selectedConfig.model] || selectedConfig.model;
                      const engine = engineMap[selectedConfig.engineType] || selectedConfig.engineType;
                      const transmission = selectedConfig.transmission ? 
                        transmissionMap[selectedConfig.transmission] || selectedConfig.transmission : 
                        undefined;
                      
                      // Get selected modifications
                      const modifications: string[] = [];
                      
                      predictPerformance({
                        carModel,
                        engine,
                        transmission,
                        modifications
                      });
                    }
                  }}
                  className="bg-burgundy hover:bg-burgundy/90"
                  disabled={!selectedConfig.model || !selectedConfig.engineType || isPredictionLoading}
                >
                  {isPredictionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Generate Performance Prediction
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}