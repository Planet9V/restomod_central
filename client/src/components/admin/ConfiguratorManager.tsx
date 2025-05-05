import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import CarModelsTab from './configurator/CarModelsTab';
import EnginesTab from './configurator/EnginesTab';
import TransmissionsTab from './configurator/TransmissionsTab';
import ColorsTab from './configurator/ColorsTab';
import WheelsTab from './configurator/WheelsTab';
import InteriorsTab from './configurator/InteriorsTab';
import AiOptionsTab from './configurator/AiOptionsTab';
import AdditionalOptionsTab from './configurator/AdditionalOptionsTab';
import UserConfigurationsTab from './configurator/UserConfigurationsTab';

export default function ConfiguratorManager() {
  const [activeTab, setActiveTab] = useState('car-models');
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Car Configurator Management</h2>
          <p className="text-muted-foreground mt-2">
            Manage all aspects of the car configurator including models, options, and user configurations.
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="car-models"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-9 w-full h-auto sm:h-10">
          <TabsTrigger value="car-models">Car Models</TabsTrigger>
          <TabsTrigger value="engines">Engines</TabsTrigger>
          <TabsTrigger value="transmissions">Transmissions</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="wheels">Wheels</TabsTrigger>
          <TabsTrigger value="interiors">Interiors</TabsTrigger>
          <TabsTrigger value="ai-options">AI Options</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
          <TabsTrigger value="configurations">User Configs</TabsTrigger>
        </TabsList>

        <TabsContent value="car-models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Car Models</CardTitle>
              <CardDescription>
                Manage classic car models available in the configurator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarModelsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engine Options</CardTitle>
              <CardDescription>
                Manage engine options for classic cars and restomods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnginesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transmissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transmission Options</CardTitle>
              <CardDescription>
                Manage transmission options compatible with cars and engines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransmissionsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Options</CardTitle>
              <CardDescription>
                Manage paint colors and finishes for classic cars.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColorsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wheels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wheel Options</CardTitle>
              <CardDescription>
                Manage wheel styles, materials, and sizes for classic cars.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WheelsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interiors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interior Options</CardTitle>
              <CardDescription>
                Manage interior materials, colors, and features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InteriorsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>McKenney AI Options</CardTitle>
              <CardDescription>
                Manage AI enhancement options for classic cars.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AiOptionsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
              <CardDescription>
                Manage additional customization options for classic cars.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdditionalOptionsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configurations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Configurations</CardTitle>
              <CardDescription>
                View and manage saved user configurations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserConfigurationsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
