/**
 * VINInput Component
 *
 * Smart VIN input field with:
 * - Real-time validation (17 characters, no I/O/Q)
 * - Auto-formatting (XXX-XXXXXX-XXXXXXXX)
 * - Paste detection and cleaning
 * - Visual feedback
 * - Barcode scanning support
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cleanVIN, formatVIN, hasInvalidCharacters } from '@/api/vin';

export interface VINInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  showFormatted?: boolean;
  enableCamera?: boolean;
  className?: string;
  disabled?: boolean;
}

export function VINInput({
  value,
  onChange,
  onValidChange,
  label = 'Vehicle Identification Number (VIN)',
  error,
  placeholder = 'Enter 17-character VIN',
  showFormatted = true,
  enableCamera = false,
  className,
  disabled = false,
}: VINInputProps) {
  const [focused, setFocused] = useState(false);
  const [localError, setLocalError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Validation logic
  const validate = (vin: string): string => {
    if (!vin) return '';

    const cleaned = cleanVIN(vin);

    if (cleaned.length > 0 && cleaned.length !== 17) {
      return `VIN must be exactly 17 characters (${cleaned.length}/17)`;
    }

    if (hasInvalidCharacters(cleaned)) {
      return 'VIN cannot contain letters I, O, or Q';
    }

    if (cleaned && !/^[A-HJ-NPR-Z0-9]+$/i.test(cleaned)) {
      return 'VIN can only contain letters A-Z (except I, O, Q) and numbers 0-9';
    }

    return '';
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.toUpperCase();

    // Auto-clean if pasted
    if (newValue.includes('-') || newValue.includes(' ')) {
      newValue = cleanVIN(newValue);
    }

    // Limit to 17 characters
    if (cleanVIN(newValue).length > 17) {
      return;
    }

    onChange(newValue);

    const validationError = validate(newValue);
    setLocalError(validationError);

    // Notify parent of validation state
    if (onValidChange) {
      onValidChange(!validationError && cleanVIN(newValue).length === 17);
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleaned = cleanVIN(pastedText);

    if (cleaned.length <= 17) {
      onChange(cleaned);
      setLocalError(validate(cleaned));

      if (onValidChange) {
        onValidChange(!validate(cleaned) && cleaned.length === 17);
      }
    }
  };

  // Camera/barcode scanner (placeholder for now)
  const handleScanBarcode = () => {
    // TODO: Implement camera/barcode scanning
    alert('Barcode scanning feature coming soon! For now, please enter VIN manually.');
  };

  // Get display value (formatted or raw)
  const displayValue = showFormatted && !focused && cleanVIN(value).length === 17
    ? formatVIN(value)
    : value;

  // Determine validation state
  const isValid = !localError && !error && cleanVIN(value).length === 17;
  const isInvalid = (localError || error) && cleanVIN(value).length > 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        {label && (
          <Label htmlFor="vin-input" className="text-sm font-medium">
            {label}
          </Label>
        )}
        {enableCamera && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleScanBarcode}
            disabled={disabled}
            className="h-8 px-2"
          >
            <Camera className="h-4 w-4 mr-1" />
            Scan VIN
          </Button>
        )}
      </div>

      <div className="relative">
        <Input
          ref={inputRef}
          id="vin-input"
          type="text"
          value={displayValue}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={20} // Allow for formatting characters
          className={cn(
            'pr-10 uppercase font-mono tracking-wide transition-all',
            isValid && 'border-green-500 focus-visible:ring-green-500',
            isInvalid && 'border-red-500 focus-visible:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Validation indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid && (
            <Check className="h-5 w-5 text-green-500" />
          )}
          {isInvalid && (
            <X className="h-5 w-5 text-red-500" />
          )}
          {!isValid && !isInvalid && cleanVIN(value).length > 0 && (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Character counter */}
      <div className="flex items-center justify-between text-xs">
        <span className={cn(
          'text-muted-foreground',
          cleanVIN(value).length === 17 && 'text-green-600 font-medium'
        )}>
          {cleanVIN(value).length}/17 characters
        </span>

        {showFormatted && !focused && cleanVIN(value).length === 17 && (
          <span className="text-muted-foreground">
            Format: WMI-VDS-VIS
          </span>
        )}
      </div>

      {/* Error message */}
      {(localError || error) && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error || localError}
        </p>
      )}

      {/* Help text */}
      {!localError && !error && cleanVIN(value).length === 0 && (
        <p className="text-xs text-muted-foreground">
          VIN is a 17-character code that uniquely identifies your vehicle.
          You can find it on your vehicle's dashboard, driver's side door jamb, or title.
        </p>
      )}
    </div>
  );
}
