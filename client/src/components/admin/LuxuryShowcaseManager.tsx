import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { InsertLuxuryShowcase, LuxuryShowcase } from '@shared/schema';
import { z } from 'zod';

// Form imports
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Save, Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  subtitle: z.string().min(3, "Subtitle must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
  heroImage: z.string().url("Hero image must be a valid URL"),
  galleryImages: z.array(z.string().url("Gallery image must be a valid URL")).min(1, "At least one gallery image is required"),
  projectId: z.number().optional(),
  videoUrl: z.string().url("Video URL must be a valid URL").optional().or(z.literal("")),
  featured: z.boolean().default(false),
  detailSections: z.array(z.object({
    title: z.string().min(3, "Section title must be at least 3 characters"),
    content: z.string().min(10, "Section content must be at least 10 characters"),
    image: z.string().url("Section image must be a valid URL").optional().or(z.literal("")),
    order: z.number().int().min(0)
  })).min(1, "At least one detail section is required"),
  specifications: z.array(z.object({
    category: z.string().min(3, "Category must be at least 3 characters"),
    items: z.array(z.object({
      label: z.string().min(1, "Label is required"),
      value: z.string().min(1, "Value is required")
    })).min(1, "At least one specification item is required")
  })).min(1, "At least one specification category is required")
});

type FormValues = z.infer<typeof formSchema>;

interface LuxuryShowcaseManagerProps {
  showcase?: LuxuryShowcase;
  onSuccess?: () => void;
}

