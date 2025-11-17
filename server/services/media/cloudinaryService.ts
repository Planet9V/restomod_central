/**
 * Cloudinary Image Optimization Service
 *
 * Professional image delivery, optimization, and transformation for automotive photography.
 * Leverages Cloudinary's multi-CDN network (Akamai, Fastly, Cloudflare) for global delivery.
 *
 * Features:
 * - AI-powered image optimization (auto quality, format, compression)
 * - Advanced transformations (resize, crop, enhance, watermark)
 * - Multi-CDN delivery (<100ms global latency)
 * - Automatic WebP/AVIF conversion
 * - Background removal and enhancement
 * - Video support (360° car walk-arounds)
 *
 * FREE Tier:
 * - 25GB storage
 * - 25GB bandwidth/month
 * - Unlimited transformations
 * - Sufficient for ~5,000 car photos
 *
 * Use Cases:
 * - Upload car photos with automatic optimization
 * - Generate responsive image sizes (mobile, tablet, desktop)
 * - Apply watermarks for copyright protection
 * - Enhance photo quality (sharpen, color correction)
 * - Remove backgrounds for professional product shots
 *
 * Setup:
 * 1. Sign up at https://cloudinary.com/
 * 2. Get API credentials from Dashboard > Settings
 * 3. Add to .env:
 *    CLOUDINARY_CLOUD_NAME=your-cloud-name
 *    CLOUDINARY_API_KEY=your-api-key
 *    CLOUDINARY_API_SECRET=your-api-secret
 *
 * @see https://cloudinary.com/documentation - Official Documentation
 * @see SPEC_07_ENHANCED_TOOLS.md - Enhanced Tools Specification
 */

import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Initialize Cloudinary with environment variables
 */
function initCloudinary(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('⚠️  Cloudinary not configured - image optimization disabled');
    console.warn('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true, // Always use HTTPS
  });

  console.log(`✅ Cloudinary initialized: ${cloudName}`);
}

// Initialize on module load
initCloudinary();

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Image upload options
 */
export interface ImageUploadOptions {
  /** Public ID for the image (default: auto-generated) */
  publicId?: string;

  /** Folder to organize images (e.g., 'cars/mustang/1967') */
  folder?: string;

  /** Tags for AI-powered search (e.g., ['red', 'convertible', 'v8']) */
  tags?: string[];

  /** Context metadata (e.g., { vin: '7F03Z102345', make: 'Ford' }) */
  context?: Record<string, string>;

  /** Auto-apply quality optimization */
  autoQuality?: boolean;

  /** Auto-apply format optimization (WebP, AVIF) */
  autoFormat?: boolean;

  /** Apply transformations on upload */
  transformation?: TransformationOptions;

  /** Overwrite existing image */
  overwrite?: boolean;
}

/**
 * Image transformation options
 */
export interface TransformationOptions {
  /** Width in pixels */
  width?: number;

  /** Height in pixels */
  height?: number;

  /** Crop mode ('fill', 'fit', 'crop', 'thumb', 'scale') */
  crop?: string;

  /** Quality (1-100 or 'auto', 'auto:best', 'auto:good', 'auto:eco') */
  quality?: string | number;

  /** Format ('auto', 'webp', 'avif', 'jpg', 'png') */
  fetchFormat?: string;

  /** Gravity for cropping ('face', 'auto', 'center', 'north', etc.) */
  gravity?: string;

  /** Effects (e.g., 'sharpen:100', 'blur:300', 'grayscale') */
  effect?: string;

  /** Background color or 'gen_fill' for AI background */
  background?: string;

  /** Overlay image (e.g., watermark) */
  overlay?: string;

  /** DPR (Device Pixel Ratio) for retina displays */
  dpr?: number | 'auto';
}

/**
 * Cloudinary image metadata
 */
export interface CloudinaryImage {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: string;
  tags: string[];
  folder?: string;
  context?: Record<string, string>;
}

// ============================================================================
// IMAGE UPLOAD
// ============================================================================

/**
 * Upload image from file path
 *
 * @param filePath - Path to image file
 * @param options - Upload options
 * @returns Cloudinary image metadata
 *
 * @example
 * const image = await uploadImage('./mustang.jpg', {
 *   folder: 'cars/ford/mustang',
 *   tags: ['1967', 'fastback', 'red'],
 *   autoQuality: true,
 *   autoFormat: true
 * });
 */
