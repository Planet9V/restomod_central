import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { getCarImage, getPartImage } from '@/components/configurator/fallback-images';

type ImageStyle = 'realistic' | 'vintage' | 'blueprint' | 'modern';

interface GenerateImageParams {
  prompt?: string;
  car?: string;
  part?: string;
  style?: ImageStyle;
}

interface GenerateImageResult {
  success: boolean;
  imageData?: string;
  mimeType?: string;
  prompt?: string;
  error?: string;
}

/**
 * Custom hook for generating car and part images using Gemini AI
 */
export function useGeminiImage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);

  /**
   * Generate a car or part image using Gemini AI
   */
  const generateImage = async (params: GenerateImageParams): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    
    try {
      const result = await apiRequest<GenerateImageResult>('/gemini/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (result.success && result.imageData && result.mimeType) {
        const imageDataUrl = `data:${result.mimeType};base64,${result.imageData}`;
        setImageUrl(imageDataUrl);
        setPrompt(result.prompt || null);
        return imageDataUrl;
      } else {
        setError(result.error || 'Failed to generate image');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Generate car image with optional style
   * Falls back to stock image library if generation fails
   */
  const generateCarImage = async (carModel: string, style: ImageStyle = 'realistic') => {
    const result = await generateImage({ car: carModel, style });
    
    if (!result) {
      // If generation failed, use a fallback image
      const fallbackUrl = getCarImage(carModel);
      setImageUrl(fallbackUrl);
      setPrompt(`Fallback image for ${carModel}`);
      return fallbackUrl;
    }
    
    return result;
  };
  
  /**
   * Generate part image with optional car model and style
   * Falls back to stock image library if generation fails
   */
  const generatePartImage = async (partName: string, carModel?: string, style: ImageStyle = 'realistic') => {
    const result = await generateImage({ part: partName, car: carModel, style });
    
    if (!result) {
      // If generation failed, use a fallback image
      const fallbackUrl = getPartImage(partName);
      setImageUrl(fallbackUrl);
      setPrompt(`Fallback image for ${partName}${carModel ? ` (${carModel})` : ''}`);
      return fallbackUrl;
    }
    
    return result;
  };
  
  /**
   * Generate image with custom prompt
   */
  const generateCustomImage = async (prompt: string) => {
    return generateImage({ prompt });
  };
  
  /**
   * Reset the image state
   */
  const resetImage = () => {
    setImageUrl(null);
    setPrompt(null);
    setError(null);
  };
  
  return {
    isLoading,
    error,
    imageUrl,
    prompt,
    generateCarImage,
    generatePartImage,
    generateCustomImage,
    resetImage,
  };
}
