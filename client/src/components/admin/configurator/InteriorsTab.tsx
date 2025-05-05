import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function InteriorsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Manage interior options for classic car restomods.
        </p>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Interior Option
        </Button>
      </div>
      <div className="p-12 flex items-center justify-center border rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium">Interior Options Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This section will be implemented in the next phase.
          </p>
        </div>
      </div>
    </div>
  );
}
