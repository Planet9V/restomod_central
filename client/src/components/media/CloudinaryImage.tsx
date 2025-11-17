/**
 * CloudinaryImage Component
 *
 * Optimized image component with:
 * - Responsive srcset for all screen sizes
 * - Blur-up progressive loading (LQIP)
 * - Lazy loading with IntersectionObserver
 * - WebP/AVIF with JPEG fallback
 * - Automatic width/height to prevent CLS
 */

import React, { useState, useEffect } from 'react';
import { AdvancedImage, lazyload, responsive, placeholder } from '@cloudinary/react';
import { cloudinary } from '@/lib/cloudinary';
import { getPresetImage, PresetType, COMMON_SIZES } from '@/lib/imageTransformations';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CloudinaryImageProps {
  /** Cloudinary public ID */
  publicId: string;

  /** Preset transformation to apply */
  preset?: PresetType;

  /** Alt text for accessibility */
  alt: string;

  /** CSS class names */
  className?: string;

  /** Sizes attribute for responsive images */
  sizes?: string;

  /** Enable lazy loading (default: true) */
  lazy?: boolean;

  /** Enable blur-up placeholder (default: true) */
  blurUp?: boolean;

  /** Enable responsive srcset (default: true) */
  responsive?: boolean;

  /** Aspect ratio (prevents CLS) */
  aspectRatio?: string;

  /** Priority loading (disable lazy load for above-the-fold images) */
  priority?: boolean;

  /** onClick handler */
  onClick?: () => void;

  /** Custom width */
  width?: number;

  /** Custom height */
  height?: number;

  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CloudinaryImage - Optimized image component for automotive photography
 *
 * @example
 * // Hero image with blur-up
 * <CloudinaryImage
 *   publicId="cars/mustang/hero"
 *   preset="hero-desktop"
 *   alt="1967 Ford Mustang Fastback"
 *   sizes="100vw"
 * />
 *
 * @example
 * // Lazy-loaded thumbnail
 * <CloudinaryImage
 *   publicId="cars/mustang/thumb"
 *   preset="thumbnail"
 *   alt="Mustang thumbnail"
 *   lazy={true}
 * />
 */
export function CloudinaryImage({
  publicId,
  preset = 'gallery',
  alt,
  className,
  sizes,
  lazy = true,
  blurUp = true,
  responsive: enableResponsive = true,
  aspectRatio,
  priority = false,
  onClick,
  width,
  height,
  objectFit = 'cover',
}: CloudinaryImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get Cloudinary image with preset
  const cldImg = getPresetImage(publicId, preset);

  // Apply custom dimensions if provided
  if (width || height) {
    cldImg.resize(
      cldImg
        .toURL()
        .includes('c_fill')
        ? 'fill'
        : 'scale'
    );
    if (width) (cldImg as any).width = width;
    if (height) (cldImg as any).height = height;
  }

  // Determine sizes attribute
  const sizesAttr = sizes || COMMON_SIZES[preset as keyof typeof COMMON_SIZES] || COMMON_SIZES.gallery;

  // Build plugins array
  const plugins = [];

  // Add lazy loading if enabled and not priority
  if (lazy && !priority) {
    plugins.push(lazyload({ rootMargin: '10px' }));
  }

  // Add responsive plugin if enabled
  if (enableResponsive) {
    plugins.push(responsive({ steps: [400, 800, 1200, 1600, 2000] }));
  }

  // Add blur-up placeholder if enabled
  if (blurUp && !imageLoaded) {
    plugins.push(placeholder({ mode: 'blur' }));
  }

  // Fallback for missing or errored images
  if (imageError || !publicId) {
    return (
      <div
        className={cn(
          'bg-gray-200 dark:bg-gray-800 flex items-center justify-center',
          className
        )}
        style={{ aspectRatio: aspectRatio || '4/3' }}
      >
        <span className="text-gray-400 dark:text-gray-600 text-sm">
          Image not available
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio: aspectRatio }}
      onClick={onClick}
    >
      <AdvancedImage
        cldImg={cldImg}
        alt={alt}
        plugins={plugins}
        className={cn(
          'w-full h-full transition-opacity duration-500',
          imageLoaded ? 'opacity-100' : 'opacity-0',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          onClick && 'cursor-pointer'
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading={priority ? 'eager' : 'lazy'}
      />

      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ============================================================================
// SIMPLE IMAGE COMPONENT
// ============================================================================

/**
 * SimpleCloudinaryImage - Basic <img> tag with Cloudinary URL
 * Use this when you don't need all the advanced features
 *
 * @example
 * <SimpleCloudinaryImage
 *   publicId="cars/mustang/hero"
 *   preset="thumbnail"
 *   alt="Mustang"
 * />
 */
export function SimpleCloudinaryImage({
  publicId,
  preset = 'gallery',
  alt,
  className,
  onClick,
  objectFit = 'cover',
}: Omit<CloudinaryImageProps, 'sizes' | 'lazy' | 'blurUp' | 'responsive' | 'aspectRatio' | 'priority'>) {
  const cldImg = getPresetImage(publicId, preset);
  const url = cldImg.toURL();

  if (!publicId) {
    return (
      <div className={cn('bg-gray-200 dark:bg-gray-800 aspect-[4/3]', className)}>
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={cn(
        'w-full h-full',
        objectFit === 'cover' && 'object-cover',
        objectFit === 'contain' && 'object-contain',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      loading="lazy"
    />
  );
}

// ============================================================================
// BACKGROUND IMAGE COMPONENT
// ============================================================================

/**
 * CloudinaryBackgroundImage - Component with Cloudinary image as background
 *
 * @example
 * <CloudinaryBackgroundImage
 *   publicId="cars/mustang/hero"
 *   preset="hero-desktop"
 *   className="h-96"
 * >
 *   <h1>Hero Content</h1>
 * </CloudinaryBackgroundImage>
 */
export function CloudinaryBackgroundImage({
  publicId,
  preset = 'hero-desktop',
  children,
  className,
  overlay = true,
}: {
  publicId: string;
  preset?: PresetType;
  children?: React.ReactNode;
  className?: string;
  overlay?: boolean;
}) {
  const cldImg = getPresetImage(publicId, preset);
  const url = cldImg.toURL();

  return (
    <div
      className={cn('relative bg-cover bg-center bg-no-repeat', className)}
      style={{ backgroundImage: `url('${url}')` }}
    >
      {overlay && (
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
