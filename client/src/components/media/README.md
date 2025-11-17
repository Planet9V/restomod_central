# Cloudinary Media Components

Professional automotive photography components for Restomod Central, powered by Cloudinary's global CDN and AI optimization.

## Features

- **Responsive Images**: Automatic srcset generation for all screen sizes
- **Progressive Loading**: Blur-up LQIP for smooth loading experience
- **Lazy Loading**: IntersectionObserver-based lazy loading
- **Format Optimization**: Automatic WebP/AVIF with JPEG fallback
- **Performance**: Width/height attributes to prevent CLS
- **Accessibility**: Proper alt text and ARIA labels
- **Drag-and-Drop Upload**: Professional file upload with validation
- **Luxury Gallery**: Lightbox viewer with keyboard navigation

## Installation

The Cloudinary React SDK is already installed. To use the components, ensure you have the Cloudinary cloud name configured:

```bash
# In your .env file
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## Components

### 1. CloudinaryImage

Base component for displaying optimized Cloudinary images.

```tsx
import { CloudinaryImage } from '@/components/media';

<CloudinaryImage
  publicId="cars/mustang/hero"
  preset="hero-desktop"
  alt="1967 Ford Mustang Fastback"
  sizes="100vw"
  priority={true} // Disable lazy load for above-the-fold images
/>
```

**Props:**
- `publicId` (required): Cloudinary public ID
- `preset`: Transformation preset ('hero-desktop', 'hero-mobile', 'thumbnail', 'gallery', 'detail', 'watermarked')
- `alt` (required): Alt text for accessibility
- `className`: CSS classes
- `sizes`: Sizes attribute for responsive images
- `lazy`: Enable lazy loading (default: true)
- `blurUp`: Enable blur-up placeholder (default: true)
- `responsive`: Enable responsive srcset (default: true)
- `aspectRatio`: Aspect ratio to prevent CLS (e.g., "16/9", "4/3")
- `priority`: Priority loading for above-the-fold images
- `onClick`: Click handler
- `objectFit`: CSS object-fit value

### 2. ResponsiveCarImage

Smart car image component with automatic preset selection.

```tsx
import { ResponsiveCarImage } from '@/components/media';

<ResponsiveCarImage
  publicId="cars/mustang/hero"
  car={{ year: 1967, make: 'Ford', model: 'Mustang' }}
  context="hero" // 'hero' | 'listing' | 'thumbnail' | 'detail' | 'gallery'
  priority={true}
/>
```

**Props:**
- `publicId` (required): Cloudinary public ID
- `car` (required): Car info for alt text ({ year, make, model })
- `context`: Display context (determines preset and sizes)
- `watermark`: Enable watermark overlay
- `className`: CSS classes
- `onClick`: Click handler
- `priority`: Priority loading
- `aspectRatio`: Custom aspect ratio

**Variants:**

```tsx
// Listing Grid Image
<CarListingImage
  publicId="cars/mustang/hero"
  car={car}
  onClick={() => navigate(`/cars/${car.id}`)}
/>

// Thumbnail
<CarThumbnail
  publicId="cars/mustang/thumb"
  car={car}
  size="md" // 'sm' | 'md' | 'lg'
/>

// Hero Image
<CarHeroImage
  publicId="cars/mustang/hero"
  car={car}
  onImageClick={() => openGallery()}
/>

// Image with Badge
<CarImageWithBadge
  publicId="cars/mustang/hero"
  car={car}
  badge="SOLD"
  badgeColor="red"
/>
```

### 3. CarPhotoGallery

Luxury photo gallery with lightbox viewer.

```tsx
import { CarPhotoGallery } from '@/components/media';

<CarPhotoGallery
  photos={[
    { publicId: 'cars/mustang/hero', caption: 'Front view' },
    { publicId: 'cars/mustang/interior', caption: 'Interior' },
    { publicId: 'cars/mustang/engine', caption: 'Engine bay' }
  ]}
  car={{ year: 1967, make: 'Ford', model: 'Mustang' }}
  showThumbnails={true}
  allowDownload={false}
/>
```

**Props:**
- `photos` (required): Array of { publicId, caption?, alt? }
- `car` (required): Car info ({ year, make, model })
- `initialIndex`: Initial photo index (default: 0)
- `showThumbnails`: Show thumbnail grid (default: true)
- `allowDownload`: Show download button (default: false)
- `className`: CSS classes

**Features:**
- Keyboard navigation (arrow keys, ESC)
- Swipe gestures on mobile
- Full-screen mode
- Image counter
- Thumbnail strip in lightbox

**Simple Grid Variant:**

```tsx
<SimpleGalleryGrid
  photos={photos}
  car={car}
  columns={3} // 2 | 3 | 4 | 6
  gap={4} // 2 | 4 | 6 | 8
  onClick={(index) => console.log('Clicked photo', index)}
