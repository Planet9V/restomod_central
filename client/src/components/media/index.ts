/**
 * Media Components - Cloudinary Integration
 *
 * Professional automotive photography components powered by Cloudinary
 */

// Base Image Components
export {
  CloudinaryImage,
  SimpleCloudinaryImage,
  CloudinaryBackgroundImage,
  type CloudinaryImageProps,
} from './CloudinaryImage';

// Car-Specific Components
export {
  ResponsiveCarImage,
  CarListingImage,
  CarThumbnail,
  CarHeroImage,
  CarImageWithBadge,
  type ResponsiveCarImageProps,
} from './ResponsiveCarImage';

// Gallery Components
export {
  CarPhotoGallery,
  SimpleGalleryGrid,
  type CarPhotoGalleryProps,
  type GalleryPhoto,
} from './CarPhotoGallery';

// Upload Components
export {
  ImageUploader,
  SimpleImageUpload,
  type ImageUploaderProps,
  type UploadedImage,
} from './ImageUploader';
