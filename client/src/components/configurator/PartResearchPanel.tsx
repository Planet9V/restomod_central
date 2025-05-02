import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Wrench } from "lucide-react";
import useResearch from "@/hooks/use-research";

interface PartResearchPanelProps {
  partType: string;
  partName: string;
  modelName?: string;
  onImageSelect?: (imageUrl: string) => void;
}

const PartResearchPanel = ({ partType, partName, modelName, onImageSelect }: PartResearchPanelProps) => {
  const { getPartResearch, results, isLoading } = useResearch();
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Fetch part research when inputs change
  useEffect(() => {
    if (partType && partName) {
      getPartResearch({ 
        part: partName,
        model: modelName 
      });
    }
  }, [partType, partName, modelName]);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    if (onImageSelect) {
      onImageSelect(imageUrl);
    }
  };

  // Prepare data for display
  const partImages = results.data?.data?.images || [];
  const partSpecs = results.data?.data?.specs || {};

  const formatPartTitle = () => {
    let title = partName;
    if (modelName) {
      title += ` for ${modelName}`;
    }
    return title;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-charcoal/5 pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Wrench className="w-5 h-5 text-burgundy" /> {partType} Options
        </CardTitle>
        <CardDescription>
          Research-based authentic parts and specifications
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-burgundy animate-spin mb-4" />
            <p className="text-sm text-charcoal/70">Researching {formatPartTitle()}...</p>
          </div>
        ) : results.data ? (
          <div className="space-y-6">
            {/* Image Gallery */}
            <div>
              <h3 className="font-medium text-sm mb-2">Available Options</h3>
              <div className="grid grid-cols-3 gap-2">
                {partImages.slice(0, 6).map((imageUrl: string, index: number) => (
                  <div 
                    key={index} 
                    className={`aspect-square bg-charcoal/5 rounded-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border-2 ${selectedImage === imageUrl ? 'border-burgundy' : 'border-transparent'}`}
                    onClick={() => handleImageSelect(imageUrl)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`${partName} option ${index + 1}`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        // Handle image loading errors
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x200?text=Part+Unavailable";
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
                    Select This {partType}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Part Specifications */}
            {partSpecs && Object.keys(partSpecs).length > 0 && (
              <div className="mt-4 pt-4 border-t border-charcoal/10">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Settings className="w-4 h-4 text-burgundy" /> Specifications
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(partSpecs).map(([key, value]) => (
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
            <p className="text-charcoal/70 mb-4">Select a part type to see authentic options and specifications.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartResearchPanel;
