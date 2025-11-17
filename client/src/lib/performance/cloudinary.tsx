/**
 * Cloudinary Image Optimization
 *
 * Utilities for optimizing images with Cloudinary.
 * Provides automatic format detection, responsive images,
 * lazy loading, and blur-up placeholders.
 *
 * Features:
 * - Automatic format selection (WebP, AVIF)
 * - Responsive image sizing
 * - Quality optimization
 * - Lazy loading with blur placeholders
 * - Width/height attributes for CLS prevention
 */

import React from 'react';
import { useLazyLoad } from './lazyLoad';

/**
 * Cloudinary configuration
 */
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Image transformation options
 */
export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit' | 'pad';
  gravity?: 'auto' | 'center' | 'face' | 'faces' | 'north' | 'south' | 'east' | 'west';
  quality?: number | 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  dpr?: number | 'auto';
  fetchFormat?: 'auto';
  effect?: string;
  aspectRatio?: string;
}

/**
 * Build Cloudinary URL
 *
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
    dpr = 'auto',
    fetchFormat = 'auto',
    effect,
    aspectRatio,
  } = options;

  const transformations: string[] = [];

  // Dimensions
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (aspectRatio) transformations.push(`ar_${aspectRatio}`);

  // Cropping and gravity
  if (crop) transformations.push(`c_${crop}`);
  if (gravity && crop === 'fill') transformations.push(`g_${gravity}`);

  // Quality and format
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  // DPR for retina displays
  if (dpr) transformations.push(`dpr_${dpr}`);

  // Fetch format
  if (fetchFormat) transformations.push(`f_${fetchFormat}`);

  // Effects
  if (effect) transformations.push(`e_${effect}`);

  const transformString = transformations.join(',');
  return `${CLOUDINARY_BASE_URL}/${transformString}/${publicId}`;
}

/**
 * Generate blur placeholder URL
 *
 * @param publicId - Cloudinary public ID
 * @returns Tiny blurred image URL
 */
export function getBlurPlaceholder(publicId: string): string {
  return buildCloudinaryUrl(publicId, {
    width: 20,
    quality: 1,
    effect: 'blur:1000',
    format: 'auto',
  });
}

/**
 * Generate responsive srcset
 *
 * @param publicId - Cloudinary public ID
 * @param sizes - Array of widths
 * @param options - Base transformation options
 * @returns srcset string
 */
export function generateSrcSet(
  publicId: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1536, 1920],
  options: CloudinaryTransformOptions = {}
): string {
  return sizes
    .map(width => {
      const url = buildCloudinaryUrl(publicId, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Optimized Cloudinary Image Component
 */
export interface CloudinaryImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  transformOptions?: CloudinaryTransformOptions;
  sizes?: string;
  responsiveSizes?: number[];
  lazy?: boolean;
  blurUp?: boolean;
}

export function CloudinaryImage({
  publicId,
  alt,
  width,
  height,
  transformOptions = {},
  sizes = '100vw',
  responsiveSizes,
  lazy = true,
  blurUp = true,
  className = '',
  ...props
}: CloudinaryImageProps) {
  const [ref, isVisible] = useLazyLoad<HTMLImageElement>();
  const [isLoaded, setIsLoaded] = React.useState(!lazy);

  // Build URLs
  const baseOptions: CloudinaryTransformOptions = {
    width,
    height,
    quality: 'auto',
    format: 'auto',
    dpr: 'auto',
    ...transformOptions,
  };

  const src = buildCloudinaryUrl(publicId, baseOptions);
  const srcSet = responsiveSizes ? generateSrcSet(publicId, responsiveSizes, baseOptions) : undefined;
  const placeholder = blurUp ? getBlurPlaceholder(publicId) : undefined;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <img
      ref={ref}
      src={lazy && !isVisible ? placeholder : src}
      srcSet={lazy && !isVisible ? undefined : srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      onLoad={handleLoad}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      {...props}
    />
  );
}

/**
 * Responsive image component with automatic sizing
 */
export interface ResponsiveImageProps extends CloudinaryImageProps {
  aspectRatio?: number; // e.g., 16/9
}

export function ResponsiveCloudinaryImage({
  aspectRatio = 16 / 9,
  ...props
}: ResponsiveImageProps) {
  return (
    <div className="relative w-full" style={{ paddingBottom: `${100 / aspectRatio}%` }}>
      <CloudinaryImage
        {...props}
        className={`absolute inset-0 w-full h-full object-cover ${props.className || ''}`}
        transformOptions={{
          crop: 'fill',
          gravity: 'auto',
          aspectRatio: aspectRatio.toString(),
          ...props.transformOptions,
        }}
      />
    </div>
  );
}

/**
 * Background image component
 */
export interface CloudinaryBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  publicId: string;
  transformOptions?: CloudinaryTransformOptions;
  overlay?: React.ReactNode;
}

export function CloudinaryBackground({
  publicId,
  transformOptions = {},
  overlay,
  children,
  className = '',
  style = {},
  ...props
}: CloudinaryBackgroundProps) {
  const [ref, isVisible] = useLazyLoad<HTMLDivElement>();

  const imageUrl = buildCloudinaryUrl(publicId, {
    quality: 'auto',
    format: 'auto',
    ...transformOptions,
  });

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        ...style,
        backgroundImage: isVisible ? `url(${imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      {...props}
    >
      {overlay && <div className="absolute inset-0">{overlay}</div>}
      {children}
    </div>
  );
}

/**
 * Get optimized image dimensions
 *
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Optimized dimensions
 */
export function getOptimizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }

  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
}

/**
 * Preload critical images
 *
 * @param publicIds - Array of Cloudinary public IDs
 * @param options - Transformation options
 */
export function preloadCloudinaryImages(
  publicIds: string[],
  options: CloudinaryTransformOptions = {}
): void {
  publicIds.forEach(publicId => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = buildCloudinaryUrl(publicId, {
      quality: 'auto',
      format: 'auto',
      ...options,
    });
    document.head.appendChild(link);
  });
}

/**
 * Generate video poster from Cloudinary video
 *
 * @param publicId - Cloudinary video public ID
 * @param options - Transformation options
 * @returns Poster image URL
 */
export function getVideoPoster(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/so_0,${Object.entries(options)
    .map(([key, value]) => `${key}_${value}`)
    .join(',')}/f_jpg/${publicId}.jpg`;
}

export default CloudinaryImage;
