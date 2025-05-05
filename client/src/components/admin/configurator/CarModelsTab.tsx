import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CarModel } from '@shared/schema';
import { Pencil, Trash2, Plus, ChevronDown, Search, Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// Form schema for car model
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  basePrice: z.coerce.number().min(1, { message: 'Base price must be at least 1' }),
  yearStart: z.coerce.number().min(1900, { message: 'Year must be at least 1900' }),
  yearEnd: z.coerce.number().nullable().optional(),
  manufacturer: z.string().min(2, { message: 'Manufacturer must be at least 2 characters' }),
  bodyTypes: z.array(z.string()).min(1, { message: 'At least one body type is required' }),
  mainImage: z.string().min(2, { message: 'Main image URL is required' }),
  galleryImages: z.array(z.string()).min(1, { message: 'At least one gallery image is required' }),
  featured: z.boolean().default(false),
  restomodCount: z.coerce.number().default(0),
  historicalInfo: z.string().optional().nullable(),
  marketTrend: z.array(
    z.object({
      year: z.number(),
      value: z.number(),
    })
  ).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarModelsTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [editBodyType, setEditBodyType] = useState('');
  const [editGalleryImage, setEditGalleryImage] = useState('');
  const [editMarketTrendYear, setEditMarketTrendYear] = useState<number | null>(null);
  const [editMarketTrendValue, setEditMarketTrendValue] = useState<number | null>(null);

  // Create form
  const createForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      basePrice: 0,
      yearStart: 1960,
      yearEnd: null,
      manufacturer: '',
      bodyTypes: [],
      mainImage: '',
      galleryImages: [],
      featured: false,
      restomodCount: 0,
      historicalInfo: '',
      marketTrend: [],
    },
  });

  // Edit form
  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      basePrice: 0,
      yearStart: 1960,
      yearEnd: null,
      manufacturer: '',
      bodyTypes: [],
      mainImage: '',
      galleryImages: [],
      featured: false,
      restomodCount: 0,
      historicalInfo: '',
      marketTrend: [],
    },
  });

  // Fetch car models
  const { data: carModels, isLoading, error } = useQuery<CarModel[]>({
    queryKey: ['/api/configurator/models'],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest('POST', '/api/admin/configurator/models', data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create car model');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/configurator/models'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: 'Success',
        description: 'Car model created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues & { id: number }) => {
      const { id, ...formData } = data;
      const res = await apiRequest('PUT', `/api/admin/configurator/models/${id}`, formData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update car model');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/configurator/models'] });
      setIsEditDialogOpen(false);
      setSelectedModel(null);
      editForm.reset();
      toast({
        title: 'Success',
        description: 'Car model updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/configurator/models/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete car model');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/configurator/models'] });
      setIsDeleteDialogOpen(false);
      setSelectedModel(null);
      toast({
        title: 'Success',
        description: 'Car model deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Submit create form
  const onCreateSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  // Submit edit form
  const onEditSubmit = (data: FormValues) => {
    if (!selectedModel) return;
    updateMutation.mutate({
      ...data,
      id: selectedModel.id,
    });
  };

  // Edit model click handler
  const handleEditClick = (model: CarModel) => {
    setSelectedModel(model);
    editForm.reset({
      name: model.name,
      slug: model.slug,
      description: model.description,
      basePrice: parseFloat(model.basePrice.toString()),
      yearStart: model.yearStart,
      yearEnd: model.yearEnd || null,
      manufacturer: model.manufacturer,
      bodyTypes: model.bodyTypes,
      mainImage: model.mainImage,
      galleryImages: model.galleryImages,
      featured: model.featured,
      restomodCount: model.restomodCount,
      historicalInfo: model.historicalInfo || '',
      marketTrend: model.marketTrend || [],
    });
    setIsEditDialogOpen(true);
  };

  // Delete model click handler
  const handleDeleteClick = (model: CarModel) => {
    setSelectedModel(model);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (selectedModel) {
      deleteMutation.mutate(selectedModel.id);
    }
  };

  // Add body type handler
  const handleAddBodyType = (form: typeof createForm | typeof editForm) => {
    const bodyTypes = form.getValues('bodyTypes') || [];
    if (editBodyType && !bodyTypes.includes(editBodyType)) {
      form.setValue('bodyTypes', [...bodyTypes, editBodyType]);
      setEditBodyType('');
    }
  };

  // Remove body type handler
  const handleRemoveBodyType = (form: typeof createForm | typeof editForm, index: number) => {
    const bodyTypes = form.getValues('bodyTypes') || [];
    form.setValue('bodyTypes', bodyTypes.filter((_, i) => i !== index));
  };

  // Add gallery image handler
  const handleAddGalleryImage = (form: typeof createForm | typeof editForm) => {
    const galleryImages = form.getValues('galleryImages') || [];
    if (editGalleryImage && !galleryImages.includes(editGalleryImage)) {
      form.setValue('galleryImages', [...galleryImages, editGalleryImage]);
      setEditGalleryImage('');
    }
  };

  // Remove gallery image handler
  const handleRemoveGalleryImage = (form: typeof createForm | typeof editForm, index: number) => {
    const galleryImages = form.getValues('galleryImages') || [];
    form.setValue('galleryImages', galleryImages.filter((_, i) => i !== index));
  };

  // Add market trend data point handler
  const handleAddMarketTrendData = (form: typeof createForm | typeof editForm) => {
    if (editMarketTrendYear && editMarketTrendValue) {
      const marketTrend = form.getValues('marketTrend') || [];
      const existingYearIndex = marketTrend.findIndex(item => item.year === editMarketTrendYear);
      
      if (existingYearIndex >= 0) {
        // Update existing year
        const updatedTrend = [...marketTrend];
        updatedTrend[existingYearIndex] = { year: editMarketTrendYear, value: editMarketTrendValue };
        form.setValue('marketTrend', updatedTrend);
      } else {
        // Add new year
        form.setValue('marketTrend', [...marketTrend, { year: editMarketTrendYear, value: editMarketTrendValue }]);
      }
      
      setEditMarketTrendYear(null);
      setEditMarketTrendValue(null);
    }
  };

  // Remove market trend data point handler
  const handleRemoveMarketTrendData = (form: typeof createForm | typeof editForm, index: number) => {
    const marketTrend = form.getValues('marketTrend') || [];
    form.setValue('marketTrend', marketTrend.filter((_, i) => i !== index));
  };

  // Filter car models by search query
  const filteredCarModels = carModels
    ? carModels.filter(
        (model) =>
          model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div>Error loading car models: {(error as Error).message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search car models..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Car Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Car Model</DialogTitle>
              <DialogDescription>
                Create a new classic car model for the configurator.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="1969 Camaro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="1969-camaro" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL-friendly identifier (no spaces)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A detailed description of the car model..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input placeholder="Chevrolet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            placeholder="75000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="yearStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1900"
                            max="2023"
                            placeholder="1969"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="yearEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Year (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1900"
                            max="2023"
                            placeholder="1970"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="bodyTypes"
                  render={() => (
                    <FormItem>
                      <FormLabel>Body Types</FormLabel>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add body type (e.g., Coupe)"
                            value={editBodyType}
                            onChange={(e) => setEditBodyType(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddBodyType(createForm)}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {createForm.watch('bodyTypes')?.map((type, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {type}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleRemoveBodyType(createForm, index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="mainImage"
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
                  control={createForm.control}
                  name="galleryImages"
                  render={() => (
                    <FormItem>
                      <FormLabel>Gallery Images</FormLabel>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add image URL"
                            value={editGalleryImage}
                            onChange={(e) => setEditGalleryImage(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddGalleryImage(createForm)}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                          {createForm.watch('galleryImages')?.map((url, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                              <span className="text-sm truncate max-w-[28rem]">{url}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveGalleryImage(createForm, index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="historicalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Historical Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Historical information about the car model..."
                          className="min-h-[120px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="marketTrend"
                  render={() => (
                    <FormItem>
                      <FormLabel>Market Trend Data (Optional)</FormLabel>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            placeholder="Year (e.g., 2020)"
                            value={editMarketTrendYear || ''}
                            onChange={(e) => setEditMarketTrendYear(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-1/3"
                          />
                          <Input
                            type="number"
                            placeholder="Value ($)"
                            value={editMarketTrendValue || ''}
                            onChange={(e) => setEditMarketTrendValue(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-1/3"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddMarketTrendData(createForm)}
                            className="w-1/3"
                          >
                            Add Data Point
                          </Button>
                        </div>
                        <div className="mt-2">
                          <table className="w-full text-sm">
                            <thead>
                              <tr>
                                <th className="text-left">Year</th>
                                <th className="text-left">Value ($)</th>
                                <th className="text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {createForm.watch('marketTrend')?.map((point, index) => (
                                <tr key={index}>
                                  <td className="py-1">{point.year}</td>
                                  <td className="py-1">${point.value.toLocaleString()}</td>
                                  <td className="py-1 text-right">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveMarketTrendData(createForm, index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Model</FormLabel>
                        <FormDescription>
                          Display this model prominently on the configurator page
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Model
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredCarModels.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No car models found. Add a new model to get started.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Years</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Body Types</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCarModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{model.manufacturer}</TableCell>
                  <TableCell>
                    {model.yearStart}{model.yearEnd ? `-${model.yearEnd}` : ''}
                  </TableCell>
                  <TableCell>${parseFloat(model.basePrice.toString()).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {model.bodyTypes.map((type, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {model.featured ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                        Featured
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Regular
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(model)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteClick(model)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      {selectedModel && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Car Model</DialogTitle>
              <DialogDescription>
                Update details for {selectedModel.name}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          URL-friendly identifier (no spaces)
                        </FormDescription>
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
                          className="min-h-[120px]"
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
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            {...field}
                          />
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
                        <FormLabel>Start Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1900"
                            max="2023"
                            {...field}
                          />
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
                        <FormLabel>End Year (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1900"
                            max="2023"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="bodyTypes"
                  render={() => (
                    <FormItem>
                      <FormLabel>Body Types</FormLabel>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add body type (e.g., Coupe)"
                            value={editBodyType}
                            onChange={(e) => setEditBodyType(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddBodyType(editForm)}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editForm.watch('bodyTypes')?.map((type, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {type}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleRemoveBodyType(editForm, index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="mainImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="galleryImages"
                  render={() => (
                    <FormItem>
                      <FormLabel>Gallery Images</FormLabel>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add image URL"
                            value={editGalleryImage}
                            onChange={(e) => setEditGalleryImage(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddGalleryImage(editForm)}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                          {editForm.watch('galleryImages')?.map((url, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                              <span className="text-sm truncate max-w-[28rem]">{url}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveGalleryImage(editForm, index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="historicalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Historical Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="marketTrend"
                  render={() => (
                    <FormItem>
                      <FormLabel>Market Trend Data (Optional)</FormLabel>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            placeholder="Year (e.g., 2020)"
                            value={editMarketTrendYear || ''}
                            onChange={(e) => setEditMarketTrendYear(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-1/3"
                          />
                          <Input
                            type="number"
                            placeholder="Value ($)"
                            value={editMarketTrendValue || ''}
                            onChange={(e) => setEditMarketTrendValue(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-1/3"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddMarketTrendData(editForm)}
                            className="w-1/3"
                          >
                            Add Data Point
                          </Button>
                        </div>
                        <div className="mt-2">
                          <table className="w-full text-sm">
                            <thead>
                              <tr>
                                <th className="text-left">Year</th>
                                <th className="text-left">Value ($)</th>
                                <th className="text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {editForm.watch('marketTrend')?.map((point, index) => (
                                <tr key={index}>
                                  <td className="py-1">{point.year}</td>
                                  <td className="py-1">${point.value.toLocaleString()}</td>
                                  <td className="py-1 text-right">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveMarketTrendData(editForm, index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Model</FormLabel>
                        <FormDescription>
                          Display this model prominently on the configurator page
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Model
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedModel?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
