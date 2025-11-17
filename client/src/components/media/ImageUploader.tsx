/**
 * ImageUploader Component
 *
 * Professional image upload component with:
 * - Drag-and-drop support
 * - File validation (type, size)
 * - Image preview with thumbnails
 * - Progress indicator
 * - Error handling with retry
 * - Multiple file upload
 * - Optimistic UI updates
 */

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  uploadToCloudinary,
  validateImageFile,
  createPreviewUrl,
  revokePreviewUrl,
} from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadedImage {
  /** File object */
  file: File;

  /** Preview URL (object URL) */
  previewUrl: string;

  /** Upload status */
  status: 'pending' | 'uploading' | 'success' | 'error';

  /** Upload progress (0-100) */
  progress: number;

  /** Cloudinary public ID (after successful upload) */
  publicId?: string;

  /** Cloudinary URL (after successful upload) */
  url?: string;

  /** Error message (if upload failed) */
  error?: string;

  /** Image dimensions */
  width?: number;
  height?: number;
}

export interface ImageUploaderProps {
  /** Callback when images are successfully uploaded */
  onUploadComplete?: (images: UploadedImage[]) => void;

  /** Maximum number of files (default: 10) */
  maxFiles?: number;

  /** Maximum file size in MB (default: 10) */
  maxSizeMB?: number;

  /** Cloudinary folder path */
  folder?: string;

  /** Tags to apply to uploaded images */
  tags?: string[];

  /** Allow multiple files (default: true) */
  multiple?: boolean;

  /** Show preview thumbnails (default: true) */
  showPreview?: boolean;

  /** CSS class names */
  className?: string;

  /** Accepted file types */
  accept?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ImageUploader - Professional drag-and-drop image uploader
 *
 * @example
 * <ImageUploader
 *   onUploadComplete={(images) => {
 *     console.log('Uploaded:', images);
 *   }}
 *   folder="cars/mustang"
 *   tags={['1967', 'mustang']}
 *   maxFiles={5}
 * />
 */
export function ImageUploader({
  onUploadComplete,
  maxFiles = 10,
  maxSizeMB = 10,
  folder,
  tags,
  multiple = true,
  showPreview = true,
  className,
  accept = 'image/jpeg,image/jpg,image/png,image/webp,image/heic',
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxFiles - images.length;

      if (fileArray.length > remainingSlots) {
        alert(`You can only upload ${remainingSlots} more file(s)`);
        return;
      }

      const newImages: UploadedImage[] = [];

      for (const file of fileArray) {
        // Validate file
        const validation = validateImageFile(file);

        if (!validation.valid) {
          alert(validation.error);
          continue;
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          alert(`File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB.`);
          continue;
        }

        newImages.push({
          file,
          previewUrl: createPreviewUrl(file),
          status: 'pending',
          progress: 0,
        });
      }

      setImages((prev) => [...prev, ...newImages]);

      // Auto-upload
      setTimeout(() => {
        newImages.forEach((image) => uploadImage(image));
      }, 100);
    },
    [images.length, maxFiles, maxSizeMB]
  );

  // Upload single image
  const uploadImage = async (image: UploadedImage) => {
    // Update status to uploading
    setImages((prev) =>
      prev.map((img) =>
        img.previewUrl === image.previewUrl
          ? { ...img, status: 'uploading', progress: 0 }
          : img
      )
    );

    try {
      // Simulate progress (Cloudinary doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setImages((prev) =>
          prev.map((img) =>
            img.previewUrl === image.previewUrl && img.progress < 90
              ? { ...img, progress: img.progress + 10 }
              : img
          )
        );
      }, 200);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(image.file, {
        folder,
        tags,
      });

      clearInterval(progressInterval);

      // Update with success
      setImages((prev) => {
        const updated = prev.map((img) =>
          img.previewUrl === image.previewUrl
            ? {
                ...img,
                status: 'success' as const,
                progress: 100,
                publicId: result.publicId,
                url: result.url,
                width: result.width,
                height: result.height,
              }
            : img
        );

        // Call onUploadComplete with successful uploads
        const successfulUploads = updated.filter((img) => img.status === 'success');
        if (successfulUploads.length > 0) {
          onUploadComplete?.(successfulUploads);
        }

        return updated;
      });
    } catch (error) {
      // Update with error
      setImages((prev) =>
        prev.map((img) =>
          img.previewUrl === image.previewUrl
            ? {
                ...img,
                status: 'error' as const,
                progress: 0,
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : img
        )
      );
    }
  };

  // Retry failed upload
  const retryUpload = (image: UploadedImage) => {
    uploadImage(image);
  };

  // Remove image
  const removeImage = (previewUrl: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.previewUrl === previewUrl);
      if (image) {
        revokePreviewUrl(image.previewUrl);
      }
      return prev.filter((img) => img.previewUrl !== previewUrl);
    });
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  // Click to upload
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary',
          images.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={images.length < maxFiles ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={images.length >= maxFiles}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>

          <div>
            <p className="text-lg font-medium">
              {isDragging ? 'Drop images here' : 'Click or drag images to upload'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {multiple ? `Up to ${maxFiles} files` : 'Single file'}, max {maxSizeMB}MB each
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              JPG, PNG, WebP, HEIC supported
            </p>
          </div>

          {images.length >= maxFiles && (
            <p className="text-sm text-red-500">Maximum file limit reached</p>
          )}
        </div>
      </div>

      {/* Preview Grid */}
      {showPreview && images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.previewUrl}
              className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Preview Image */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                <img
                  src={image.previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                {/* Status Overlay */}
                {image.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}

                {image.status === 'success' && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}

                {image.status === 'error' && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(image.previewUrl)}
                  className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              {image.status === 'uploading' && (
                <div className="p-2">
                  <Progress value={image.progress} className="h-1" />
                </div>
              )}

              {/* File Info */}
              <div className="p-2 bg-gray-50 dark:bg-gray-900">
                <p className="text-xs font-medium truncate">{image.file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(image.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>

                {/* Error Message */}
                {image.status === 'error' && image.error && (
                  <div className="mt-2">
                    <p className="text-xs text-red-500">{image.error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => retryUpload(image)}
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {images.filter((img) => img.status === 'success').length} / {images.length} uploaded
          </span>
          {images.some((img) => img.status === 'error') && (
            <span className="text-red-500">
              {images.filter((img) => img.status === 'error').length} failed
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SIMPLE FILE INPUT
// ============================================================================

/**
 * SimpleImageUpload - Basic file input without drag-and-drop
 *
 * @example
 * <SimpleImageUpload
 *   onUpload={(file) => console.log('Uploaded:', file)}
 * />
 */
export function SimpleImageUpload({
  onUpload,
  buttonText = 'Choose Image',
  className,
}: {
  onUpload: (result: { publicId: string; url: string }) => void;
  buttonText?: string;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);

    try {
      const result = await uploadToCloudinary(file);
      onUpload(result);
    } catch (error) {
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>
    </div>
  );
}
