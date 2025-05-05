import React from 'react';
import { Button } from '@/components/ui/button';

export default function UserConfigurationsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Manage saved user configurations for classic car restomods.
        </p>
      </div>
      <div className="p-12 flex items-center justify-center border rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium">User Configurations Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This section will be implemented in the next phase.
          </p>
        </div>
      </div>
    </div>
  );
}
