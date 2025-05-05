import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useLuxuryShowcase } from '@/hooks/use-luxury-showcase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, Loader2, ChevronRight, ChevronLeft, Star, PlayCircle, FastForward, Calendar, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

export default function LuxuryShowcasePage() {
  const [, params] = useRoute('/showcases/:slug');
  const { data: showcase, isLoading, error } = useLuxuryShowcase(params?.slug || '');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  
  // Query to get project data if a projectId is linked to this showcase
  const { data: projectData } = useQuery({
    queryKey: ["/api/projects", showcase?.projectId],
    queryFn: async () => {
      if (!showcase?.projectId) return null;
      const response = await apiRequest('GET', `/api/projects/${showcase.projectId}`);
      return response;
    },
    enabled: !!showcase?.projectId,
  });

  // Handle gallery navigation
  const nextImage = () => {
    if (!showcase) return;
    setActiveGalleryIndex((prev) => 
      prev === showcase.galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!showcase) return;
    setActiveGalleryIndex((prev) => 
      prev === 0 ? showcase.galleryImages.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-medium">Loading showcase...</h2>
        </div>
      </div>
    );
  }

  if (error || !showcase) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-16 w-16 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Showcase Not Found</h1>
          <p className="text-xl text-muted-foreground mb-6">
            We couldn't find the showcase you're looking for.
          </p>
          <Button asChild>
            <a href="/showcases">View All Showcases</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        {showcase.videoUrl ? (
          <div className="absolute inset-0 w-full h-full bg-black">
            <video 
              className="w-full h-full object-cover opacity-80" 
              autoPlay 
              loop 
              muted 
              playsInline
            >
              <source src={showcase.videoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90"></div>
          </div>
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${showcase.heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-90"></div>
          </div>
        )}

        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-16 relative z-10">
          <div className="max-w-5xl">
            {showcase.featured && (
              <Badge variant="secondary" className="bg-amber-500 text-white border-none mb-4">
                <Star className="h-3 w-3 mr-2 fill-current" />
                Featured Showcase
              </Badge>
            )}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
              {showcase.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
              {showcase.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-grow">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full border-b rounded-none justify-start mb-8">
                <TabsTrigger value="overview" className="text-lg">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="specifications" className="text-lg">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="gallery" className="text-lg">
                  Gallery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                  <p className="text-xl leading-relaxed mb-6">{showcase.description}</p>

                  {/* Detail sections */}
                  {showcase.detailSections
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <div key={index} className="my-12">
                        <h2 className="text-3xl font-bold mb-6">{section.title}</h2>
                        
                        {section.image && (
                          <div className="my-6">
                            <img 
                              src={section.image} 
                              alt={section.title} 
                              className="rounded-lg w-full h-auto object-cover max-h-[500px]"
                            />
                          </div>
                        )}
                        
                        <div 
                          className="prose prose-lg dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                      </div>
                    ))
                  }
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="pt-4">
                {showcase.specifications.map((specGroup, index) => (
                  <div key={index} className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">{specGroup.category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {specGroup.items.map((spec, i) => (
                        <div 
                          key={i} 
                          className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800"
                        >
                          <span className="font-medium">{spec.label}</span>
                          <span className="text-muted-foreground">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="gallery" className="pt-4">
                <div className="relative overflow-hidden rounded-lg">
                  <div className="aspect-[16/9] bg-muted">
                    <img 
                      src={showcase.galleryImages[activeGalleryIndex]}
                      alt={`${showcase.title} - Image ${activeGalleryIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="rounded-full bg-black/40 text-white hover:bg-black/60"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="rounded-full bg-black/40 text-white hover:bg-black/60"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4">
                  {showcase.galleryImages.map((image, index) => (
                    <div 
                      key={index} 
                      className={`cursor-pointer aspect-square rounded-md overflow-hidden border-2 ${activeGalleryIndex === index ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setActiveGalleryIndex(index)}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-8">
            {showcase.videoUrl && (
              <div className="rounded-lg overflow-hidden border mb-6">
                <div className="aspect-video relative group">
                  <img 
                    src={showcase.heroImage} 
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                    <a 
                      href={showcase.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white"
                    >
                      <PlayCircle className="h-16 w-16" />
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FastForward className="h-4 w-4" />
                    <span>Watch showcase video</span>
                  </div>
                </div>
              </div>
            )}

            {showcase.publishedAt && (
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Publication Information</h3>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Published: {format(new Date(showcase.publishedAt), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Last updated: {format(new Date(showcase.createdAt), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="rounded-lg border bg-primary/5 p-6">
              <h3 className="text-xl font-semibold mb-2">Interested in this build?</h3>
              <p className="text-muted-foreground mb-4">
                Contact us to learn more about this showcase or to discuss creating your own custom restomod project.
              </p>
              <Button className="w-full" asChild>
                <a href="/contact">Get in Touch</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
