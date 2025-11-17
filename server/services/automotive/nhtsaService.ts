/**
 * NHTSA VIN Decoder Service
 *
 * Integrates with the National Highway Traffic Safety Administration (NHTSA)
 * Vehicle Product Information Catalog (VPIC) API for VIN decoding and vehicle data.
 *
 * Features:
 * - Free, unlimited VIN decoding (no API key required)
 * - 24 different API endpoints for comprehensive vehicle data
 * - Batch VIN decoding (up to 50 VINs at once)
 * - Offline VIN validation (checksum verification)
 * - Full TypeScript support with intellisense
 *
 * Use Cases:
 * - Auto-fill vehicle details from VIN during listing creation
 * - Verify VIN authenticity to prevent fraud
 * - Enrich existing vehicle data with official NHTSA information
 * - Search filters by engine type, body class, manufacturer
 *
 * @see https://vpic.shaggytech.com/ - Official Documentation
 * @see SPEC_07_ENHANCED_TOOLS.md - Enhanced Tools Specification
 */

import {
  DecodeVin,
  DecodeVinValues,
  DecodeVinValuesBatch,
  GetMakesForVehicleType,
  GetModelsForMake,
  GetVehicleTypesForMake,
  isValidVin,
  type NhtsaResponse,
} from '@shaggytools/nhtsa-api-wrapper';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Decoded VIN result with essential vehicle information
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
  rawData?: any; // Full NHTSA response for advanced use
}

/**
 * VIN validation result
 */
export interface VinValidation {
  vin: string;
  valid: boolean;
  errors: string[];
}

/**
 * Vehicle makes for a specific type
 */
export interface VehicleMake {
  makeId: number;
  makeName: string;
  vehicleTypeId: number;
  vehicleTypeName: string;
}

/**
 * Vehicle models for a make
 */
export interface VehicleModel {
  makeId: number;
  makeName: string;
  modelId: number;
  modelName: string;
}

// ============================================================================
// VIN DECODING
// ============================================================================

/**
 * Decode VIN and return structured vehicle data
 *
 * This is the primary function for VIN decoding. It validates the VIN,
 * fetches data from NHTSA, and returns a clean, typed object.
 *
 * @param vin - 17-character Vehicle Identification Number
 * @param modelYear - Optional model year for better accuracy (classic cars)
 * @returns Decoded vehicle information
 *
 * @example
 * const vehicle = await decodeVIN('7F03Z102345');
 * // Returns: { make: 'FORD', model: 'Mustang', modelYear: 1967, ... }
 *
 * @example
 * // For classic cars, providing model year improves accuracy
 * const vehicle = await decodeVIN('7F03Z102345', 1967);
 */
