/**
 * VehicleDataDisplay Component
 *
 * Displays decoded NHTSA vehicle data in organized, visually appealing cards
 * Shows specifications with confidence indicators
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Car,
  Gauge,
  Cog,
  Palette,
  MapPin,
  Factory,
  Shield,
  Award,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DecodedVehicle } from '@/api/vin';

export interface VehicleDataDisplayProps {
  vehicle: DecodedVehicle;
  highlightAutoFilled?: boolean;
  className?: string;
}

export function VehicleDataDisplay({
  vehicle,
  highlightAutoFilled = true,
  className,
}: VehicleDataDisplayProps) {
  if (!vehicle.valid) {
    return (
      <Card className={cn('border-red-200', className)}>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Info className="h-8 w-8 text-red-500 mx-auto" />
            <h3 className="font-semibold">Invalid VIN</h3>
            <p className="text-sm text-muted-foreground">
              {vehicle.errorCodes.join(', ') || 'This VIN could not be verified'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Vehicle Info */}
      <Card className={cn(
        'border-2 transition-all',
        highlightAutoFilled && 'border-green-200 bg-green-50/50 dark:bg-green-950/20'
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {vehicle.modelYear} {vehicle.make} {vehicle.model}
            </CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              NHTSA Verified
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DataField label="Year" value={vehicle.modelYear} />
            <DataField label="Make" value={vehicle.make} />
            <DataField label="Model" value={vehicle.model} />
            <DataField label="Trim" value={vehicle.trim || 'N/A'} />
          </div>

          {vehicle.series && (
            <DataField label="Series" value={vehicle.series} fullWidth />
          )}
        </CardContent>
      </Card>

      {/* Engine & Performance */}
      {(vehicle.engineModel || vehicle.engineCylinders || vehicle.displacement || vehicle.engineHP) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Engine & Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DataField label="Engine" value={vehicle.engineModel} />
              <DataField
                label="Cylinders"
                value={vehicle.engineCylinders ? `${vehicle.engineCylinders} cyl` : null}
              />
              <DataField label="Displacement" value={vehicle.displacement} />
              <DataField
                label="Horsepower"
                value={vehicle.engineHP ? `${vehicle.engineHP} HP` : null}
              />
              <DataField label="Fuel Type" value={vehicle.fuelType} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transmission & Drivetrain */}
      {(vehicle.transmissionStyle || vehicle.driveType) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Transmission & Drivetrain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <DataField label="Transmission" value={vehicle.transmissionStyle} />
              <DataField label="Drive Type" value={vehicle.driveType} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Body & Classification */}
      {(vehicle.vehicleType || vehicle.bodyClass || vehicle.doors) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Body & Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DataField label="Vehicle Type" value={vehicle.vehicleType} />
              <DataField label="Body Class" value={vehicle.bodyClass} />
              <DataField
                label="Doors"
                value={vehicle.doors ? `${vehicle.doors} doors` : null}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manufacturing Info */}
      {(vehicle.manufacturer || vehicle.plantCountry || vehicle.plantCity) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Manufacturing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DataField label="Manufacturer" value={vehicle.manufacturer} />
              <DataField
                label="Plant Location"
                value={
                  vehicle.plantCity && vehicle.plantCountry
                    ? `${vehicle.plantCity}, ${vehicle.plantCountry}`
                    : vehicle.plantCountry
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Features */}
      {(vehicle.abs || vehicle.airbags) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Safety Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField label="ABS" value={vehicle.abs} />
              <DataField label="Airbags" value={vehicle.airbags} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Dimensions */}
      {(vehicle.wheelbase || vehicle.gvwr) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataField label="Wheelbase" value={vehicle.wheelbase} />
              <DataField label="GVWR" value={vehicle.gvwr} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component for data fields
interface DataFieldProps {
  label: string;
  value: string | number | null | undefined;
  fullWidth?: boolean;
}

function DataField({ label, value, fullWidth = false }: DataFieldProps) {
  const hasValue = value !== null && value !== undefined && value !== '';

  return (
    <div className={cn(fullWidth && 'col-span-full')}>
      <dt className="text-xs font-medium text-muted-foreground mb-1">{label}</dt>
      <dd className={cn(
        'text-sm font-medium',
        hasValue ? 'text-foreground' : 'text-muted-foreground italic'
      )}>
        {hasValue ? value : 'Not Available'}
      </dd>
    </div>
  );
}
