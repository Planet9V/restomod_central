/**
 * VIN Decoder API Client
 *
 * Client-side API calls for VIN decoding and validation
 */

export interface DecodedVehicle {
  // Basic Information
  vin: string;
  valid: boolean;
  make: string | null;
  model: string | null;
  modelYear: number | null;
  trim: string | null;

  // Identification
  manufacturer: string | null;
  plantCountry: string | null;
  plantCity: string | null;

  // Classification
  vehicleType: string | null;
  bodyClass: string | null;
  doors: number | null;

  // Engine & Performance
  engineModel: string | null;
  engineCylinders: number | null;
  displacement: string | null;
  fuelType: string | null;
  engineHP: number | null;

  // Transmission & Drivetrain
  transmissionStyle: string | null;
  driveType: string | null;

  // Dimensions
  wheelbase: string | null;
  gvwr: string | null;

  // Safety & Features
  abs: string | null;
  airbags: string | null;

  // Additional Info
  series: string | null;
  errorCodes: string[];
  rawData?: any;
}

export interface VinValidation {
  vin: string;
  valid: boolean;
  errors: string[];
}

export interface VinDecodeResponse {
  success: boolean;
  data: DecodedVehicle;
  timestamp: string;
}

export interface VinValidationResponse {
  success: boolean;
  data: VinValidation;
}

/**
 * Decode a VIN using NHTSA service
 * Returns complete vehicle information
 */
export async function decodeVIN(vin: string, modelYear?: number): Promise<DecodedVehicle> {
  const response = await fetch('/api/vin/decode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vin, modelYear }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to decode VIN');
  }

  const result: VinDecodeResponse = await response.json();
  return result.data;
}

/**
 * Validate VIN format (offline check)
 * Does not make API call to NHTSA
 */
export async function validateVIN(vin: string): Promise<VinValidation> {
  const response = await fetch('/api/vin/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vin }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to validate VIN');
  }

  const result: VinValidationResponse = await response.json();
  return result.data;
}

/**
 * Batch decode multiple VINs (max 50)
 */
export async function batchDecodeVINs(vins: string[]): Promise<DecodedVehicle[]> {
  const response = await fetch('/api/vin/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vins }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to batch decode VINs');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Enrich existing car data with NHTSA information
 */
export async function enrichCarData(vin: string, existingData: Record<string, any> = {}): Promise<any> {
  const response = await fetch('/api/vin/enrich', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vin, existingData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to enrich car data');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Format VIN for display (XXX-XXXXXX-XXXXXXXX)
 */
export function formatVIN(vin: string): string {
  if (vin.length !== 17) {
    return vin;
  }

  // Format: WMI-VDS-VIS (3-6-8 characters)
  return `${vin.slice(0, 3)}-${vin.slice(3, 9)}-${vin.slice(9)}`;
}

/**
 * Clean VIN input (remove spaces, dashes, convert to uppercase)
 */
export function cleanVIN(vin: string): string {
  return vin.replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Check if VIN contains invalid characters (I, O, Q not allowed)
 */
export function hasInvalidCharacters(vin: string): boolean {
  return /[IOQ]/i.test(vin);
}