export async function decodeVIN(
  vin: string,
  modelYear?: number
): Promise<DecodedVehicle> {
  // Validate VIN format (offline check)
  const vinValidation = validateVIN(vin);
  if (!vinValidation.valid) {
    return {
      vin,
      valid: false,
      make: null,
      model: null,
      modelYear: null,
      trim: null,
      manufacturer: null,
      plantCountry: null,
      plantCity: null,
      vehicleType: null,
      bodyClass: null,
      doors: null,
      engineModel: null,
      engineCylinders: null,
      displacement: null,
      fuelType: null,
      engineHP: null,
      transmissionStyle: null,
      driveType: null,
      wheelbase: null,
      gvwr: null,
      abs: null,
      airbags: null,
      series: null,
      errorCodes: vinValidation.errors,
    };
  }

  try {
    // Fetch from NHTSA API
    const response = await DecodeVinValues(vin, { modelYear });

    // Check if response is valid
    if (!response || !response.Results || response.Results.length === 0) {
      throw new Error('No data returned from NHTSA API');
    }

    const data = response.Results[0];

    // Extract error codes if any
    const errorCodes: string[] = [];
    if (data.ErrorCode && data.ErrorCode !== '0') {
      errorCodes.push(data.ErrorText || 'Unknown error');
    }

    // Build structured response
    const decoded: DecodedVehicle = {
      vin: vin.toUpperCase(),
      valid: errorCodes.length === 0,

      // Basic Information
      make: data.Make || null,
      model: data.Model || null,
      modelYear: data.ModelYear ? parseInt(data.ModelYear, 10) : null,
      trim: data.Trim || null,

      // Identification
      manufacturer: data.Manufacturer || null,
      plantCountry: data.PlantCountry || null,
      plantCity: data.PlantCity || null,

      // Classification
      vehicleType: data.VehicleType || null,
      bodyClass: data.BodyClass || null,
      doors: data.Doors ? parseInt(data.Doors, 10) : null,

      // Engine & Performance
      engineModel: data.EngineModel || null,
      engineCylinders: data.EngineCylinders ? parseInt(data.EngineCylinders, 10) : null,
      displacement: data.DisplacementL ? `${data.DisplacementL}L` : data.DisplacementCC ? `${data.DisplacementCC}cc` : null,
      fuelType: data.FuelTypePrimary || null,
      engineHP: data.EngineHP ? parseInt(data.EngineHP, 10) : null,

      // Transmission & Drivetrain
      transmissionStyle: data.TransmissionStyle || null,
      driveType: data.DriveType || null,

      // Dimensions
      wheelbase: data.WheelBaseShort || data.WheelBaseLong || null,
      gvwr: data.GVWR || null,

      // Safety & Features
      abs: data.ABS || null,
      airbags: data.AirBagLocFront || null,

      // Additional
      series: data.Series || null,
      errorCodes,
      rawData: data, // Include full response for advanced use
    };

    console.log(`✅ VIN decoded successfully: ${vin} -> ${decoded.make} ${decoded.model} ${decoded.modelYear}`);

    return decoded;

  } catch (error) {
    console.error(`❌ Failed to decode VIN ${vin}:`, error);

    return {
      vin,
      valid: false,
      make: null,
      model: null,
      modelYear: null,
      trim: null,
      manufacturer: null,
      plantCountry: null,
      plantCity: null,
      vehicleType: null,
      bodyClass: null,
      doors: null,
      engineModel: null,
      engineCylinders: null,
      displacement: null,
      fuelType: null,
      engineHP: null,
      transmissionStyle: null,
      driveType: null,
      wheelbase: null,
      gvwr: null,
      abs: null,
      airbags: null,
      series: null,
      errorCodes: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Validate VIN format (offline check)
 *
 * Performs client-side validation using checksum algorithm.
 * Does not require API call.
 *
 * @param vin - VIN to validate
 * @returns Validation result
 *
 * @example
 * const result = validateVIN('7F03Z102345');
 * if (!result.valid) {
 *   console.error('Invalid VIN:', result.errors);
 * }
 */
export function validateVIN(vin: string): VinValidation {
  const errors: string[] = [];

  // Check length
  if (!vin || vin.length !== 17) {
    errors.push('VIN must be exactly 17 characters');
  }

  // Check format (alphanumeric, no I, O, Q)
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
    errors.push('VIN contains invalid characters (I, O, Q are not allowed)');
  }

  // Use library's checksum validation
  if (vin.length === 17 && !isValidVin(vin)) {
    errors.push('VIN checksum validation failed');
  }

  return {
    vin,
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Decode multiple VINs at once (batch processing)
 *
 * More efficient than calling decodeVIN multiple times.
 * Maximum 50 VINs per batch.
 *
 * @param vins - Array of VINs to decode
 * @returns Array of decoded vehicles
 *
 * @example
 * const vehicles = await batchDecodeVINs([
 *   '7F03Z102345',
 *   '1G1YY32G965107737',
 *   'JH4NA1157MT001832'
 * ]);
 */
export async function batchDecodeVINs(vins: string[]): Promise<DecodedVehicle[]> {
  if (vins.length === 0) {
    return [];
  }

  if (vins.length > 50) {
    console.warn('⚠️  NHTSA API supports max 50 VINs per batch. Processing first 50.');
    vins = vins.slice(0, 50);
  }

  try {
    // Format VINs as comma-separated string
    const vinString = vins.join(',');

    const response = await DecodeVinValuesBatch(vinString);

    if (!response || !response.Results) {
      throw new Error('No data returned from NHTSA batch API');
    }

    // Map results to our DecodedVehicle format
    const results: DecodedVehicle[] = [];

    for (const data of response.Results) {
      const errorCodes: string[] = [];
      if (data.ErrorCode && data.ErrorCode !== '0') {
        errorCodes.push(data.ErrorText || 'Unknown error');
      }

      results.push({
        vin: data.VIN?.toUpperCase() || '',
        valid: errorCodes.length === 0,
        make: data.Make || null,
        model: data.Model || null,
        modelYear: data.ModelYear ? parseInt(data.ModelYear, 10) : null,
        trim: data.Trim || null,
        manufacturer: data.Manufacturer || null,
        plantCountry: data.PlantCountry || null,
        plantCity: data.PlantCity || null,
        vehicleType: data.VehicleType || null,
        bodyClass: data.BodyClass || null,
        doors: data.Doors ? parseInt(data.Doors, 10) : null,
        engineModel: data.EngineModel || null,
        engineCylinders: data.EngineCylinders ? parseInt(data.EngineCylinders, 10) : null,
        displacement: data.DisplacementL ? `${data.DisplacementL}L` : null,
        fuelType: data.FuelTypePrimary || null,
        engineHP: data.EngineHP ? parseInt(data.EngineHP, 10) : null,
        transmissionStyle: data.TransmissionStyle || null,
        driveType: data.DriveType || null,
        wheelbase: data.WheelBaseShort || null,
        gvwr: data.GVWR || null,
        abs: data.ABS || null,
        airbags: data.AirBagLocFront || null,
        series: data.Series || null,
        errorCodes,
        rawData: data,
      });
    }

    console.log(`✅ Batch decoded ${results.length} VINs`);
    return results;

  } catch (error) {
    console.error('❌ Failed to batch decode VINs:', error);
    throw error;
  }
}

// ============================================================================
// VEHICLE DATA LOOKUPS
// ============================================================================

/**
 * Get all makes for a specific vehicle type
 *
 * @param vehicleType - Type of vehicle (e.g., 'Passenger Car', 'Truck', 'Motorcycle')
 * @returns Array of vehicle makes
 *
 * @example
 * const makes = await getMakesForVehicleType('Passenger Car');
 * // Returns: [{ makeId: 440, makeName: 'FORD', ... }, ...]
 */
export async function getMakesForVehicleType(vehicleType: string): Promise<VehicleMake[]> {
  try {
    const response = await GetMakesForVehicleType(vehicleType);

    if (!response || !response.Results) {
      return [];
    }

    return response.Results.map((make) => ({
      makeId: make.MakeId,
      makeName: make.MakeName,
      vehicleTypeId: make.VehicleTypeId,
      vehicleTypeName: make.VehicleTypeName,
    }));
  } catch (error) {
    console.error('Failed to get makes for vehicle type:', error);
    return [];
  }
}

/**
 * Get all models for a specific make
 *
 * @param make - Manufacturer name (e.g., 'Ford', 'Chevrolet')
 * @returns Array of vehicle models
 *
 * @example
 * const models = await getModelsForMake('Ford');
 * // Returns: [{ modelId: 1848, modelName: 'Mustang', ... }, ...]
 */
export async function getModelsForMake(make: string): Promise<VehicleModel[]> {
  try {
    const response = await GetModelsForMake(make);

    if (!response || !response.Results) {
      return [];
    }

    return response.Results.map((model) => ({
      makeId: model.Make_ID,
      makeName: model.Make_Name,
      modelId: model.Model_ID,
      modelName: model.Model_Name,
    }));
  } catch (error) {
    console.error('Failed to get models for make:', error);
    return [];
  }
}

/**
 * Get vehicle types for a specific make
 *
 * @param make - Manufacturer name
 * @returns Array of vehicle types
 *
 * @example
 * const types = await getVehicleTypesForMake('Ford');
 * // Returns: ['Passenger Car', 'Truck', 'Multipurpose Passenger Vehicle (MPV)']
 */
export async function getVehicleTypesForMake(make: string): Promise<string[]> {
  try {
    const response = await GetVehicleTypesForMake(make);

    if (!response || !response.Results) {
      return [];
    }

    return response.Results.map((type) => type.VehicleTypeName).filter(Boolean);
  } catch (error) {
    console.error('Failed to get vehicle types for make:', error);
    return [];
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Enrich car listing data with NHTSA information
 *
 * Use this to auto-fill vehicle details when user provides a VIN.
 *
 * @param vin - Vehicle VIN
 * @param existingData - Existing car data to merge with
 * @returns Enriched car data
 *
 * @example
 * const enrichedCar = await enrichCarData('7F03Z102345', {
 *   price: 85000,
 *   condition: 'Excellent'
 * });
 * // Returns merged data with NHTSA info
 */
export async function enrichCarData(
  vin: string,
  existingData: Partial<any> = {}
): Promise<any> {
  const decoded = await decodeVIN(vin);

  if (!decoded.valid) {
    console.warn(`⚠️  VIN ${vin} is invalid, skipping enrichment`);
    return existingData;
  }

  // Merge NHTSA data with existing data (existing data takes precedence)
  return {
    ...decoded,
    ...existingData,
    vin: vin.toUpperCase(),
    // Only overwrite if existing data is null/undefined
    make: existingData.make || decoded.make,
    model: existingData.model || decoded.model,
    year: existingData.year || decoded.modelYear,
    bodyStyle: existingData.bodyStyle || decoded.bodyClass,
    engine: existingData.engine || decoded.engineModel,
    transmission: existingData.transmission || decoded.transmissionStyle,
  };
}

/**
 * Format VIN display with dashes for readability
 *
 * @param vin - 17-character VIN
 * @returns Formatted VIN (e.g., '7F03Z-1023-45678')
 *
 * @example
 * formatVIN('7F03Z102345');
 * // Returns: '7F03Z-10234-5'
 */
export function formatVIN(vin: string): string {
  if (vin.length !== 17) {
    return vin;
  }

  // Format: WMI-VDS-VIS (3-6-8 characters)
  return `${vin.slice(0, 3)}-${vin.slice(3, 9)}-${vin.slice(9)}`;
}

/**
 * Extract year from VIN (position 10)
 *
 * Note: This is an approximation. Use decodeVIN for accurate year.
 *
 * @param vin - 17-character VIN
 * @returns Model year or null
 */
export function extractYearFromVIN(vin: string): number | null {
  if (vin.length !== 17) {
    return null;
  }

  // Year code chart (simplified)
  const yearCode = vin.charAt(9).toUpperCase();
  const yearCodes: { [key: string]: number } = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
    'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
    'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
    'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
    'Y': 2030,
    // Numbers for 2001-2009
    '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
    '6': 2006, '7': 2007, '8': 2008, '9': 2009,
  };

  return yearCodes[yearCode] || null;
}
