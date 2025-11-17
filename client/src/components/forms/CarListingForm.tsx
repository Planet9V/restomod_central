/**
 * CarListingForm Component
 *
 * Example integration of VINDecoder with React Hook Form
 * Demonstrates:
 * - Auto-filling form fields from VIN decode
 * - Manual override capability
 * - Field highlighting for auto-filled values
 * - Form validation with Zod
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VINDecoder, type AutoFillData } from './VINDecoder';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

// Form validation schema
const carListingSchema = z.object({
  vin: z.string().length(17, 'VIN must be exactly 17 characters'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  trim: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.string().optional(),
  bodyStyle: z.string().optional(),
  fuelType: z.string().optional(),
  drivetrain: z.string().optional(),
  mileage: z.number().min(0).optional(),
  price: z.number().min(0),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(1, 'Location is required'),
});

type CarListingFormData = z.infer<typeof carListingSchema>;

export interface CarListingFormProps {
  onSubmit?: (data: CarListingFormData) => void | Promise<void>;
  initialData?: Partial<CarListingFormData>;
  className?: string;
}

export function CarListingForm({
  onSubmit,
  initialData,
  className,
}: CarListingFormProps) {
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CarListingFormData>({
    resolver: zodResolver(carListingSchema),
    defaultValues: {
      vin: initialData?.vin || '',
      make: initialData?.make || '',
      model: initialData?.model || '',
      year: initialData?.year || new Date().getFullYear(),
      trim: initialData?.trim || '',
      engine: initialData?.engine || '',
      transmission: initialData?.transmission || '',
      bodyStyle: initialData?.bodyStyle || '',
      fuelType: initialData?.fuelType || '',
      drivetrain: initialData?.drivetrain || '',
      mileage: initialData?.mileage,
      price: initialData?.price || 0,
      condition: initialData?.condition || 'Good',
      description: initialData?.description || '',
      location: initialData?.location || '',
    },
  });

  // Handle auto-fill from VIN decoder
  const handleAutoFill = (data: AutoFillData) => {
    const fieldsToFill: Array<keyof AutoFillData> = [
      'make',
      'model',
      'year',
      'trim',
      'engine',
      'transmission',
      'bodyStyle',
      'fuelType',
      'drivetrain',
    ];

    const filled = new Set<string>();

    fieldsToFill.forEach((field) => {
      const value = data[field];
      if (value !== undefined && value !== null) {
        form.setValue(field as any, value);
        filled.add(field);
      }
    });

    setAutoFilledFields(filled);
  };

  // Handle form submission
  const handleSubmit = async (data: CarListingFormData) => {
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        console.log('Form data:', data);
        alert('Form submitted successfully! Check console for data.');
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if field was auto-filled
  const isAutoFilled = (fieldName: string) => autoFilledFields.has(fieldName);

  return (
    <div className={cn('space-y-8', className)}>
      {/* VIN Decoder Section */}
      <VINDecoder
        onAutoFill={handleAutoFill}
        showDataDisplay={false}
      />

      <Separator />

      {/* Car Listing Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Fields marked with <Sparkles className="inline h-3 w-3 text-green-600" /> were
                auto-filled from VIN
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Make {isAutoFilled('make') && <Sparkles className="h-3 w-3 text-green-600" />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={cn(
                          isAutoFilled('make') && 'border-green-300 bg-green-50/50 dark:bg-green-950/20'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Model {isAutoFilled('model') && <Sparkles className="h-3 w-3 text-green-600" />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={cn(
                          isAutoFilled('model') && 'border-green-300 bg-green-50/50 dark:bg-green-950/20'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Year {isAutoFilled('year') && <Sparkles className="h-3 w-3 text-green-600" />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className={cn(
                          isAutoFilled('year') && 'border-green-300 bg-green-50/50 dark:bg-green-950/20'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Trim {isAutoFilled('trim') && <Sparkles className="h-3 w-3 text-green-600" />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={cn(
                          isAutoFilled('trim') && 'border-green-300 bg-green-50/50 dark:bg-green-950/20'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="engine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Engine {isAutoFilled('engine') && <Sparkles className="h-3 w-3 text-green-600" />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 5.0L V8"
                        className={cn(
                          isAutoFilled('engine') && 'border-green-300 bg-green-50/50 dark:bg-green-950/20'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Transmission {isAutoFilled('transmission') && <Sparkles className="h-3 w-3 text-green-600" />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 6-speed Manual"
                        className={cn(
                          isAutoFilled('transmission') && 'border-green-300 bg-green-50/50 dark:bg-green-950/20'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bodyStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Body Style {isAutoFilled('bodyStyle') && <Sparkles className="h-3 w-3 text-green-600" />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Coupe, Sedan"
                        className={cn(
                          isAutoFilled('bodyStyle') && 'border-green-300 bg-green-50/50 dark:bg-green-950/20'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="drivetrain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Drivetrain {isAutoFilled('drivetrain') && <Sparkles className="h-3 w-3 text-green-600" />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., RWD, AWD"
                        className={cn(
                          isAutoFilled('drivetrain') && 'border-green-300 bg-green-50/50 dark:bg-green-950/20'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Condition & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Condition & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Enter mileage"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        placeholder="Enter price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City, State" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide a detailed description of the vehicle..."
                        rows={6}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 50 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Listing
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
