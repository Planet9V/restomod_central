import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { TransmissionOption } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Form validation schema
const transmissionFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.string().min(1, "Type is required"),
  speeds: z.coerce.number().min(1, "Number of speeds is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  compatibleModels: z.array(z.number()).optional().default([]), // Model IDs
});

type TransmissionFormValues = z.infer<typeof transmissionFormSchema>;

export default function TransmissionsTab() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransmission, setEditingTransmission] = useState<TransmissionOption | null>(null);
  const [transmissionToDelete, setTransmissionToDelete] = useState<TransmissionOption | null>(null);
  
  // Fetch transmissions
  const { data: transmissions, isLoading } = useQuery({
    queryKey: ["/api/configurator/transmissions"],
    queryFn: async () => {
      const response = await apiRequest<TransmissionOption[]>("GET", "/api/configurator/transmissions");
      return response || [];
    },
  });

  // Create transmission mutation
  const createTransmissionMutation = useMutation({
    mutationFn: async (data: TransmissionFormValues) => {
      return await apiRequest<TransmissionOption>("POST", "/api/configurator/transmissions", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transmission option created successfully",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/configurator/transmissions"] });
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create transmission option: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update transmission mutation
  const updateTransmissionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TransmissionFormValues }) => {
      return await apiRequest<TransmissionOption>("PUT", `/api/configurator/transmissions/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transmission option updated successfully",
      });
      setEditingTransmission(null);
      queryClient.invalidateQueries({ queryKey: ["/api/configurator/transmissions"] });
      editForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update transmission option: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete transmission mutation
  const deleteTransmissionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/configurator/transmissions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transmission option deleted successfully",
      });
      setTransmissionToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/configurator/transmissions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete transmission option: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add form
  const addForm = useForm<TransmissionFormValues>({
    resolver: zodResolver(transmissionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
      speeds: 0,
      imageUrl: "",
      price: 0,
      compatibleModels: [],
    },
  });

  // Edit form
  const editForm = useForm<TransmissionFormValues>({
    resolver: zodResolver(transmissionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
      speeds: 0,
      imageUrl: "",
      price: 0,
      compatibleModels: [],
    },
  });

  // Handle add form submission
  const handleAddTransmission = (values: TransmissionFormValues) => {
    createTransmissionMutation.mutate(values);
  };

  // Handle edit form submission
  const handleEditTransmission = (values: TransmissionFormValues) => {
    if (editingTransmission) {
      updateTransmissionMutation.mutate({ id: editingTransmission.id, data: values });
    }
  };

  // Handle delete transmission
  const handleDeleteTransmission = () => {
    if (transmissionToDelete) {
      deleteTransmissionMutation.mutate(transmissionToDelete.id);
    }
  };

  // Update edit form values when editing transmission changes
  React.useEffect(() => {
    if (editingTransmission) {
      editForm.reset({
        name: editingTransmission.name,
        description: editingTransmission.description,
        type: editingTransmission.type,
        speeds: editingTransmission.speeds,
        imageUrl: editingTransmission.imageUrl,
        price: editingTransmission.price,
        compatibleModels: editingTransmission.compatibleModels || [],
      });
    }
  }, [editingTransmission, editForm]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Manage transmission options for the configurator.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transmission
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-primary)]" />
        </div>
      ) : transmissions && transmissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transmissions.map((transmission) => (
            <div className="admin-card group" key={transmission.id}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">{transmission.name}</h3>
                <p className="admin-card-description text-sm text-muted-foreground">
                  {transmission.type} | {transmission.speeds}-Speed
                </p>
              </div>
              <div className="admin-card-content">
                <div className="admin-image-container mb-3">
                  <img 
                    src={transmission.imageUrl} 
                    alt={transmission.name} 
                    className="admin-image object-cover h-48 w-full" 
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {transmission.description}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm font-medium text-[var(--admin-primary)]">
                    ${transmission.price.toLocaleString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => setEditingTransmission(transmission)}
                    >
                      <Edit className="mr-1.5 h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => setTransmissionToDelete(transmission)}
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
          <h3 className="text-lg font-medium">No transmission options found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add transmission options to offer in the configurator.
          </p>
        </div>
      )}

      {/* Add Transmission Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Transmission Option</DialogTitle>
            <DialogDescription>
              Add a new transmission option to the configurator.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddTransmission)} className="space-y-6">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission Name</FormLabel>
                    <FormControl>
                      <Input placeholder="8-Speed Automatic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Automatic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="speeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speeds</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="8"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
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
                        placeholder="Describe the transmission option..."
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
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/transmission.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="12000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  disabled={createTransmissionMutation.isPending}
                >
                  {createTransmissionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Transmission'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Transmission Dialog */}
      <Dialog open={!!editingTransmission} onOpenChange={(open) => !open && setEditingTransmission(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Transmission Option</DialogTitle>
            <DialogDescription>
              Update transmission option information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditTransmission)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission Name</FormLabel>
                    <FormControl>
                      <Input placeholder="8-Speed Automatic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Automatic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="speeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speeds</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="8"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
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
                        placeholder="Describe the transmission option..."
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
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/transmission.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="12000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingTransmission(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateTransmissionMutation.isPending}
                >
                  {updateTransmissionMutation.isPending ? (
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

      {/* Delete Transmission Dialog */}
      <AlertDialog open={!!transmissionToDelete} onOpenChange={(open) => !open && setTransmissionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transmission option.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTransmission}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteTransmissionMutation.isPending}
            >
              {deleteTransmissionMutation.isPending ? (
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
