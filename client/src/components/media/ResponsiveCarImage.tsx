/**
 * ResponsiveCarImage Component
 *
 * Auto-sizing car image component for listings with:
 * - Automatic preset selection based on context
 * - Watermark support for premium listings
 * - Optimized loading strategy
 * - Accessibility features
 */

import React from 'react';
import { CloudinaryImage } from './CloudinaryImage';
import { PresetType } from '@/lib/imageTransformations';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ResponsiveCarImageProps {
  /** Cloudinary public ID */
  publicId: string;

  /** Car information for alt text */
  car: {
    year: number;
    make: string;
    model: string;
  };

  /** Display context (determines preset) */
  context?: 'hero' | 'listing' | 'thumbnail' | 'detail' | 'gallery';

  /** Enable watermark for premium listings */
  watermark?: boolean;

  /** CSS class names */
  className?: string;

  /** onClick handler */
  onClick?: () => void;

  /** Priority loading for above-the-fold images */
  priority?: boolean;

  /** Custom aspect ratio */
  aspectRatio?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ResponsiveCarImage - Smart car image component with automatic optimization
 *
 * @example
 * // Hero image on car detail page
 * <ResponsiveCarImage
 *   publicId="cars/mustang/hero"
 *   car={{ year: 1967, make: 'Ford', model: 'Mustang' }}
 *   context="hero"
 *   priority={true}
 * />
 *
 * @example
 * // Thumbnail in search results
 * <ResponsiveCarImage
 *   publicId="cars/mustang/thumb"
 *   car={{ year: 1967, make: 'Ford', model: 'Mustang' }}
 *   context="thumbnail"
 * />
 *
 * @example
 * // Premium listing with watermark
 * <ResponsiveCarImage
 *   publicId="cars/mustang/hero"
 *   car={{ year: 1967, make: 'Ford', model: 'Mustang' }}
 *   context="listing"
 *   watermark={true}
 * />
 */
export function ResponsiveCarImage({
  publicId,
  car,
  context = 'listing',
  watermark = false,
  className,
  onClick,
  priority = false,
  aspectRatio,
}: ResponsiveCarImageProps) {
  // Generate descriptive alt text
  const altText = `${car.year} ${car.make} ${car.model}`;

  // Select preset based on context
  const preset: PresetType = (() => {
    if (watermark) return 'watermarked';

    switch (context) {
      case 'hero':
        return 'hero-desktop';
      case 'listing':
        return 'gallery';
      case 'thumbnail':
        return 'thumbnail';
      case 'detail':
        return 'detail';
      case 'gallery':
        return 'gallery';
      default:
        return 'gallery';
    }
  })();

  // Select sizes based on context
  const sizes = (() => {
    switch (context) {
      case 'hero':
        return '100vw';
      case 'listing':
        return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
      case 'thumbnail':
        return '(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw';
      case 'detail':
        return '(max-width: 768px) 100vw, 66vw';
      case 'gallery':
        return '(max-width: 768px) 100vw, 50vw';
      default:
        return '50vw';
    }
  })();

  // Determine aspect ratio based on context
  const defaultAspectRatio = (() => {
    switch (context) {
      case 'hero':
        return '16/9';
      case 'thumbnail':
        return '4/3';
      case 'gallery':
        return '4/3';
      case 'detail':
        return '4/3';
      default:
        return '4/3';
    }
  })();

  return (
    <CloudinaryImage
      publicId={publicId}
      preset={preset}
      alt={altText}
      className={cn(
        'rounded-lg overflow-hidden',
        context === 'hero' && 'rounded-none',
        context === 'thumbnail' && 'rounded-md',
        className
      )}
      sizes={sizes}
      priority={priority}
      aspectRatio={aspectRatio || defaultAspectRatio}
      onClick={onClick}
      lazy={!priority}
      blurUp={true}
      responsive={true}
    />
  );
}

// ============================================================================
// CAR LISTING GRID IMAGE
// ============================================================================

/**
 * CarListingImage - Optimized for car listing grids
 *
 * @example
 * <div className="grid grid-cols-3 gap-4">
 *   {cars.map(car => (
 *     <CarListingImage
 *       key={car.id}
 *       publicId={car.imagePublicId}
 *       car={car}
 *       onClick={() => navigate(`/cars/${car.id}`)}
 *     />
 *   ))}
 * </div>
 */
export function CarListingImage({
  publicId,
  car,
  onClick,
  className,
}: {
  publicId: string;
  car: { year: number; make: string; model: string };
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800',
        'transition-transform duration-300 hover:scale-105',
        'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <ResponsiveCarImage
        publicId={publicId}
        car={car}
        context="listing"
        priority={false}
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-semibold">
            {car.year} {car.make}
          </h3>
          <p className="text-sm text-gray-200">{car.model}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CAR THUMBNAIL COMPONENT
// ============================================================================

/**
 * CarThumbnail - Small thumbnail for compact listings
 *
 * @example
 * <CarThumbnail
 *   publicId="cars/mustang/thumb"
 *   car={car}
 *   size="sm"
 * />
 */
export function CarThumbnail({
  publicId,
  car,
  size = 'md',
  onClick,
  className,
}: {
  publicId: string;
  car: { year: number; make: string; model: string };
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div
      className={cn(
        'rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800',
        'transition-transform hover:scale-105',
        sizeClasses[size],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <ResponsiveCarImage
        publicId={publicId}
        car={car}
        context="thumbnail"
        aspectRatio="1/1"
      />
    </div>
  );
}

// ============================================================================
// CAR HERO IMAGE
// ============================================================================

/**
 * CarHeroImage - Large hero image for car detail pages
 *
 * @example
 * <CarHeroImage
 *   publicId="cars/mustang/hero"
 *   car={car}
 *   onImageClick={() => openGallery()}
 * />
 */
export function CarHeroImage({
  publicId,
  car,
  onImageClick,
  className,
}: {
  publicId: string;
  car: { year: number; make: string; model: string };
  onImageClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-black',
        'group cursor-pointer',
        className
      )}
      onClick={onImageClick}
    >
      <ResponsiveCarImage
        publicId={publicId}
        car={car}
        context="hero"
        priority={true}
        aspectRatio="16/9"
      />

      {/* Click to view gallery overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm px-6 py-3 rounded-full">
            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
              View Gallery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CAR IMAGE WITH BADGE
// ============================================================================

/**
 * CarImageWithBadge - Image with status badge (e.g., "SOLD", "NEW", "FEATURED")
 *
 * @example
 * <CarImageWithBadge
 *   publicId="cars/mustang/hero"
 *   car={car}
 *   badge="SOLD"
 *   badgeColor="red"
 * />
 */
export function CarImageWithBadge({
  publicId,
  car,
  badge,
  badgeColor = 'blue',
  context = 'listing',
  onClick,
  className,
}: {
  publicId: string;
  car: { year: number; make: string; model: string };
  badge: string;
  badgeColor?: 'blue' | 'red' | 'green' | 'yellow' | 'purple';
  context?: 'listing' | 'thumbnail';
  onClick?: () => void;
  className?: string;
}) {
  const badgeColors = {
    blue: 'bg-blue-600 text-white',
    red: 'bg-red-600 text-white',
    green: 'bg-green-600 text-white',
    yellow: 'bg-yellow-500 text-black',
    purple: 'bg-purple-600 text-white',
  };

  return (
    <div className={cn('relative', className)}>
      <ResponsiveCarImage
        publicId={publicId}
        car={car}
        context={context}
        onClick={onClick}
      />

      {/* Badge */}
      <div className="absolute top-3 right-3">
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg',
            badgeColors[badgeColor]
          )}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}
