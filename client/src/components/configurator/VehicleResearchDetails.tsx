import React from 'react';
import { useResearch } from '@/hooks/use-research';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoIcon, DollarSign, TrendingUp, History, Settings, Tool, Car } from 'lucide-react';

interface VehicleResearchDetailsProps {
  modelName: string;
  className?: string;
}

const VehicleResearchDetails: React.FC<VehicleResearchDetailsProps> = ({ 
  modelName,
  className = ''
}) => {
  const { 
    getVehicleResearch, 
    data: vehicleData, 
    status, 
    error 
  } = useResearch({
    cacheResults: true
  });

  // Fetch vehicle data when the component mounts or model changes
  React.useEffect(() => {
    if (modelName) {
      getVehicleResearch({ model: modelName });
    }
  }, [modelName, getVehicleResearch]);

  if (status === 'loading') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <InfoIcon className="mr-2 h-5 w-5" />
            <Skeleton className="h-6 w-64" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/6 mb-4" />
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          
          <Separator className="my-4" />
          
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load vehicle information. Please try again later.</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!vehicleData) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Car className="mr-2 h-5 w-5" />
          {modelName} Research
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="overview" className="text-xs">
              <InfoIcon className="h-4 w-4 mr-1" /> Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="h-4 w-4 mr-1" /> History
            </TabsTrigger>
            <TabsTrigger value="market" className="text-xs">
              <DollarSign className="h-4 w-4 mr-1" /> Market
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="text-xs">
              <Settings className="h-4 w-4 mr-1" /> Upgrades
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs">
              <Tool className="h-4 w-4 mr-1" /> Specs
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="overview" className="mt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{vehicleData.overview}</p>
                
                {vehicleData.notableExamples && vehicleData.notableExamples.length > 0 && (
                  <>
                    <h4 className="text-base font-medium mt-4 mb-2">Notable Examples</h4>
                    <ul className="pl-5">
                      {vehicleData.notableExamples.map((example: string, idx: number) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {vehicleData.history && (
                  <div>
                    <p>{vehicleData.history}</p>
                  </div>
                )}
                
                {vehicleData.keyMoments && vehicleData.keyMoments.length > 0 && (
                  <>
                    <h4 className="text-base font-medium mt-4 mb-2">Key Historical Moments</h4>
                    <ul className="pl-5">
                      {vehicleData.keyMoments.map((moment: string, idx: number) => (
                        <li key={idx}>{moment}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="market" className="mt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {vehicleData.marketTrends && (
                  <div>
                    <h4 className="text-base font-medium mb-2">Market Trends</h4>
                    <p>{vehicleData.marketTrends}</p>
                  </div>
                )}
                
                {vehicleData.valueRange && (
                  <div className="mt-4">
                    <h4 className="text-base font-medium mb-2">Current Value Range</h4>
                    <Badge variant="outline" className="text-base py-1.5 font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {vehicleData.valueRange}
                    </Badge>
                  </div>
                )}
                
                {vehicleData.factorsAffectingValue && vehicleData.factorsAffectingValue.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-base font-medium mb-2">Factors Affecting Value</h4>
                    <ul className="pl-5">
                      {vehicleData.factorsAffectingValue.map((factor: string, idx: number) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {vehicleData.investmentPotential && (
                  <div className="mt-4">
                    <h4 className="text-base font-medium mb-2">Investment Potential</h4>
                    <p>{vehicleData.investmentPotential}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="upgrades" className="mt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {vehicleData.commonUpgrades && vehicleData.commonUpgrades.length > 0 && (
                  <div>
                    <h4 className="text-base font-medium mb-2">Common Upgrades</h4>
                    <ul className="pl-5">
                      {vehicleData.commonUpgrades.map((upgrade: string, idx: number) => (
                        <li key={idx}>{upgrade}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {vehicleData.restomodOptions && vehicleData.restomodOptions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-base font-medium mb-2">Restomod Options</h4>
                    <ul className="pl-5">
                      {vehicleData.restomodOptions.map((option: string, idx: number) => (
                        <li key={idx}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {vehicleData.recommendedParts && vehicleData.recommendedParts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-base font-medium mb-2">Recommended Parts</h4>
                    <ul className="pl-5">
                      {vehicleData.recommendedParts.map((part: string, idx: number) => (
                        <li key={idx}>{part}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="specs" className="mt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {vehicleData.specifications && Object.keys(vehicleData.specifications).length > 0 && (
                  <div>
                    <h4 className="text-base font-medium mb-2">Original Specifications</h4>
                    <div className="bg-muted rounded-md p-4">
                      <dl className="grid grid-cols-1 gap-2">
                        {Object.entries(vehicleData.specifications).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-2">
                            <dt className="font-semibold">{key}:</dt>
                            <dd>{value as string}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                )}
                
                {!vehicleData.specifications || Object.keys(vehicleData.specifications).length === 0 && (
                  <div className="text-muted-foreground">
                    No detailed specifications available.
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VehicleResearchDetails;