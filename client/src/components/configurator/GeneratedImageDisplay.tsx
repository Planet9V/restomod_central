import React from 'react';
import { useGeminiImage } from '@/hooks/use-gemini-image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { getCarImage, getPartImage } from './fallback-images';

type ImageStyle = 'realistic' | 'vintage' | 'blueprint' | 'modern';

interface GeneratedImageDisplayProps {
  car?: string;
  part?: string;
  style?: ImageStyle;
  onImageLoaded?: (imageUrl: string) => void;
  className?: string;
}

const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({
  car,
  part,
  style = 'realistic',
  onImageLoaded,
  className = '',
}) => {
  const {
    isLoading,
    error,
    imageUrl,
    prompt,
    generateCarImage,
    generatePartImage,
    resetImage,
  } = useGeminiImage();

  const [activeStyle, setActiveStyle] = React.useState<ImageStyle>(style);

  // Generate image on mount or when key props change
  React.useEffect(() => {
    generateImage();
  }, [car, part, activeStyle]);

  // Call the parent's onImageLoaded callback when we get a new image
  React.useEffect(() => {
    if (imageUrl && onImageLoaded) {
      onImageLoaded(imageUrl);
    }
  }, [imageUrl, onImageLoaded]);

  const generateImage = async () => {
    if (!car && !part) return;

    try {
      if (part) {
        await generatePartImage(part, car, activeStyle);
      } else if (car) {
        await generateCarImage(car, activeStyle);
      }
    } catch (error) {
      console.warn('Image generation failed, using fallback image', error);
      // Use fallback image if generation fails
      if (part) {
        const fallbackUrl = getPartImage(part);
        if (onImageLoaded) onImageLoaded(fallbackUrl);
      } else if (car) {
        const fallbackUrl = getCarImage(car);
        if (onImageLoaded) onImageLoaded(fallbackUrl);
      }
    }
  };

  const handleRegenerateClick = () => {
    resetImage();
    generateImage();
  };

  const handleStyleChange = (newStyle: ImageStyle) => {
    setActiveStyle(newStyle);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-800">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Generating image...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <ImageIcon className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm text-destructive text-center">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleRegenerateClick}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </div>
          )}

          {imageUrl && !isLoading && !error && (
            <img
              src={imageUrl}
              alt={prompt || `Generated image of ${part || car}`}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">
              {part
                ? `${part}${car ? ` for ${car}` : ''}`
                : car
                ? car
                : 'Generated Image'}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateClick}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              Regenerate
            </Button>
          </div>

          <Separator className="my-2" />

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge
              variant={activeStyle === 'realistic' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleStyleChange('realistic')}
            >
              Realistic
            </Badge>
            <Badge
              variant={activeStyle === 'vintage' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleStyleChange('vintage')}
            >
              Vintage
            </Badge>
            <Badge
              variant={activeStyle === 'blueprint' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleStyleChange('blueprint')}
            >
              Blueprint
            </Badge>
            <Badge
              variant={activeStyle === 'modern' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleStyleChange('modern')}
            >
              Modern
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedImageDisplay;