export async function uploadImage(
  filePath: string,
  options: ImageUploadOptions = {}
): Promise<CloudinaryImage> {
  if (!isConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  try {
    const uploadOptions: any = {
      public_id: options.publicId,
      folder: options.folder || 'restomod-central',
      tags: options.tags || [],
      context: options.context,
      overwrite: options.overwrite ?? false,
      resource_type: 'auto',
    };

    // Apply quality optimization
    if (options.autoQuality !== false) {
      uploadOptions.quality = 'auto:best';
    }

    // Apply format optimization
    if (options.autoFormat !== false) {
      uploadOptions.fetch_format = 'auto';
    }

    // Apply transformations
    if (options.transformation) {
      uploadOptions.transformation = buildTransformation(options.transformation);
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    console.log(`✅ Image uploaded: ${result.public_id} (${formatBytes(result.bytes)})`);

    return mapCloudinaryResponse(result);
  } catch (error) {
    console.error('❌ Failed to upload image:', error);
    throw error;
  }
}

/**
 * Upload image from buffer (useful for API uploads)
 *
 * @param buffer - Image buffer
 * @param options - Upload options
 * @returns Cloudinary image metadata
 *
 * @example
 * const image = await uploadImageFromBuffer(req.file.buffer, {
 *   folder: 'cars/uploads',
 *   tags: ['user-upload']
 * });
 */
export async function uploadImageFromBuffer(
  buffer: Buffer,
  options: ImageUploadOptions = {}
): Promise<CloudinaryImage> {
  if (!isConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      public_id: options.publicId,
      folder: options.folder || 'restomod-central',
      tags: options.tags || [],
      context: options.context,
      overwrite: options.overwrite ?? false,
      resource_type: 'auto',
    };

    if (options.autoQuality !== false) {
      uploadOptions.quality = 'auto:best';
    }

    if (options.autoFormat !== false) {
      uploadOptions.fetch_format = 'auto';
    }

    if (options.transformation) {
      uploadOptions.transformation = buildTransformation(options.transformation);
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Failed to upload image from buffer:', error);
          reject(error);
        } else if (result) {
          console.log(`✅ Image uploaded: ${result.public_id} (${formatBytes(result.bytes)})`);
          resolve(mapCloudinaryResponse(result));
        }
      }
    );

    const readable = Readable.from(buffer);
    readable.pipe(stream);
  });
}

/**
 * Upload image from URL
 *
 * @param url - Image URL
 * @param options - Upload options
 * @returns Cloudinary image metadata
 *
 * @example
 * const image = await uploadImageFromURL(
 *   'https://example.com/car.jpg',
 *   { folder: 'cars/imports' }
 * );
 */
