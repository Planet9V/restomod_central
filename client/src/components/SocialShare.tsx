import { Share2, Facebook, Twitter, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  className?: string;
}

export function SocialShare({ 
  url = window.location.href, 
  title = "Check out this amazing classic car content!",
  description = "Discover incredible classic car shows, restomods, and automotive insights at Skinny's Rod & Custom",
  image,
  hashtags = ["ClassicCars", "Restomod", "CarShow", "Automotive", "CustomCars"],
  className = ""
}: SocialShareProps) {
  const { toast } = useToast();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.map(tag => `#${tag}`).join(" ");

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags.join(",")}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    copy: url
  };

  const handleShare = async (platform: string) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Share this awesome content with fellow car enthusiasts!",
        });
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Please copy the URL manually",
          variant: "destructive",
        });
      }
      return;
    }

    if (platform === 'instagram') {
      toast({
        title: "Instagram sharing",
        description: "Screenshot this content and share it on your Instagram story!",
      });
      return;
    }

    // Open social media share window
    const shareUrl = shareLinks[platform as keyof typeof shareLinks];
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    
    // Track sharing event for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        item_id: url
      });
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
      >
        <Facebook className="w-4 h-4 text-blue-600" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="hover:bg-sky-50 hover:border-sky-300 dark:hover:bg-sky-950"
      >
        <Twitter className="w-4 h-4 text-sky-500" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('instagram')}
        className="hover:bg-pink-50 hover:border-pink-300 dark:hover:bg-pink-950"
      >
        <Instagram className="w-4 h-4 text-pink-600" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950"
      >
        <MessageCircle className="w-4 h-4 text-green-600" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('copy')}
        className="hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800"
      >
        <Share2 className="w-4 h-4" />
      </Button>
    </div>
  );
}