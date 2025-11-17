/**
 * CarPhotoGallery Component
 *
 * Luxury automotive photo gallery with:
 * - Lightbox viewer with keyboard navigation
 * - Thumbnail grid
 * - Swipe gestures on mobile
 * - Full-screen mode
 * - Image counter
 * - Cloudinary optimization
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CloudinaryImage } from './CloudinaryImage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, Maximize2, Download } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface GalleryPhoto {
  /** Cloudinary public ID */
  publicId: string;

  /** Optional caption */
  caption?: string;

  /** Optional alt text (falls back to caption) */
  alt?: string;
}

export interface CarPhotoGalleryProps {
  /** Array of photos to display */
  photos: GalleryPhoto[];

  /** Car information for alt text */
  car: {
    year: number;
    make: string;
    model: string;
  };

  /** Initial photo index (default: 0) */
  initialIndex?: number;

  /** Show thumbnails (default: true) */
  showThumbnails?: boolean;

  /** Show download button (default: false) */
  allowDownload?: boolean;

  /** CSS class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CarPhotoGallery - Luxury automotive photo gallery
 *
 * @example
 * <CarPhotoGallery
 *   photos={[
 *     { publicId: 'cars/mustang/hero', caption: 'Front view' },
 *     { publicId: 'cars/mustang/interior', caption: 'Interior' },
 *     { publicId: 'cars/mustang/engine', caption: 'Engine bay' }
 *   ]}
 *   car={{ year: 1967, make: 'Ford', model: 'Mustang' }}
 *   allowDownload={true}
 * />
 */
export function CarPhotoGallery({
  photos,
  car,
  initialIndex = 0,
  showThumbnails = true,
  allowDownload = false,
  className,
}: CarPhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          closeLightbox();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, selectedIndex]);

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const currentPhoto = photos[selectedIndex];
  const carName = `${car.year} ${car.make} ${car.model}`;

  if (photos.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg', className)}>
        <p className="text-gray-500 dark:text-gray-400">No photos available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div className="relative">
        <CloudinaryImage
          publicId={currentPhoto.publicId}
          preset="gallery"
          alt={currentPhoto.alt || currentPhoto.caption || carName}
          className="w-full cursor-pointer rounded-lg"
          aspectRatio="16/9"
          onClick={() => openLightbox(selectedIndex)}
          priority={selectedIndex === 0}
        />

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {selectedIndex + 1} / {photos.length}
        </div>

        {/* Navigation Arrows (desktop) */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full hidden md:flex"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full hidden md:flex"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Caption */}
        {currentPhoto.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-white text-sm">{currentPhoto.caption}</p>
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {showThumbnails && photos.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.publicId}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative aspect-video rounded-md overflow-hidden transition-all',
                'hover:ring-2 hover:ring-primary',
                selectedIndex === index
                  ? 'ring-2 ring-primary'
                  : 'ring-1 ring-gray-300 dark:ring-gray-700'
              )}
            >
              <CloudinaryImage
                publicId={photo.publicId}
                preset="thumbnail"
                alt={photo.alt || photo.caption || `${carName} - Photo ${index + 1}`}
                className="w-full h-full"
                lazy={index > 3}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-black border-none">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white">
              <h3 className="font-semibold">{carName}</h3>
              {currentPhoto.caption && (
                <p className="text-sm text-gray-300">{currentPhoto.caption}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {allowDownload && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    // Download functionality
                    window.open(
                      `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/fl_attachment/${currentPhoto.publicId}`,
                      '_blank'
                    );
                  }}
                >
                  <Download className="h-5 w-5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    document.documentElement.requestFullscreen();
                  }
                }}
              >
                <Maximize2 className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={closeLightbox}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Image */}
          <div className="flex items-center justify-center h-full p-4">
            <CloudinaryImage
              publicId={currentPhoto.publicId}
              preset="detail"
              alt={currentPhoto.alt || currentPhoto.caption || carName}
              className="max-h-full max-w-full"
              priority={true}
              objectFit="contain"
            />
          </div>

          {/* Navigation */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full h-12 w-12"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full h-12 w-12"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            {selectedIndex + 1} / {photos.length}
          </div>

          {/* Thumbnail Strip */}
          {showThumbnails && photos.length > 1 && (
            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto scrollbar-hide">
              {photos.map((photo, index) => (
                <button
                  key={photo.publicId}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all',
                    selectedIndex === index
                      ? 'ring-2 ring-white scale-110'
                      : 'ring-1 ring-gray-600 opacity-60 hover:opacity-100'
                  )}
                >
                  <CloudinaryImage
                    publicId={photo.publicId}
                    preset="thumbnail"
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// SIMPLE GALLERY GRID
// ============================================================================

/**
 * SimpleGalleryGrid - Basic photo grid without lightbox
 *
 * @example
 * <SimpleGalleryGrid
 *   photos={photos}
 *   car={car}
 *   columns={3}
 * />
 */
export function SimpleGalleryGrid({
  photos,
  car,
  columns = 3,
  gap = 4,
  onClick,
}: {
  photos: GalleryPhoto[];
  car: { year: number; make: string; model: string };
  columns?: 2 | 3 | 4 | 6;
  gap?: 2 | 4 | 6 | 8;
  onClick?: (index: number) => void;
}) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClass = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  const carName = `${car.year} ${car.make} ${car.model}`;

  return (
    <div className={cn('grid', gridCols[columns], gapClass[gap])}>
      {photos.map((photo, index) => (
        <div
          key={photo.publicId}
          className="group relative cursor-pointer overflow-hidden rounded-lg"
          onClick={() => onClick?.(index)}
        >
          <CloudinaryImage
            publicId={photo.publicId}
            preset="gallery"
            alt={photo.alt || photo.caption || `${carName} - Photo ${index + 1}`}
            className="transition-transform duration-300 group-hover:scale-105"
            aspectRatio="4/3"
          />

          {photo.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm">{photo.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