/>
```

### 4. ImageUploader

Professional drag-and-drop image uploader.

```tsx
import { ImageUploader } from '@/components/media';

<ImageUploader
  onUploadComplete={(images) => {
    console.log('Uploaded:', images);
    // images: Array<{ publicId, url, width, height }>
  }}
  folder="cars/mustang"
  tags={['1967', 'mustang', 'fastback']}
  maxFiles={10}
  maxSizeMB={10}
  multiple={true}
/>
```

**Props:**
- `onUploadComplete`: Callback when images are uploaded
- `maxFiles`: Maximum number of files (default: 10)
- `maxSizeMB`: Maximum file size in MB (default: 10)
- `folder`: Cloudinary folder path
- `tags`: Tags to apply to images
- `multiple`: Allow multiple files (default: true)
- `showPreview`: Show preview thumbnails (default: true)
- `className`: CSS classes
- `accept`: Accepted file types

**Features:**
- Drag-and-drop support
- File validation (type, size)
- Image preview with thumbnails
- Progress indicator
- Error handling with retry
- Optimistic UI updates

**Simple Upload Variant:**

```tsx
<SimpleImageUpload
  onUpload={(result) => {
    console.log('Uploaded:', result.publicId, result.url);
  }}
  buttonText="Choose Car Photo"
/>
```

## Utilities

### Image Transformations

```tsx
import {
  getPresetImage,
  getPresetUrl,
  getResponsiveSrcSet,
  createCustomTransformation,
  PRESETS,
  COMMON_SIZES,
} from '@/lib/imageTransformations';

// Get CloudinaryImage instance with preset
const heroImage = getPresetImage('cars/mustang/hero', 'hero-desktop');

// Get URL string
const url = getPresetUrl('cars/mustang/hero', 'thumbnail');

// Generate responsive srcset
const srcset = getResponsiveSrcSet('cars/mustang/hero', 'gallery');

// Custom transformation
const customImage = createCustomTransformation('cars/mustang/hero', {
  width: 1000,
  height: 500,
  crop: 'fill',
  quality: 'auto:best',
  sharpen: true,
  dpr: 2,
});
```

### Cloudinary Utils

```tsx
import {
  cloudinary,
  getCloudinaryUrl,
  getCloudinarySrcSet,
  getBlurUpPlaceholder,
  uploadToCloudinary,
  validateImageFile,
  isCloudinaryConfigured,
} from '@/lib/cloudinary';

// Check if configured
if (isCloudinaryConfigured()) {
  // Generate URL
  const url = getCloudinaryUrl('cars/mustang/hero', {
    width: 800,
    height: 600,
    quality: 'auto:best',
    format: 'auto',
  });

  // Generate srcset
  const srcset = getCloudinarySrcSet('cars/mustang/hero', [400, 800, 1200]);

  // Get blur placeholder
  const lqip = getBlurUpPlaceholder('cars/mustang/hero');

  // Upload image
  const result = await uploadToCloudinary(file, {
    folder: 'cars/mustang',
    tags: ['1967', 'fastback'],
  });
}
```

## Transformation Presets

| Preset | Width | Height | Quality | Use Case |
|--------|-------|--------|---------|----------|
| `hero-desktop` | 1920 | 1080 | auto:best | Full HD hero images (16:9) |
| `hero-mobile` | 768 | 432 | auto:good | Mobile hero images (16:9) |
| `thumbnail` | 400 | 300 | auto:eco | Small thumbnails (4:3) |
| `gallery` | 800 | 600 | auto:good | Gallery images (4:3) |
| `detail` | 1200 | 900 | auto:best | High-quality detail images (4:3) |
| `watermarked` | - | - | auto:best | Original with watermark |
| `blur-up` | 40 | 30 | auto:low | Tiny placeholder for LQIP |

## Performance Best Practices

### 1. Use Priority for Above-the-Fold Images

```tsx
// Hero image (above the fold)
<CloudinaryImage
  publicId="cars/mustang/hero"
  preset="hero-desktop"
  alt="Hero"
  priority={true} // Disable lazy loading
/>

// Images below the fold
<CloudinaryImage
  publicId="cars/mustang/gallery-1"
  preset="gallery"
  alt="Gallery"
  lazy={true} // Enable lazy loading (default)
/>
```

### 2. Specify Aspect Ratio to Prevent CLS

```tsx
<CloudinaryImage
  publicId="cars/mustang/hero"
  preset="hero-desktop"
  alt="Hero"
  aspectRatio="16/9" // Prevents Cumulative Layout Shift
/>
```

### 3. Use Appropriate Presets

```tsx
// ❌ Don't use hero-desktop for thumbnails
<CloudinaryImage preset="hero-desktop" /> // 1920x1080, large file

