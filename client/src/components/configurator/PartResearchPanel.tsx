import React, { useState, useEffect } from 'react';
import useResearch from '@/hooks/use-research';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InfoIcon, Image as ImageIcon, Lightbulb, RefreshCw, Database } from 'lucide-react';
import GeneratedImageDisplay from './GeneratedImageDisplay';

interface PartResearchPanelProps {
  partType: string;
  partName: string;
  modelName?: string;
  onImageSelect?: (imageUrl: string) => void;
}

const PartResearchPanel = ({ partType, partName, modelName, onImageSelect }: PartResearchPanelProps) => {
  const { getPartResearch, data, status, error } = useResearch();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (partName) {
      getPartResearch({ part: partName, model: modelName });
    }
  }, [partName, modelName]);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    if (onImageSelect) {
      onImageSelect(imageUrl);
    }
  };

  const handleRefresh = () => {
    getPartResearch({ part: partName, model: modelName });
  };

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-4 w-4" /> 
            {partType}: {partName}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-3 w-3 mr-2" /> Refresh
          </Button>
        </div>
        <CardDescription>
          {modelName ? `Research for ${modelName}` : 'General research'}
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="info">
        <div className="px-4">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">
              <InfoIcon className="h-4 w-4 mr-2" /> Information
            </TabsTrigger>
            <TabsTrigger value="visualize" className="flex-1">
              <ImageIcon className="h-4 w-4 mr-2" /> Visualize
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
                    <p>Loading research data...</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error instanceof Error ? error.message : 'Failed to load research data'}
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

                  <Separator />

                  {data.specifications && (
                    <div>
                      <h3 className="text-lg font-medium">Specifications</h3>
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

                  <Separator />

                  {data.compatibility && (
                    <div>
                      <h3 className="text-lg font-medium">Compatibility</h3>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                        {data.compatibility}
                      </p>
                    </div>
                  )}

                  {data.history && (
                    <div>
                      <h3 className="text-lg font-medium">Historical Context</h3>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                        {data.history}
                      </p>
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
                part={partName} 
                car={modelName} 
                onImageLoaded={handleImageSelect}
              />
            </div>
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

              {status === 'success' && data && data.recommendations && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Expert Recommendations</h3>
                  <div className="mt-2 space-y-3">
                    {Array.isArray(data.recommendations) ? (
                      data.recommendations.map((recommendation, index) => (
                        <div key={index} className="p-3 bg-muted rounded-md">
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">{data.recommendations as string}</p>
                      </div>
                    )}
                  </div>

                  {data.alternatives && (
                    <>
                      <h3 className="text-lg font-medium mt-6">Alternative Options</h3>
                      <div className="mt-2 space-y-3">
                        {Array.isArray(data.alternatives) ? (
                          data.alternatives.map((alternative, index) => (
                            <div key={index} className="p-3 bg-muted rounded-md">
                              <p className="text-sm">{alternative}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{data.alternatives as string}</p>
                          </div>
                        )}
                      </div>
                    </>
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
              <p className="text-sm text-muted-foreground">Image generated for {partName}</p>
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

export default PartResearchPanel;
