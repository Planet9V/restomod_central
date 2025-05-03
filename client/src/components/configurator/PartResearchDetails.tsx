import React from 'react';
import { useResearch } from '@/hooks/use-research';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoIcon, DollarSign, Settings, Tool, HardDrive, CheckCircle } from 'lucide-react';

interface PartResearchDetailsProps {
  partName: string;
  modelName?: string;
  className?: string;
}

const PartResearchDetails: React.FC<PartResearchDetailsProps> = ({ 
  partName,
  modelName,
  className = ''
}) => {
  const { 
    getPartResearch, 
    data: partData, 
    status, 
    error 
  } = useResearch({
    cacheResults: true
  });

  // Fetch part data when the component mounts or part/model changes
  React.useEffect(() => {
    if (partName) {
      getPartResearch({ part: partName, model: modelName });
    }
  }, [partName, modelName, getPartResearch]);

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
          <p>Failed to load part information. Please try again later.</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!partData) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HardDrive className="mr-2 h-5 w-5" />
          {partName} {modelName ? `for ${modelName}` : 'Research'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="text-xs">
              <InfoIcon className="h-4 w-4 mr-1" /> Overview
            </TabsTrigger>
            <TabsTrigger value="compatibility" className="text-xs">
              <CheckCircle className="h-4 w-4 mr-1" /> Compatibility
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
                <p>{partData.overview}</p>
                
                {partData.marketTrends && (
                  <div className="mt-4">
                    <h4 className="text-base font-medium mb-2">Price Range</h4>
                    <p>{partData.marketTrends}</p>
                  </div>
                )}
                
                {partData.valueRange && (
                  <div className="mt-4">
                    <h4 className="text-base font-medium mb-2">Price</h4>
                    <Badge variant="outline" className="text-base py-1.5 font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {partData.valueRange}
                    </Badge>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="compatibility" className="mt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {partData.compatibility && (
                  <div>
                    <h4 className="text-base font-medium mb-2">Compatibility</h4>
                    <p>{partData.compatibility}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="upgrades" className="mt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {partData.commonUpgrades && partData.commonUpgrades.length > 0 && (
                  <div>
                    <h4 className="text-base font-medium mb-2">Modern Alternatives</h4>
                    <ul className="pl-5">
                      {partData.commonUpgrades.map((upgrade: string, idx: number) => (
                        <li key={idx}>{upgrade}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {partData.restomodOptions && partData.restomodOptions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-base font-medium mb-2">Installation Considerations</h4>
                    <ul className="pl-5">
                      {partData.restomodOptions.map((option: string, idx: number) => (
                        <li key={idx}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {partData.recommendedParts && partData.recommendedParts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-base font-medium mb-2">Recommended Brands</h4>
                    <ul className="pl-5">
                      {partData.recommendedParts.map((part: string, idx: number) => (
                        <li key={idx}>{part}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="specs" className="mt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {partData.specifications && Object.keys(partData.specifications).length > 0 && (
                  <div>
                    <h4 className="text-base font-medium mb-2">Technical Specifications</h4>
                    <div className="bg-muted rounded-md p-4">
                      <dl className="grid grid-cols-1 gap-2">
                        {Object.entries(partData.specifications).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-2">
                            <dt className="font-semibold">{key}:</dt>
                            <dd>{value as string}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                )}
                
                {!partData.specifications || Object.keys(partData.specifications).length === 0 && (
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

export default PartResearchDetails;