export function LuxuryShowcaseManager({ showcase, onSuccess }: LuxuryShowcaseManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingDetailSection, setIsAddingDetailSection] = useState(false);
  const [isAddingSpecification, setIsAddingSpecification] = useState(false);
  
  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: showcase ? {
      ...showcase,
      videoUrl: showcase.videoUrl || "", // Handle null values
      detailSections: [...showcase.detailSections], // Clone array to avoid mutation
      specifications: [...showcase.specifications], // Clone array to avoid mutation
    } : {
      title: "",
      subtitle: "",
      slug: "",
      description: "",
      shortDescription: "",
      heroImage: "",
      galleryImages: [""],
      videoUrl: "",
      featured: false,
      detailSections: [{ title: "", content: "", image: "", order: 0 }],
      specifications: [{ category: "", items: [{ label: "", value: "" }] }]
    }
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/admin/luxury-showcases", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Luxury showcase created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/luxury-showcases"] });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create luxury showcase: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("PUT", `/api/admin/luxury-showcases/${showcase?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Luxury showcase updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/luxury-showcases"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update luxury showcase: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!showcase) return;
      await apiRequest("DELETE", `/api/admin/luxury-showcases/${showcase.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Luxury showcase deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/luxury-showcases"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete luxury showcase: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    if (showcase) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this luxury showcase? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };
  
  // Add a new detail section
  const addDetailSection = () => {
    const currentSections = form.getValues().detailSections || [];
    form.setValue("detailSections", [
      ...currentSections,
      { title: "", content: "", image: "", order: currentSections.length }
    ]);
    setIsAddingDetailSection(false);
  };
  
  // Remove a detail section
  const removeDetailSection = (index: number) => {
    const currentSections = form.getValues().detailSections;
    if (currentSections.length > 1) {
      form.setValue(
        "detailSections",
        currentSections.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Error",
        description: "You must have at least one detail section",
        variant: "destructive",
      });
    }
  };
  
  // Add a new specification
  const addSpecification = () => {
    const currentSpecs = form.getValues().specifications || [];
    form.setValue("specifications", [
      ...currentSpecs,
      { category: "", items: [{ label: "", value: "" }] }
    ]);
    setIsAddingSpecification(false);
  };
  
  // Remove a specification
  const removeSpecification = (index: number) => {
    const currentSpecs = form.getValues().specifications;
    if (currentSpecs.length > 1) {
      form.setValue(
        "specifications",
        currentSpecs.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Error",
        description: "You must have at least one specification category",
        variant: "destructive",
      });
    }
  };
  
  // Add a new specification item
  const addSpecificationItem = (specIndex: number) => {
    const currentSpecs = form.getValues().specifications;
    const currentItems = currentSpecs[specIndex].items;
    
    const updatedSpecs = [...currentSpecs];
    updatedSpecs[specIndex] = {
      ...updatedSpecs[specIndex],
      items: [...currentItems, { label: "", value: "" }]
    };
    
    form.setValue("specifications", updatedSpecs);
  };
  
  // Remove a specification item
  const removeSpecificationItem = (specIndex: number, itemIndex: number) => {
    const currentSpecs = form.getValues().specifications;
    const currentItems = currentSpecs[specIndex].items;
    
    if (currentItems.length > 1) {
      const updatedSpecs = [...currentSpecs];
      updatedSpecs[specIndex] = {
        ...updatedSpecs[specIndex],
        items: currentItems.filter((_, i) => i !== itemIndex)
      };
      
      form.setValue("specifications", updatedSpecs);
    } else {
      toast({
        title: "Error",
        description: "You must have at least one specification item",
        variant: "destructive",
      });
    }
  };
  
  // Add a new gallery image field
  const addGalleryImage = () => {
    const currentImages = form.getValues().galleryImages;
    form.setValue("galleryImages", [...currentImages, ""]);
  };
  
  // Remove a gallery image field
  const removeGalleryImage = (index: number) => {
    const currentImages = form.getValues().galleryImages;
    if (currentImages.length > 1) {
      form.setValue(
        "galleryImages",
        currentImages.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "Error",
        description: "You must have at least one gallery image",
        variant: "destructive",
      });
    }
  };
  
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="text-xl font-medium mb-4">Basic Information</div>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Joe Rogan's 1969 Camaro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ultimate Restomod with 1,000+ HP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. joe-rogan-1969-camaro" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used in the URL: /showcases/[slug]
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description for previews and cards" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Complete detailed description of the showcase" 
                      {...field} 
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project ID (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Link to existing project ID" 
                      {...field} 
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Connect this showcase to an existing project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base mb-0">Featured Showcase</FormLabel>
                    <FormDescription>
                      Featured showcases appear on the homepage
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          {/* Media Section */}
          <div className="space-y-6">
            <div className="text-xl font-medium mb-4">Media</div>
            
            <FormField
              control={form.control}
              name="heroImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hero Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/hero-image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/video.mp4" {...field} />
                  </FormControl>
                  <FormDescription>
                    A video to use in the hero section (MP4 format recommended)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormLabel>Gallery Images</FormLabel>
              <div className="space-y-2">
                {form.getValues().galleryImages.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`galleryImages.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="https://example.com/gallery-image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGalleryImage}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Gallery Image
              </Button>
            </div>
          </div>
        </div>
        
        {/* Detail Sections */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-medium">Detail Sections</div>
            {isAddingDetailSection ? (
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="default" 
                  size="sm" 
                  onClick={addDetailSection}
                >
                  Add
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingDetailSection(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddingDetailSection(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Section
              </Button>
            )}
          </div>
          
          {form.getValues().detailSections.map((_, index) => (
            <div key={index} className="border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <FormField
                  control={form.control}
                  name={`detailSections.${index}.order`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeDetailSection(index)}
                >
                  <Trash className="h-4 w-4 mr-2" /> Remove
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name={`detailSections.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Performance Upgrades" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`detailSections.${index}.content`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="HTML content for this section" 
                        {...field} 
                        rows={6}
                      />
                    </FormControl>
                    <FormDescription>
                      You can use HTML for formatting (p, strong, em, ul, li, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`detailSections.${index}.image`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/section-image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
        
        {/* Specifications */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-medium">Specifications</div>
            {isAddingSpecification ? (
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="default" 
                  size="sm" 
                  onClick={addSpecification}
                >
                  Add
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingSpecification(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddingSpecification(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Category
              </Button>
            )}
          </div>
          
          {form.getValues().specifications.map((_, specIndex) => (
            <div key={specIndex} className="border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <FormField
                  control={form.control}
                  name={`specifications.${specIndex}.category`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Engine" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeSpecification(specIndex)}
                  className="mt-8 ml-4"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <FormLabel>Specification Items</FormLabel>
                {form.getValues().specifications[specIndex].items.map((_, itemIndex) => (
                  <div key={itemIndex} className="flex gap-4">
                    <FormField
                      control={form.control}
                      name={`specifications.${specIndex}.items.${itemIndex}.label`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Label (e.g. Engine Type)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`specifications.${specIndex}.items.${itemIndex}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Value (e.g. LS3 V8)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeSpecificationItem(specIndex, itemIndex)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSpecificationItem(specIndex)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-between pt-6">
          <div>
            {showcase && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>Delete Showcase</>
                )}
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {showcase ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {showcase ? "Update" : "Create"} Showcase
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}