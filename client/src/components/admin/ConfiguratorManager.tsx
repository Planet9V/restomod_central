import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CarModelsTab from './configurator/CarModelsTab';
import EnginesTab from './configurator/EnginesTab';
import TransmissionsTab from './configurator/TransmissionsTab';
import ColorsTab from './configurator/ColorsTab';
import WheelsTab from './configurator/WheelsTab';

export function ConfiguratorManager() {
  const [activeTab, setActiveTab] = useState('car-models');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="car-models">Car Models</TabsTrigger>
          <TabsTrigger value="engines">Engines</TabsTrigger>
          <TabsTrigger value="transmissions">Transmissions</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="wheels">Wheels</TabsTrigger>
        </TabsList>

        <TabsContent value="car-models" className="mt-6">
          <CarModelsTab />
        </TabsContent>

        <TabsContent value="engines" className="mt-6">
          <EnginesTab />
        </TabsContent>

        <TabsContent value="transmissions" className="mt-6">
          <TransmissionsTab />
        </TabsContent>

        <TabsContent value="colors" className="mt-6">
          <ColorsTab />
        </TabsContent>

        <TabsContent value="wheels" className="mt-6">
          <WheelsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