// ✅ Use thumbnail preset for small images
<CloudinaryImage preset="thumbnail" /> // 400x300, optimized
```

### 4. Implement Blur-Up Loading

```tsx
<CloudinaryImage
  publicId="cars/mustang/hero"
  preset="gallery"
  alt="Gallery"
  blurUp={true} // Enable blur-up placeholder (default)
/>
```

### 5. Use Responsive Images

```tsx
<CloudinaryImage
  publicId="cars/mustang/hero"
  preset="gallery"
  alt="Gallery"
  sizes="(max-width: 768px) 100vw, 50vw"
  responsive={true} // Generate srcset (default)
/>
```

## Integration Examples

### Car Listing Page

```tsx
import { ResponsiveCarImage, CarPhotoGallery } from '@/components/media';

function CarDetailPage({ car }) {
  return (
    <div>
      {/* Hero Section */}
      <ResponsiveCarImage
        publicId={car.heroImage}
        car={car}
        context="hero"
        priority={true}
      />

      {/* Photo Gallery */}
      <CarPhotoGallery
        photos={car.photos}
        car={car}
        allowDownload={car.isPremium}
      />
    </div>
  );
}
```

### Car Listing Grid

```tsx
import { CarListingImage } from '@/components/media';

function CarListingGrid({ cars }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <CarListingImage
          key={car.id}
          publicId={car.imagePublicId}
          car={car}
          onClick={() => navigate(`/cars/${car.id}`)}
        />
      ))}
    </div>
  );
}
```

### Car Upload Form

```tsx
import { ImageUploader } from '@/components/media';
import { useState } from 'react';

function CarUploadForm({ carId }) {
  const [uploadedImages, setUploadedImages] = useState([]);

  return (
    <form>
      <ImageUploader
        onUploadComplete={(images) => {
          setUploadedImages(images);
          // Save to database
          saveCarPhotos(carId, images.map(img => img.publicId));
        }}
        folder={`cars/${carId}`}
        tags={[carId]}
        maxFiles={20}
      />

      {uploadedImages.length > 0 && (
        <p>Uploaded {uploadedImages.length} photos</p>
      )}
    </form>
  );
}
```

### Search Results

```tsx
import { CarThumbnail } from '@/components/media';

function SearchResults({ cars }) {
  return (
    <div className="space-y-4">
      {cars.map((car) => (
        <div key={car.id} className="flex gap-4">
          <CarThumbnail
            publicId={car.imagePublicId}
            car={car}
            size="lg"
            onClick={() => navigate(`/cars/${car.id}`)}
          />
          <div>
            <h3>{car.year} {car.make} {car.model}</h3>
            <p>${car.price.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Server-Side Integration

The client components work with the server-side Cloudinary service at `server/services/media/cloudinaryService.ts`.

### Upload API Endpoint

Create an upload endpoint at `server/routes/api/upload.ts`:

```typescript
import express from 'express';
import multer from 'multer';
import { uploadImageFromBuffer } from '@/services/media/cloudinaryService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/cloudinary', upload.single('file'), async (req, res) => {
  try {
    const { folder, tags, publicId } = req.body;

    const result = await uploadImageFromBuffer(req.file!.buffer, {
      folder: folder || 'restomod-central',
      tags: tags ? tags.split(',') : [],
      publicId: publicId || undefined,
      autoQuality: true,
      autoFormat: true,
    });

    res.json({
      publicId: result.publicId,
      url: result.secureUrl,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error });
  }
});

export default router;
```

## Troubleshooting

### Images Not Loading

1. Check Cloudinary configuration:
```tsx
import { isCloudinaryConfigured, getCloudName } from '@/lib/cloudinary';

console.log('Configured:', isCloudinaryConfigured());
console.log('Cloud name:', getCloudName());
```

2. Verify public ID exists in Cloudinary dashboard

3. Check browser console for errors

### Slow Image Loading

1. Use appropriate presets (don't use `hero-desktop` for thumbnails)
2. Enable lazy loading for below-the-fold images
3. Specify sizes attribute for responsive images
4. Use blur-up placeholders

### Upload Failures

1. Check file size (max 10MB by default)
2. Verify file type (JPG, PNG, WebP, HEIC)
3. Check server upload endpoint exists
4. Verify Cloudinary API credentials on server

## Additional Resources

- [Cloudinary React SDK Docs](https://cloudinary.com/documentation/react_integration)
- [Server-Side Service](../../../server/services/media/cloudinaryService.ts)
- [SPEC_07 - Enhanced Tools](../../../docs/SPEC_07_ENHANCED_TOOLS.md)
- [Cloudinary Dashboard](https://cloudinary.com/console)

## Performance Metrics

Target performance with Cloudinary optimization:

- **Page Load (LCP)**: < 2.5s
- **Image Load**: < 1s
- **File Size Reduction**: 70% (vs original)
- **Format**: WebP/AVIF with JPEG fallback
- **CDN Latency**: < 100ms globally

## License

Part of Restomod Central - MIT License
