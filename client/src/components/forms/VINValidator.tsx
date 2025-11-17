/**
 * VINValidator Component
 *
 * Real-time VIN validation indicator with visual feedback
 * Shows validation status, errors, and confidence level
 */

import React from 'react';
import { Check, X, AlertCircle, Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export interface VINValidatorProps {
  vin: string;
  isValid?: boolean;
  isValidating?: boolean;
  errors?: string[];
  nhtsaVerified?: boolean;
  className?: string;
}

export function VINValidator({
  vin,
  isValid = false,
  isValidating = false,
  errors = [],
  nhtsaVerified = false,
  className,
}: VINValidatorProps) {
  if (!vin || vin.length === 0) {
    return null;
  }

  // Determine status
  const hasErrors = errors.length > 0;
  const isComplete = vin.replace(/[\s-]/g, '').length === 17;

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-3">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">VIN Validation</h3>

          {isValidating && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Validating...
            </Badge>
          )}

          {!isValidating && isValid && (
            <Badge variant="default" className="gap-1 bg-green-600">
              <Check className="h-3 w-3" />
              Valid VIN
            </Badge>
          )}

          {!isValidating && hasErrors && (
            <Badge variant="destructive" className="gap-1">
              <X className="h-3 w-3" />
              Invalid VIN
            </Badge>
          )}

          {!isValidating && !isValid && !hasErrors && isComplete && (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Needs Verification
            </Badge>
          )}
        </div>

        {/* Validation Checks */}
        <div className="space-y-2">
          <ValidationCheck
            label="Length (17 characters)"
            passed={isComplete}
            current={vin.replace(/[\s-]/g, '').length}
            expected={17}
          />

          <ValidationCheck
            label="Character format (A-Z, 0-9)"
            passed={!/[^A-HJ-NPR-Z0-9\s-]/i.test(vin)}
          />

          <ValidationCheck
            label="No invalid letters (I, O, Q)"
            passed={!/[IOQ]/i.test(vin)}
          />

          {nhtsaVerified && (
            <ValidationCheck
              label="NHTSA database verified"
              passed={true}
              icon={<Shield className="h-4 w-4" />}
            />
          )}
        </div>

        {/* Error Messages */}
        {hasErrors && (
          <div className="mt-3 pt-3 border-t space-y-1">
            {errors.map((error, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-red-600">
                <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* NHTSA Verification Badge */}
        {nhtsaVerified && isValid && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <Shield className="h-5 w-5" />
              <div>
                <div className="font-semibold">Verified by NHTSA</div>
                <div className="text-xs text-muted-foreground">
                  Official U.S. Department of Transportation database
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Helper component for individual validation checks
interface ValidationCheckProps {
  label: string;
  passed: boolean;
  current?: number;
  expected?: number;
  icon?: React.ReactNode;
}

function ValidationCheck({ label, passed, current, expected, icon }: ValidationCheckProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon || (
        passed ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-red-500" />
        )
      )}
      <span className={cn(
        'flex-1',
        passed ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {label}
      </span>
      {current !== undefined && expected !== undefined && (
        <span className={cn(
          'text-xs font-mono',
          passed ? 'text-green-600' : 'text-muted-foreground'
        )}>
          {current}/{expected}
        </span>
      )}
    </div>
  );
}
