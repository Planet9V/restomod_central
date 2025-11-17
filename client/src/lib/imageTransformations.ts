/**
 * Cloudinary Image Transformation Presets
 *
 * Predefined transformations for automotive photography
 * Matches server-side presets in server/services/media/cloudinaryService.ts
 */

import { cloudinary } from './cloudinary';
import {
  fill,
  scale,
  fit,
  thumbnail,
  Resize,
} from '@cloudinary/url-gen/actions/resize';
import { auto } from '@cloudinary/url-gen/qualifiers/quality';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { sharpen } from '@cloudinary/url-gen/actions/adjust';
import { focusOn } from '@cloudinary/url-gen/qualifiers/gravity';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { CloudinaryImage } from '@cloudinary/url-gen';

// ============================================================================
// TRANSFORMATION PRESETS
// ============================================================================

/**
 * Available preset types for automotive photography
 */
export type PresetType =
  | 'hero-desktop'
  | 'hero-mobile'
  | 'thumbnail'
  | 'gallery'
  | 'detail'
  | 'watermarked'
  | 'blur-up';

/**
 * Transformation preset configuration
 */
export interface TransformationPreset {
  width?: number;
  height?: number;
  resize?: Resize;
  quality?: string;
  format?: string;
  dpr?: number | 'auto';
  description: string;
}

/**
 * All available transformation presets
 */
export const PRESETS: Record<PresetType, TransformationPreset> = {
  'hero-desktop': {
    width: 1920,
    height: 1080,
    quality: 'auto:best',
    format: 'auto',
    description: 'Full HD hero image for desktop (16:9)',
  },
  'hero-mobile': {
    width: 768,
    height: 432,
    quality: 'auto:good',
    format: 'auto',
    dpr: 2,
    description: 'Optimized hero image for mobile (16:9)',
  },
  'thumbnail': {
    width: 400,
    height: 300,
    quality: 'auto:eco',
    format: 'auto',
    description: 'Small thumbnail for listings (4:3)',
  },
  'gallery': {
    width: 800,
    height: 600,
    quality: 'auto:good',
    format: 'auto',
    description: 'Gallery image for lightbox (4:3)',
  },
  'detail': {
    width: 1200,
    height: 900,
    quality: 'auto:best',
    format: 'auto',
    description: 'High-quality detail image (4:3)',
  },
  'watermarked': {
    quality: 'auto:best',
    format: 'auto',
    description: 'Original size with watermark overlay',
  },
  'blur-up': {
    width: 40,
    height: 30,
    quality: 'auto:low',
    format: 'auto',
    description: 'Tiny placeholder for progressive loading',
  },
};

// ============================================================================
// PRESET FUNCTIONS
// ============================================================================

/**
 * Get CloudinaryImage instance with preset applied
 *
 * @param publicId - Cloudinary public ID
 * @param preset - Preset name
 * @returns Configured CloudinaryImage instance
 *
 * @example
 * const heroImage = getPresetImage('cars/mustang/hero', 'hero-desktop');
 * <AdvancedImage cldImg={heroImage} />
 */
export function getPresetImage(
  publicId: string,
  preset: PresetType
): CloudinaryImage {
  const image = cloudinary.image(publicId);
  const config = PRESETS[preset];

  // Apply resize based on preset
  if (preset === 'hero-desktop' || preset === 'hero-mobile') {
    image.resize(
      fill()
        .width(config.width!)
        .height(config.height!)
        .gravity(autoGravity())
    );
  } else if (preset === 'thumbnail') {
    image.resize(
      thumbnail()
        .width(config.width!)
        .height(config.height!)
        .gravity(autoGravity())
    );
  } else if (preset === 'gallery' || preset === 'detail') {
    image.resize(
      fill()
        .width(config.width!)
        .height(config.height!)
        .gravity(autoGravity())
    );
  } else if (preset === 'blur-up') {
    image.resize(
      fill()
        .width(config.width!)
        .height(config.height!)
    );
  }

  // Apply quality
  if (config.quality) {
    image.quality(config.quality as any);
  }

  // Apply format
  if (config.format === 'auto') {
    image.format(autoFormat());
  }

  // Apply DPR for retina displays
  if (config.dpr) {
    if (config.dpr === 2) {
      image.delivery('dpr_2.0');
    }
  }

  // Apply sharpening for hero and detail images
  if (preset === 'hero-desktop' || preset === 'detail') {
    image.adjust(sharpen(100));
  }

  return image;
}

/**
 * Get URL string for a preset
 *
 * @param publicId - Cloudinary public ID
 * @param preset - Preset name
 * @returns Complete Cloudinary URL
 *
 * @example
 * const url = getPresetUrl('cars/mustang/hero', 'thumbnail');
 */
export function getPresetUrl(publicId: string, preset: PresetType): string {
  const image = getPresetImage(publicId, preset);
  return image.toURL();
}

