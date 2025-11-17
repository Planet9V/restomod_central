/**
 * Cloudinary Components - Usage Examples
 *
 * Complete examples showing how to use Cloudinary components in different scenarios
 */

import React, { useState } from 'react';
import {
  CloudinaryImage,
  ResponsiveCarImage,
  CarPhotoGallery,
  CarListingImage,
  CarThumbnail,
  CarHeroImage,
  CarImageWithBadge,
  ImageUploader,
  SimpleImageUpload,
  SimpleGalleryGrid,
} from '@/components/media';

// ============================================================================
// EXAMPLE 1: Car Detail Page
// ============================================================================

export function CarDetailPageExample() {
  const car = {
    id: 'mustang-67',
    year: 1967,
    make: 'Ford',
    model: 'Mustang Fastback',
    price: 125000,
    status: 'available',
  };

  const photos = [
    { publicId: 'cars/mustang/hero', caption: 'Front three-quarter view' },
    { publicId: 'cars/mustang/interior', caption: 'Original interior' },
    { publicId: 'cars/mustang/engine', caption: '289 V8 engine bay' },
    { publicId: 'cars/mustang/rear', caption: 'Rear view with fastback' },
    { publicId: 'cars/mustang/dashboard', caption: 'Dashboard and gauges' },
    { publicId: 'cars/mustang/wheels', caption: 'American Racing wheels' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Image */}
      <CarHeroImage
        publicId="cars/mustang/hero"
        car={car}
        onImageClick={() => console.log('Open gallery')}
        className="mb-8"
      />

      {/* Car Info */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            {car.year} {car.make} {car.model}
          </h1>
          <p className="text-3xl text-primary font-bold">
            ${car.price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Photo Gallery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Photo Gallery</h2>
        <CarPhotoGallery
          photos={photos}
          car={car}
          showThumbnails={true}
          allowDownload={false}
        />
      </section>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Car Listing Grid
// ============================================================================

export function CarListingGridExample() {
  const cars = [
    {
      id: '1',
      year: 1967,
      make: 'Ford',
      model: 'Mustang',
      price: 125000,
      imagePublicId: 'cars/mustang/hero',
      status: 'available',
    },
    {
      id: '2',
      year: 1969,
      make: 'Chevrolet',
      model: 'Camaro',
      price: 89000,
      imagePublicId: 'cars/camaro/hero',
      status: 'sold',
    },
    {
      id: '3',
      year: 1970,
      make: 'Dodge',
      model: 'Challenger',
      price: 145000,
      imagePublicId: 'cars/challenger/hero',
      status: 'featured',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Classic Cars For Sale</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => {
          // Different badge based on status
          if (car.status === 'sold') {
            return (
              <CarImageWithBadge
                key={car.id}
                publicId={car.imagePublicId}
                car={car}
                badge="SOLD"
                badgeColor="red"
                context="listing"
              />
            );
          }

          if (car.status === 'featured') {
            return (
              <CarImageWithBadge
                key={car.id}
                publicId={car.imagePublicId}
                car={car}
                badge="FEATURED"
                badgeColor="purple"
                context="listing"
              />
            );
          }

          return (
            <CarListingImage
              key={car.id}
              publicId={car.imagePublicId}
              car={car}
              onClick={() => console.log('Navigate to', car.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Search Results with Thumbnails
// ============================================================================

export function SearchResultsExample() {
  const searchResults = [
    {
      id: '1',
      year: 1967,
      make: 'Ford',
      model: 'Mustang Fastback',
      price: 125000,
      mileage: 45000,
      location: 'Los Angeles, CA',
      imagePublicId: 'cars/mustang/hero',
    },
    {
      id: '2',
      year: 1969,
      make: 'Chevrolet',
      model: 'Camaro SS',
      price: 89000,
      mileage: 52000,
      location: 'Phoenix, AZ',
      imagePublicId: 'cars/camaro/hero',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {searchResults.length} Cars Found
      </h1>

      <div className="space-y-4">
        {searchResults.map((car) => (
          <div
            key={car.id}
            className="flex gap-4 p-4 border rounded-lg hover:shadow-lg transition-shadow"
          >
            {/* Thumbnail */}
            <CarThumbnail
              publicId={car.imagePublicId}
              car={car}
              size="lg"
              onClick={() => console.log('View car', car.id)}
            />

            {/* Details */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {car.year} {car.make} {car.model}
              </h3>
              <p className="text-2xl text-primary font-bold mt-1">
                ${car.price.toLocaleString()}
              </p>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p>{car.mileage.toLocaleString()} miles</p>
                <p>{car.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Image Upload Form
// ============================================================================

export function ImageUploadFormExample() {
  const [carId] = useState('mustang-67');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleUploadComplete = (images: any[]) => {
    const publicIds = images
      .filter((img) => img.status === 'success')
      .map((img) => img.publicId);

    setUploadedPhotos((prev) => [...prev, ...publicIds]);

    // Save to database
    console.log('Saving to database:', {
      carId,
      publicIds,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Car Photos</h1>

      <ImageUploader
        onUploadComplete={handleUploadComplete}
        folder={`cars/${carId}`}
        tags={[carId, 'car-photos']}
        maxFiles={20}
        maxSizeMB={10}
        multiple={true}
        showPreview={true}
      />

      {uploadedPhotos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Uploaded Photos ({uploadedPhotos.length})
          </h2>

          <SimpleGalleryGrid
            photos={uploadedPhotos.map((publicId) => ({ publicId }))}
            car={{ year: 1967, make: 'Ford', model: 'Mustang' }}
            columns={4}
            gap={4}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Hero Section with Background Image
// ============================================================================

export function HeroSectionExample() {
  return (
    <div className="relative h-screen">
      {/* Background Image */}
      <CloudinaryImage
        publicId="cars/mustang/hero"
        preset="hero-desktop"
        alt="Classic Cars"
        className="absolute inset-0 w-full h-full object-cover"
        priority={true}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full text-white text-center">
        <div>
          <h1 className="text-6xl font-bold mb-4">
            Restomod Central
          </h1>
          <p className="text-2xl mb-8">
            The Premier Marketplace for Classic Automotive Excellence
          </p>
          <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg text-lg font-semibold">
            Browse Collection
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Responsive Image Showcase
// ============================================================================

export function ResponsiveImageShowcaseExample() {
  const car = {
    year: 1967,
    make: 'Ford',
    model: 'Mustang',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Responsive Image Examples</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Hero Context */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Hero Image</h2>
          <ResponsiveCarImage
            publicId="cars/mustang/hero"
            car={car}
            context="hero"
            priority={true}
          />
        </div>

        {/* Listing Context */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Listing Image</h2>
          <ResponsiveCarImage
            publicId="cars/mustang/hero"
            car={car}
            context="listing"
          />
        </div>

        {/* Gallery Context */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Gallery Image</h2>
          <ResponsiveCarImage
            publicId="cars/mustang/hero"
            car={car}
            context="gallery"
          />
        </div>

        {/* Thumbnail Context */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Thumbnail</h2>
          <ResponsiveCarImage
            publicId="cars/mustang/hero"
            car={car}
            context="thumbnail"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Simple Upload Button
// ============================================================================

export function SimpleUploadExample() {
  const [uploadedImage, setUploadedImage] = useState<{
    publicId: string;
    url: string;
  } | null>(null);

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile Picture Upload</h1>

      {uploadedImage ? (
        <div className="space-y-4">
          <CloudinaryImage
            publicId={uploadedImage.publicId}
            preset="gallery"
            alt="Uploaded image"
            className="rounded-lg"
          />
          <button
            onClick={() => setUploadedImage(null)}
            className="w-full py-2 border rounded-lg"
          >
            Upload Different Image
          </button>
        </div>
      ) : (
        <SimpleImageUpload
          onUpload={(result) => setUploadedImage(result)}
          buttonText="Upload Profile Picture"
        />
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Premium Listing with Watermark
// ============================================================================

export function PremiumListingExample() {
  const car = {
    id: 'premium-mustang',
    year: 1967,
    make: 'Ford',
    model: 'Mustang Fastback',
    price: 125000,
    isPremium: true,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="border-4 border-gold rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-gold text-white px-3 py-1 rounded-full text-sm font-bold">
            PREMIUM LISTING
          </span>
        </div>

        {/* Watermarked Image */}
        <ResponsiveCarImage
          publicId="cars/mustang/hero"
          car={car}
          context="hero"
          watermark={true}
          priority={true}
        />

        <div className="mt-6">
          <h2 className="text-2xl font-bold">
            {car.year} {car.make} {car.model}
          </h2>
          <p className="text-3xl text-gold font-bold mt-2">
            ${car.price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-4">
            Premium listings include watermark protection and priority placement
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const examples = {
  CarDetailPage: CarDetailPageExample,
  CarListingGrid: CarListingGridExample,
  SearchResults: SearchResultsExample,
  ImageUploadForm: ImageUploadFormExample,
  HeroSection: HeroSectionExample,
  ResponsiveImages: ResponsiveImageShowcaseExample,
  SimpleUpload: SimpleUploadExample,
  PremiumListing: PremiumListingExample,
};

export default examples;
