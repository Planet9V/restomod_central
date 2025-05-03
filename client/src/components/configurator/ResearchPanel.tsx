import React, { useState, useEffect } from 'react';
import useResearch from '@/hooks/use-research';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Image as ImageIcon, Lightbulb, BarChart4, History, RefreshCw, Car } from 'lucide-react';
import GeneratedImageDisplay from './GeneratedImageDisplay';

interface ResearchPanelProps {
  modelId: string;
  modelName: string;
  onImageSelect?: (imageUrl: string) => void;
}

const ResearchPanel = ({ modelId, modelName, onImageSelect }: ResearchPanelProps) => {
  const { getVehicleResearch, data, status, error } = useResearch();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (modelName) {
      getVehicleResearch({ model: modelName });
    }
  }, [modelName]);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    if (onImageSelect) {
      onImageSelect(imageUrl);
    }
  };

  const handleRefresh = () => {
    getVehicleResearch({ model: modelName });
  };

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Car className="h-4 w-4" /> 
            {modelName}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-3 w-3 mr-2" /> Refresh
          </Button>
        </div>
        <CardDescription>
          Research and information about this classic model
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="info">
        <div className="px-4">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">
              <InfoIcon className="h-4 w-4 mr-2" /> Information
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              <History className="h-4 w-4 mr-2" /> History
            </TabsTrigger>
            <TabsTrigger value="visualize" className="flex-1">
              <ImageIcon className="h-4 w-4 mr-2" /> Visualize
            </TabsTrigger>
            <TabsTrigger value="market" className="flex-1">
              <BarChart4 className="h-4 w-4 mr-2" /> Market
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex-1">
              <Lightbulb className="h-4 w-4 mr-2" /> Recommendations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info" className="mt-0">
          <CardContent className="pt-4">
            <ScrollArea className="h-[60vh] pr-4">
              {status === 'loading' && (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="animate-pulse text-center">
                    <p>Loading vehicle information...</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error instanceof Error ? error.message : 'Failed to load vehicle information'}
                  </AlertDescription>
                </Alert>
              )}

              {status === 'success' && data && (
                <div className="space-y-4">
                  {data.overview && (
                    <div>
                      <h3 className="text-lg font-medium">Overview</h3>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                        {data.overview}
                      </p>
                    </div>
                  )}

                  {data.specifications && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium">Original Specifications</h3>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        {Object.entries(data.specifications).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="w-1/3 text-sm font-medium">{key}:</span>
                            <span className="w-2/3 text-sm">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <CardContent className="pt-4">
            <ScrollArea className="h-[60vh] pr-4">
              {status === 'loading' && (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="animate-pulse text-center">
                    <p>Loading historical information...</p>
                  </div>
                </div>
              )}

              {status === 'success' && data && (
                <div className="space-y-6">
                  {data.history && (
                    <div>
                      <h3 className="text-lg font-medium">Vehicle History</h3>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                        {data.history}
                      </p>
                    </div>
                  )}

                  {data.keyMoments && (
                    <div>
                      <h3 className="text-lg font-medium">Key Historical Moments</h3>
                      <div className="mt-2 space-y-3">
                        {Array.isArray(data.keyMoments) ? (
                          data.keyMoments.map((moment, index) => (
                            <div key={index} className="p-3 bg-muted rounded-md">
                              <p className="text-sm">{moment}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{data.keyMoments as string}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {data.notableExamples && (
                    <div>
                      <h3 className="text-lg font-medium">Notable Examples</h3>
                      <div className="mt-2 space-y-3">
                        {Array.isArray(data.notableExamples) ? (
                          data.notableExamples.map((example, index) => (
                            <div key={index} className="p-3 bg-muted rounded-md">
                              <p className="text-sm">{example}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{data.notableExamples as string}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </TabsContent>

        <TabsContent value="visualize" className="mt-0">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-4">
              <GeneratedImageDisplay 
                car={modelName}
                onImageLoaded={handleImageSelect}
              />
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="market" className="mt-0">
          <CardContent className="pt-4">
            <ScrollArea className="h-[60vh] pr-4">
              {status === 'loading' && (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="animate-pulse text-center">
                    <p>Loading market data...</p>
                  </div>
                </div>
              )}

              {status === 'success' && data && (
                <div className="space-y-6">
                  {data.marketTrends && (
                    <div>
                      <h3 className="text-lg font-medium">Market Trends</h3>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                        {data.marketTrends}
                      </p>
                    </div>
                  )}

                  {data.valueRange && (
                    <div>
                      <h3 className="text-lg font-medium">Current Value Range</h3>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                        {data.valueRange}
                      </p>
                    </div>
                  )}

                  {data.factorsAffectingValue && (
                    <div>
                      <h3 className="text-lg font-medium">Factors Affecting Value</h3>
                      <div className="mt-2 space-y-3">
                        {Array.isArray(data.factorsAffectingValue) ? (
                          data.factorsAffectingValue.map((factor, index) => (
                            <div key={index} className="p-3 bg-muted rounded-md">
                              <p className="text-sm">{factor}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{data.factorsAffectingValue as string}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {data.investmentPotential && (
                    <div>
                      <h3 className="text-lg font-medium">Investment Potential</h3>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                        {data.investmentPotential}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-0">
          <CardContent className="pt-4">
            <ScrollArea className="h-[60vh] pr-4">
              {status === 'loading' && (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="animate-pulse text-center">
                    <p>Loading recommendations...</p>
                  </div>
                </div>
              )}

              {status === 'success' && data && (
                <div className="space-y-6">
                  {data.commonUpgrades && (
                    <div>
                      <h3 className="text-lg font-medium">Common Upgrades</h3>
                      <div className="mt-2 space-y-3">
                        {Array.isArray(data.commonUpgrades) ? (
                          data.commonUpgrades.map((upgrade, index) => (
                            <div key={index} className="p-3 bg-muted rounded-md">
                              <p className="text-sm">{upgrade}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{data.commonUpgrades as string}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {data.restomodOptions && (
                    <div>
                      <h3 className="text-lg font-medium">Restomod Options</h3>
                      <div className="mt-2 space-y-3">
                        {Array.isArray(data.restomodOptions) ? (
                          data.restomodOptions.map((option, index) => (
                            <div key={index} className="p-3 bg-muted rounded-md">
                              <p className="text-sm">{option}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{data.restomodOptions as string}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {data.recommendedParts && (
                    <div>
                      <h3 className="text-lg font-medium">Recommended Parts</h3>
                      <div className="mt-2 space-y-3">
                        {Array.isArray(data.recommendedParts) ? (
                          data.recommendedParts.map((part, index) => (
                            <div key={index} className="p-3 bg-muted rounded-md">
                              <p className="text-sm">{part}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{data.recommendedParts as string}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-end p-4 pt-2">
        {selectedImage && (
          <div className="w-full">
            <Separator className="mb-4" />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Image generated for {modelName}</p>
              <Button 
                size="sm" 
                onClick={() => onImageSelect && onImageSelect(selectedImage)}
                disabled={!selectedImage}
              >
                Use This Image
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResearchPanel;
