import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnginesTab from './configurator/EnginesTab';
import TransmissionsTab from './configurator/TransmissionsTab';
import ColorsTab from './configurator/ColorsTab';
import WheelsTab from './configurator/WheelsTab';
import InteriorsTab from './configurator/InteriorsTab';
import AiOptionsTab from './configurator/AiOptionsTab';
import AdditionalOptionsTab from './configurator/AdditionalOptionsTab';
import UserConfigurationsTab from './configurator/UserConfigurationsTab';

export function ConfiguratorManager() {
  const [activeTab, setActiveTab] = useState('engines');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-[var(--admin-card-border)]">
          <TabsList className="admin-tabs-list">
            <TabsTrigger value="engines" className="admin-tabs-trigger">Engines</TabsTrigger>
            <TabsTrigger value="transmissions" className="admin-tabs-trigger">Transmissions</TabsTrigger>
            <TabsTrigger value="colors" className="admin-tabs-trigger">Colors</TabsTrigger>
            <TabsTrigger value="wheels" className="admin-tabs-trigger">Wheels</TabsTrigger>
            <TabsTrigger value="interiors" className="admin-tabs-trigger">Interiors</TabsTrigger>
            <TabsTrigger value="ai-options" className="admin-tabs-trigger">AI Options</TabsTrigger>
            <TabsTrigger value="additional-options" className="admin-tabs-trigger">Add-ons</TabsTrigger>
            <TabsTrigger value="user-configurations" className="admin-tabs-trigger">Saved Configs</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="engines" className="pt-6">
          <EnginesTab />
        </TabsContent>
        
        <TabsContent value="transmissions" className="pt-6">
          <TransmissionsTab />
        </TabsContent>
        
        <TabsContent value="colors" className="pt-6">
          <ColorsTab />
        </TabsContent>
        
        <TabsContent value="wheels" className="pt-6">
          <WheelsTab />
        </TabsContent>
        
        <TabsContent value="interiors" className="pt-6">
          <InteriorsTab />
        </TabsContent>
        
        <TabsContent value="ai-options" className="pt-6">
          <AiOptionsTab />
        </TabsContent>
        
        <TabsContent value="additional-options" className="pt-6">
          <AdditionalOptionsTab />
        </TabsContent>
        
        <TabsContent value="user-configurations" className="pt-6">
          <UserConfigurationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
