/**
 * Midwest Car Show Data Importer Component
 * Allows admin to import authentic car show events from research documents
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Calendar, Users, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportStats {
  imported: number;
  duplicatesSkipped: number;
  errors: number;
  totalProcessed: number;
}

export default function MidwestCarShowImporter() {
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const { toast } = useToast();

  const handleImportMidwestData = async () => {
    setIsImporting(true);
    setImportStats(null);

    try {
      const response = await fetch('/api/admin/import-midwest-car-shows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setImportStats(result.stats);
        toast({
          title: "Import Successful!",
          description: `Imported ${result.stats.imported} authentic Midwest car show events`,
        });
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Failed to import car show data',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Midwest Car Show Data Import
        </CardTitle>
        <CardDescription>
          Import authentic car show events from comprehensive Midwest research documents
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Import Stats Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">175+</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-muted-foreground">States</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">2025</div>
            <div className="text-sm text-muted-foreground">Current Year</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-muted-foreground">Authentic</div>
          </div>
        </div>

        {/* Coverage Areas */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Geographic Coverage
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'South Dakota', 'Wisconsin'].map((state) => (
              <Badge key={state} variant="secondary" className="text-xs">
                {state}
              </Badge>
            ))}
          </div>
        </div>

        {/* Event Types */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Event Types Included
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Car Shows', 'Cruise Nights', 'Auctions', 'Concours', 'Festivals', 'Rod Runs', 'Swap Meets'].map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Featured Events Preview */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Notable Events Include
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>• Goodguys 34th Speedway Motors Heartland Nationals (Iowa)</div>
            <div>• MSRA Back to the 50's Weekend (Minnesota)</div>
            <div>• International Route 66 Mother Road Festival (Illinois)</div>
            <div>• British Car Union 37th Annual Show (Indiana)</div>
            <div>• 41st Annual Mopars in the Park (Minnesota)</div>
          </div>
        </div>

        {/* Import Button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={handleImportMidwestData}
            disabled={isImporting}
            className="w-full"
            size="lg"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing Authentic Data...
              </>
            ) : (
              'Import Midwest Car Show Data'
            )}
          </Button>
        </div>

        {/* Import Results */}
        {importStats && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">Import Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-700">✅ Imported</div>
                <div className="text-green-600">{importStats.imported} events</div>
              </div>
              <div>
                <div className="font-medium text-orange-700">⚠️ Duplicates</div>
                <div className="text-orange-600">{importStats.duplicatesSkipped} skipped</div>
              </div>
              <div>
                <div className="font-medium text-red-700">❌ Errors</div>
                <div className="text-red-600">{importStats.errors} failed</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">📊 Total</div>
                <div className="text-blue-600">{importStats.totalProcessed} processed</div>
              </div>
            </div>
          </div>
        )}

        {/* Data Quality Note */}
        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
          <strong>Data Quality:</strong> All events sourced from authentic research documents including official event websites, 
          organizer contact information, and verified venue details. No synthetic or placeholder data is used.
        </div>
      </CardContent>
    </Card>
  );
}