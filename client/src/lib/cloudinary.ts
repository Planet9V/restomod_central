/**
 * Cloudinary Client Configuration
 *
 * Professional image delivery for automotive photography
 * Integrates with server-side cloudinaryService.ts
 */

import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Initialize Cloudinary instance with cloud name from environment
 * Cloud name must be set in .env as VITE_CLOUDINARY_CLOUD_NAME
 */
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
  },
  url: {
    secure: true, // Always use HTTPS
  },
});

/**
 * Check if Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  return !!(cloudName && cloudName !== 'demo');
}

/**
 * Get Cloudinary cloud name
 */
export function getCloudName(): string {
  return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
}

// ============================================================================
// IMAGE URL GENERATION
// ============================================================================

/**
 * Generate Cloudinary URL from public ID
 *
 * @param publicId - Cloudinary public ID
 * @param options - Optional transformation options
 * @returns Complete Cloudinary URL
 *
 * @example
 * const url = getCloudinaryUrl('cars/mustang/hero');
 * // https://res.cloudinary.com/demo/image/upload/cars/mustang/hero
 */
export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
  }
): string {
  if (!publicId) return '';

  const params = [];

  if (options?.width) params.push(`w_${options.width}`);
  if (options?.height) params.push(`h_${options.height}`);
  if (options?.quality) params.push(`q_${options.quality}`);
  if (options?.format) params.push(`f_${options.format}`);

  const transformation = params.length > 0 ? `${params.join(',')}` : '';
  const cloudName = getCloudName();

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}${transformation ? '/' : ''}${publicId}`;
}

/**
 * Generate responsive srcset for Cloudinary image
 *
 * @param publicId - Cloudinary public ID
 * @param widths - Array of widths for srcset
 * @param options - Base transformation options
 * @returns srcset string for <img> tag
 *
 * @example
 * const srcset = getCloudinarySrcSet('cars/mustang/hero', [400, 800, 1200]);
 * // https://...w_400/... 400w, https://...w_800/... 800w, https://...w_1200/... 1200w
 */
export function getCloudinarySrcSet(
  publicId: string,
  widths: number[] = [400, 800, 1200, 1600, 2000],
  options?: {
    quality?: string | number;
    format?: string;
    crop?: string;
  }
): string {
  if (!publicId) return '';

  return widths
    .map((width) => {
      const url = getCloudinaryUrl(publicId, {
        width,
        quality: options?.quality || 'auto',
        format: options?.format || 'auto',
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate blur-up placeholder (Low Quality Image Placeholder)
 *
 * @param publicId - Cloudinary public ID
 * @returns Tiny blurred image URL for progressive loading
 *
 * @example
 * const lqip = getBlurUpPlaceholder('cars/mustang/hero');
 * // 40px wide, heavily blurred, low quality
 */
export function getBlurUpPlaceholder(publicId: string): string {
  if (!publicId) return '';

  const cloudName = getCloudName();
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_40,h_30,c_fill,q_auto:low,e_blur:1000,f_auto/${publicId}`;
}

// ============================================================================
// UPLOAD UTILITIES
// ============================================================================

/**
 * Upload image to Cloudinary via API
 *
 * @param file - File to upload
 * @param options - Upload options
 * @returns Cloudinary public ID and secure URL
 *
 * @example
 * const { publicId, url } = await uploadToCloudinary(file, {
 *   folder: 'cars/mustang',
 *   tags: ['1967', 'fastback']
 * });
 */
export async function uploadToCloudinary(
  file: File,
  options?: {
    folder?: string;
    tags?: string[];
    publicId?: string;
  }
): Promise<{ publicId: string; url: string; width: number; height: number }> {
  const formData = new FormData();
  formData.append('file', file);

  if (options?.folder) formData.append('folder', options.folder);
  if (options?.tags) formData.append('tags', options.tags.join(','));
  if (options?.publicId) formData.append('publicId', options.publicId);

  const response = await fetch('/api/upload/cloudinary', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

/**
 * Validate image file before upload
 *
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPG, PNG, WebP, or HEIC.',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}

/**
 * Generate preview URL from File object
 *
 * @param file - File to preview
 * @returns Object URL for preview
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL to free memory
 *
 * @param url - URL to revoke
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

// ============================================================================
// EXPORT CLOUDINARY REACT COMPONENTS
// ============================================================================

export { AdvancedImage, responsive, placeholder };
