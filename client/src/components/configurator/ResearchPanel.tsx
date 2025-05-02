import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Image, Info } from "lucide-react";
import useResearch from "@/hooks/use-research";

interface ResearchPanelProps {
  modelId: string;
  modelName: string;
  onImageSelect?: (imageUrl: string) => void;
}

const ResearchPanel = ({ modelId, modelName, onImageSelect }: ResearchPanelProps) => {
  const { getVehicleResearch, results, isLoading } = useResearch();
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Fetch vehicle research when model changes
  useEffect(() => {
    if (modelId && modelName) {
      getVehicleResearch({ model: modelName });
    }
  }, [modelId, modelName]);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    if (onImageSelect) {
      onImageSelect(imageUrl);
    }
  };

  // Prepare data for display
  const vehicleImages = results.data?.data?.images || [];
  const vehicleDetails = results.data?.data?.details || {};

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-charcoal/5 pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Image className="w-5 h-5 text-burgundy" /> Real Vehicle Reference
        </CardTitle>
        <CardDescription>
          Authentic images and details sourced by our AI research system
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-burgundy animate-spin mb-4" />
            <p className="text-sm text-charcoal/70">Researching {modelName}...</p>
          </div>
        ) : results.data ? (
          <div className="space-y-6">
            {/* Image Gallery */}
            <div>
              <h3 className="font-medium text-sm mb-2">Reference Images</h3>
              <div className="grid grid-cols-3 gap-2">
                {vehicleImages.slice(0, 6).map((imageUrl: string, index: number) => (
                  <div 
                    key={index} 
                    className={`aspect-video bg-charcoal/5 rounded-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border-2 ${selectedImage === imageUrl ? 'border-burgundy' : 'border-transparent'}`}
                    onClick={() => handleImageSelect(imageUrl)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`${modelName} reference ${index + 1}`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        // Handle image loading errors
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=Image+Unavailable";
                      }}
                    />
                  </div>
                ))}
              </div>
              {selectedImage && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onImageSelect && onImageSelect(selectedImage)}
                  >
                    Use Selected Image
                  </Button>
                </div>
              )}
            </div>
            
            {/* Vehicle Details */}
            {vehicleDetails && Object.keys(vehicleDetails).length > 0 && (
              <div className="mt-4 pt-4 border-t border-charcoal/10">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Info className="w-4 h-4 text-burgundy" /> Vehicle Details
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(vehicleDetails).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-2">
                      <span className="text-charcoal/70 capitalize col-span-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="col-span-2">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-charcoal/70 mb-4">Select a vehicle model to see authentic reference images and details.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResearchPanel;
