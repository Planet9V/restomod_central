import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { CarModel } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';

// Form validation schema
const carModelFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  yearStart: z.string().regex(/^\d{4}$/, "Must be a valid year"),
  yearEnd: z.string().regex(/^\d{4}$/, "Must be a valid year"),
  imageUrl: z.string().url("Must be a valid URL"),
  thumbnailUrl: z.string().url("Must be a valid URL"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  featured: z.boolean().optional().default(false),
});

type CarModelFormValues = z.infer<typeof carModelFormSchema>;

export default function CarModelsTab() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<CarModel | null>(null);
  const [modelToDelete, setModelToDelete] = useState<CarModel | null>(null);

  // Fetch car models
  const { data: carModels, isLoading } = useQuery({
    queryKey: ["/api/configurator/car-models"],
    queryFn: async () => {
      const response = await apiRequest<CarModel[]>("GET", "/api/configurator/car-models");
      return response;
    },
  });

  // Create car model mutation
  const createCarModelMutation = useMutation({
    mutationFn: async (data: CarModelFormValues) => {
      return await apiRequest<CarModel>("POST", "/api/configurator/car-models", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Car model created successfully",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/configurator/car-models"] });
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create car model: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update car model mutation
  const updateCarModelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CarModelFormValues }) => {
      return await apiRequest<CarModel>("PUT", `/api/configurator/car-models/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Car model updated successfully",
      });
      setEditingModel(null);
      queryClient.invalidateQueries({ queryKey: ["/api/configurator/car-models"] });
      editForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update car model: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete car model mutation
  const deleteCarModelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/configurator/car-models/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Car model deleted successfully",
      });
      setModelToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/configurator/car-models"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete car model: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add form
  const addForm = useForm<CarModelFormValues>({
    resolver: zodResolver(carModelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      yearStart: "",
      yearEnd: "",
      imageUrl: "",
      thumbnailUrl: "",
      slug: "",
      featured: false,
    },
  });

  // Edit form
  const editForm = useForm<CarModelFormValues>({
    resolver: zodResolver(carModelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      yearStart: "",
      yearEnd: "",
      imageUrl: "",
      thumbnailUrl: "",
      slug: "",
      featured: false,
    },
  });

  // Handle add form submission
  const handleAddCarModel = (values: CarModelFormValues) => {
    createCarModelMutation.mutate(values);
  };

  // Handle edit form submission
  const handleEditCarModel = (values: CarModelFormValues) => {
    if (editingModel) {
      updateCarModelMutation.mutate({ id: editingModel.id, data: values });
    }
  };

  // Handle delete car model
  const handleDeleteCarModel = () => {
    if (modelToDelete) {
      deleteCarModelMutation.mutate(modelToDelete.id);
    }
  };

  // Update edit form values when editing model changes
  React.useEffect(() => {
    if (editingModel) {
      editForm.reset({
        name: editingModel.name,
        description: editingModel.description,
        yearStart: editingModel.yearStart.toString(),
        yearEnd: editingModel.yearEnd.toString(),
        imageUrl: editingModel.imageUrl,
        thumbnailUrl: editingModel.thumbnailUrl,
        slug: editingModel.slug,
        featured: editingModel.featured,
      });
    }
  }, [editingModel, editForm]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Manage classic car models available in the configurator.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Car Model
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-primary)]" />
        </div>
      ) : carModels && carModels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carModels.map((model) => (
            <div className="admin-card group" key={model.id}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">{model.name}</h3>
                <p className="admin-card-description text-sm text-muted-foreground">
                  {model.yearStart} - {model.yearEnd}
                </p>
              </div>
              <div className="admin-card-content">
                <div className="admin-image-container mb-3">
                  <img src={model.thumbnailUrl} alt={model.name} className="admin-image object-cover h-48 w-full" />
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{model.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    {model.featured && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--admin-primary)]/10 text-[var(--admin-primary)]">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => setEditingModel(model)}
                    >
                      <Edit className="mr-1.5 h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => setModelToDelete(model)}
                    >
                      <Trash2 className="mr-1.5 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">No car models found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add a car model to get started with the configurator.
          </p>
        </div>
      )}

      {/* Add Car Model Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Car Model</DialogTitle>
            <DialogDescription>
              Add a new classic car model to the configurator.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddCarModel)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="1967 Mustang Fastback" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="1967-mustang-fastback" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="yearStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Start</FormLabel>
                      <FormControl>
                        <Input placeholder="1967" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="yearEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year End</FormLabel>
                      <FormControl>
                        <Input placeholder="1968" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the car model..."
                        className="resize-none min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addForm.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border border-input"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        Featured car models appear at the top of the configurator.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createCarModelMutation.isPending}
                >
                  {createCarModelMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Car Model'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Car Model Dialog */}
      <Dialog open={!!editingModel} onOpenChange={(open) => !open && setEditingModel(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Car Model</DialogTitle>
            <DialogDescription>
              Update car model information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditCarModel)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="1967 Mustang Fastback" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="1967-mustang-fastback" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="yearStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Start</FormLabel>
                      <FormControl>
                        <Input placeholder="1967" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="yearEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year End</FormLabel>
                      <FormControl>
                        <Input placeholder="1968" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the car model..."
                        className="resize-none min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border border-input"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        Featured car models appear at the top of the configurator.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingModel(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateCarModelMutation.isPending}
                >
                  {updateCarModelMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Car Model Dialog */}
      <AlertDialog open={!!modelToDelete} onOpenChange={(open) => !open && setModelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the car model
              and all associated configuration options.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCarModel}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteCarModelMutation.isPending}
            >
              {deleteCarModelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