export async function uploadImageFromURL(
  url: string,
  options: ImageUploadOptions = {}
): Promise<CloudinaryImage> {
  if (!isConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  try {
    const uploadOptions: any = {
      public_id: options.publicId,
      folder: options.folder || 'restomod-central',
      tags: options.tags || [],
      context: options.context,
      overwrite: options.overwrite ?? false,
    };

    if (options.autoQuality !== false) {
      uploadOptions.quality = 'auto:best';
    }

    if (options.autoFormat !== false) {
      uploadOptions.fetch_format = 'auto';
    }

    if (options.transformation) {
      uploadOptions.transformation = buildTransformation(options.transformation);
    }

    const result = await cloudinary.uploader.upload(url, uploadOptions);

    console.log(`✅ Image uploaded from URL: ${result.public_id}`);

    return mapCloudinaryResponse(result);
  } catch (error) {
    console.error('❌ Failed to upload image from URL:', error);
    throw error;
  }
}

// ============================================================================
// IMAGE TRANSFORMATIONS
// ============================================================================

/**
 * Generate optimized image URL with transformations
 *
 * @param publicId - Cloudinary public ID
 * @param transformation - Transformation options
 * @returns Optimized image URL
 *
 * @example
 * // Luxury car photo for desktop (1920x1080, high quality)
 * const url = getImageURL('cars/mustang/hero', {
 *   width: 1920,
 *   height: 1080,
 *   crop: 'fill',
 *   quality: 'auto:best',
 *   fetchFormat: 'auto',
 *   effect: 'sharpen:100'
 * });
 *
 * @example
 * // Mobile thumbnail (400x300, efficient)
 * const thumbUrl = getImageURL('cars/mustang/hero', {
 *   width: 400,
 *   height: 300,
 *   crop: 'thumb',
 *   gravity: 'auto',
 *   quality: 'auto:eco',
 *   dpr: 'auto'
 * });
 */
export function getImageURL(
  publicId: string,
  transformation?: TransformationOptions
): string {
  if (!isConfigured()) {
    return publicId; // Return public ID if Cloudinary not configured
  }

  const options: any = {
    secure: true,
  };

  if (transformation) {
    options.transformation = buildTransformation(transformation);
  }

  return cloudinary.url(publicId, options);
}

/**
 * Generate responsive image srcset
 *
 * @param publicId - Cloudinary public ID
 * @param widths - Array of widths for srcset
 * @param transformation - Base transformation options
 * @returns srcset string for <img> tag
 *
 * @example
 * const srcset = getResponsiveSrcSet('cars/mustang/hero', [400, 800, 1200, 1600]);
 * // <img src="..." srcset={srcset} sizes="(max-width: 768px) 100vw, 50vw" />
 */
export function getResponsiveSrcSet(
  publicId: string,
  widths: number[] = [400, 800, 1200, 1600, 2000],
  transformation: TransformationOptions = {}
): string {
  return widths
    .map((width) => {
      const url = getImageURL(publicId, {
        ...transformation,
        width,
        crop: transformation.crop || 'scale',
        quality: transformation.quality || 'auto',
        fetchFormat: transformation.fetchFormat || 'auto',
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Get automotive photography presets
 *
 * @param publicId - Cloudinary public ID
 * @param preset - Preset name
 * @returns Image URL with preset applied
 *
 * @example
 * const heroUrl = getPresetURL('cars/mustang/hero', 'hero-desktop');
 * const thumbUrl = getPresetURL('cars/mustang/hero', 'thumbnail');
 */
export function getPresetURL(
  publicId: string,
  preset: 'hero-desktop' | 'hero-mobile' | 'thumbnail' | 'gallery' | 'detail' | 'watermarked'
): string {
  const presets: Record<string, TransformationOptions> = {
    'hero-desktop': {
      width: 1920,
      height: 1080,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:best',
      fetchFormat: 'auto',
      effect: 'sharpen:100',
    },
    'hero-mobile': {
      width: 768,
      height: 432,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      fetchFormat: 'auto',
      dpr: 'auto',
    },
    'thumbnail': {
      width: 400,
      height: 300,
      crop: 'thumb',
      gravity: 'auto',
      quality: 'auto:eco',
      fetchFormat: 'auto',
    },
    'gallery': {
      width: 800,
      height: 600,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      fetchFormat: 'auto',
    },
    'detail': {
      width: 1200,
      height: 900,
      crop: 'fit',
      quality: 'auto:best',
      fetchFormat: 'auto',
      effect: 'sharpen:80',
    },
    'watermarked': {
      quality: 'auto:best',
      fetchFormat: 'auto',
      overlay: 'watermark', // Assumes you have watermark.png uploaded
    },
  };

  return getImageURL(publicId, presets[preset]);
}

// ============================================================================
// IMAGE MANAGEMENT
// ============================================================================

/**
 * Delete image from Cloudinary
 *
 * @param publicId - Cloudinary public ID
 * @returns Success status
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!isConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      console.log(`✅ Image deleted: ${publicId}`);
      return true;
    } else {
      console.warn(`⚠️  Failed to delete image: ${publicId} (${result.result})`);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to delete image:', error);
    throw error;
  }
}

/**
 * Search images by tags
 *
 * @param tags - Tags to search for
 * @param maxResults - Maximum results to return
 * @returns Array of matching images
 *
 * @example
 * const redCars = await searchImagesByTags(['red', 'convertible']);
 */
export async function searchImagesByTags(
  tags: string[],
  maxResults: number = 50
): Promise<CloudinaryImage[]> {
  if (!isConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  try {
    const expression = tags.map(tag => `tags:${tag}`).join(' AND ');

    const result = await cloudinary.search
      .expression(expression)
      .max_results(maxResults)
      .execute();

    return result.resources.map(mapCloudinaryResponse);
  } catch (error) {
    console.error('❌ Failed to search images:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if Cloudinary is configured
 */
function isConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Build transformation object for Cloudinary
 */
function buildTransformation(options: TransformationOptions): any {
  const transformation: any = {};

  if (options.width) transformation.width = options.width;
  if (options.height) transformation.height = options.height;
  if (options.crop) transformation.crop = options.crop;
  if (options.quality) transformation.quality = options.quality;
  if (options.fetchFormat) transformation.fetch_format = options.fetchFormat;
  if (options.gravity) transformation.gravity = options.gravity;
  if (options.effect) transformation.effect = options.effect;
  if (options.background) transformation.background = options.background;
  if (options.overlay) transformation.overlay = options.overlay;
  if (options.dpr) transformation.dpr = options.dpr;

  return transformation;
}

/**
 * Map Cloudinary API response to our interface
 */
function mapCloudinaryResponse(result: UploadApiResponse): CloudinaryImage {
  return {
    publicId: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    resourceType: result.resource_type,
    tags: result.tags || [],
    folder: result.folder,
    context: result.context?.custom,
  };
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Export configured cloudinary instance for advanced usage
export { cloudinary };