/**
 * Generate responsive srcset for a preset
 *
 * @param publicId - Cloudinary public ID
 * @param preset - Base preset to use
 * @param multipliers - Array of width multipliers (default: [0.5, 1, 1.5, 2])
 * @returns srcset string
 *
 * @example
 * const srcset = getResponsiveSrcSet('cars/mustang/hero', 'gallery');
 * // 400w, 800w, 1200w, 1600w
 */
export function getResponsiveSrcSet(
  publicId: string,
  preset: PresetType,
  multipliers: number[] = [0.5, 1, 1.5, 2]
): string {
  const config = PRESETS[preset];
  const baseWidth = config.width || 800;

  return multipliers
    .map((multiplier) => {
      const width = Math.round(baseWidth * multiplier);
      const image = cloudinary.image(publicId);

      if (preset === 'thumbnail') {
        image.resize(thumbnail().width(width).gravity(autoGravity()));
      } else {
        image.resize(fill().width(width).gravity(autoGravity()));
      }

      if (config.quality) {
        image.quality(config.quality as any);
      }

      if (config.format === 'auto') {
        image.format(autoFormat());
      }

      return `${image.toURL()} ${width}w`;
    })
    .join(', ');
}

// ============================================================================
// CUSTOM TRANSFORMATIONS
// ============================================================================

/**
 * Create custom transformation
 *
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 * @returns Configured CloudinaryImage instance
 *
 * @example
 * const customImage = createCustomTransformation('cars/mustang/hero', {
 *   width: 1000,
 *   height: 500,
 *   crop: 'fill',
 *   quality: 'auto:best',
 *   sharpen: true
 * });
 */
export function createCustomTransformation(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumbnail';
    quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    sharpen?: boolean | number;
    dpr?: number | 'auto';
  }
): CloudinaryImage {
  const image = cloudinary.image(publicId);

  // Apply resize
  if (options.width || options.height) {
    const resizeAction = (() => {
      switch (options.crop) {
        case 'fill':
          return fill();
        case 'fit':
          return fit();
        case 'scale':
          return scale();
        case 'thumbnail':
          return thumbnail();
        default:
          return fill();
      }
    })();

    if (options.width) resizeAction.width(options.width);
    if (options.height) resizeAction.height(options.height);

    image.resize(resizeAction.gravity(autoGravity()));
  }

  // Apply quality
  if (options.quality) {
    image.quality(options.quality as any);
  }

  // Apply format
  if (options.format === 'auto') {
    image.format(autoFormat());
  } else if (options.format) {
    image.format(options.format);
  }

  // Apply sharpening
  if (options.sharpen) {
    const amount = typeof options.sharpen === 'number' ? options.sharpen : 100;
    image.adjust(sharpen(amount));
  }

  // Apply DPR
  if (options.dpr) {
    const dprValue = options.dpr === 'auto' ? 'auto' : options.dpr.toString();
    image.delivery(`dpr_${dprValue}`);
  }

  return image;
}

// ============================================================================
// RESPONSIVE IMAGE UTILITIES
// ============================================================================

/**
 * Generate sizes attribute for responsive images
 *
 * @param breakpoints - Object mapping breakpoints to sizes
 * @returns sizes attribute string
 *
 * @example
 * const sizes = generateSizesAttribute({
 *   '768px': '100vw',
 *   '1024px': '50vw',
 *   default: '33vw'
 * });
 * // "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
 */
export function generateSizesAttribute(breakpoints: {
  [key: string]: string;
  default: string;
}): string {
  const sizes: string[] = [];

  Object.entries(breakpoints).forEach(([breakpoint, size]) => {
    if (breakpoint !== 'default') {
      sizes.push(`(max-width: ${breakpoint}) ${size}`);
    }
  });

  sizes.push(breakpoints.default);

  return sizes.join(', ');
}

/**
 * Common sizes configurations for car images
 */
export const COMMON_SIZES = {
  hero: generateSizesAttribute({
    '768px': '100vw',
    default: '100vw',
  }),
  gallery: generateSizesAttribute({
    '768px': '100vw',
    '1024px': '50vw',
    default: '33vw',
  }),
  thumbnail: generateSizesAttribute({
    '640px': '50vw',
    '768px': '33vw',
    '1024px': '25vw',
    default: '20vw',
  }),
  detail: generateSizesAttribute({
    '768px': '100vw',
    '1024px': '66vw',
    default: '50vw',
  }),
};

// ============================================================================
// IMAGE METADATA
// ============================================================================

/**
 * Extract image dimensions from Cloudinary URL
 *
 * @param publicId - Cloudinary public ID
 * @returns Promise with width and height
 */
export async function getImageDimensions(
  publicId: string
): Promise<{ width: number; height: number } | null> {
  try {
    const image = cloudinary.image(publicId);
    const url = image.toURL();

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  } catch (error) {
    console.error('Failed to get image dimensions:', error);
    return null;
  }
}

/**
 * Get aspect ratio from dimensions
 *
 * @param width - Image width
 * @param height - Image height
 * @returns Aspect ratio string (e.g., "16:9")
 */
export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}
