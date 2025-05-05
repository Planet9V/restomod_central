import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { EngineOption } from '@shared/schema';
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
const engineFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  horsepower: z.string().min(1, "Horsepower is required"),
  torque: z.string().min(1, "Torque is required"),
  displacement: z.string().min(1, "Displacement is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  compatibleModels: z.array(z.number()).optional().default([]), // Model IDs
});

type EngineFormValues = z.infer<typeof engineFormSchema>;

export default function EnginesTab() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEngine, setEditingEngine] = useState<EngineOption | null>(null);
  const [engineToDelete, setEngineToDelete] = useState<EngineOption | null>(null);
  
  // Fetch engines
  const { data: engines, isLoading } = useQuery({
    queryKey: ["/api/configurator/engines"],
    queryFn: async () => {
      const response = await apiRequest<EngineOption[]>("GET", "/api/configurator/engines");
      return response || [];
    },
  });

  // Create engine mutation
  const createEngineMutation = useMutation({
    mutationFn: async (data: EngineFormValues) => {
      return await apiRequest<EngineOption>("POST", "/api/configurator/engines", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Engine option created successfully",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/configurator/engines"] });
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create engine option: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update engine mutation
  const updateEngineMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EngineFormValues }) => {
      return await apiRequest<EngineOption>("PUT", `/api/configurator/engines/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Engine option updated successfully",
      });
      setEditingEngine(null);
      queryClient.invalidateQueries({ queryKey: ["/api/configurator/engines"] });
      editForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update engine option: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete engine mutation
  const deleteEngineMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/configurator/engines/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Engine option deleted successfully",
      });
      setEngineToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/configurator/engines"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete engine option: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add form
  const addForm = useForm<EngineFormValues>({
    resolver: zodResolver(engineFormSchema),
    defaultValues: {
      name: "",
      description: "",
      horsepower: "",
      torque: "",
      displacement: "",
      imageUrl: "",
      price: 0,
      compatibleModels: [],
    },
  });

  // Edit form
  const editForm = useForm<EngineFormValues>({
    resolver: zodResolver(engineFormSchema),
    defaultValues: {
      name: "",
      description: "",
      horsepower: "",
      torque: "",
      displacement: "",
      imageUrl: "",
      price: 0,
      compatibleModels: [],
    },
  });

  // Handle add form submission
  const handleAddEngine = (values: EngineFormValues) => {
    createEngineMutation.mutate(values);
  };

  // Handle edit form submission
  const handleEditEngine = (values: EngineFormValues) => {
    if (editingEngine) {
      updateEngineMutation.mutate({ id: editingEngine.id, data: values });
    }
  };

  // Handle delete engine
  const handleDeleteEngine = () => {
    if (engineToDelete) {
      deleteEngineMutation.mutate(engineToDelete.id);
    }
  };

  // Update edit form values when editing engine changes
  React.useEffect(() => {
    if (editingEngine) {
      editForm.reset({
        name: editingEngine.name,
        description: editingEngine.description,
        horsepower: editingEngine.horsepower,
        torque: editingEngine.torque,
        displacement: editingEngine.displacement,
        imageUrl: editingEngine.imageUrl,
        price: editingEngine.price,
        compatibleModels: editingEngine.compatibleModels || [],
      });
    }
  }, [editingEngine, editForm]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Manage engine options for the configurator.
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Engine
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-primary)]" />
        </div>
      ) : engines && engines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engines.map((engine) => (
            <div className="admin-card group" key={engine.id}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">{engine.name}</h3>
                <p className="admin-card-description text-sm text-muted-foreground">
                  {engine.horsepower} HP | {engine.torque} lb-ft
                </p>
              </div>
              <div className="admin-card-content">
                <div className="admin-image-container mb-3">
                  <img 
                    src={engine.imageUrl} 
                    alt={engine.name} 
                    className="admin-image object-cover h-48 w-full" 
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{engine.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm font-medium text-[var(--admin-primary)]">
                    ${engine.price.toLocaleString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => setEditingEngine(engine)}
                    >
                      <Edit className="mr-1.5 h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => setEngineToDelete(engine)}
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
          <h3 className="text-lg font-medium">No engine options found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add engine options to offer in the configurator.
          </p>
        </div>
      )}

      {/* Add Engine Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Engine Option</DialogTitle>
            <DialogDescription>
              Add a new engine option to the configurator.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddEngine)} className="space-y-6">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Supercharged 6.2L V8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={addForm.control}
                  name="horsepower"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horsepower</FormLabel>
                      <FormControl>
                        <Input placeholder="650 HP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="torque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Torque</FormLabel>
                      <FormControl>
                        <Input placeholder="650 lb-ft" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="displacement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Displacement</FormLabel>
                      <FormControl>
                        <Input placeholder="6.2L" {...field} />
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
                        placeholder="Describe the engine option..."
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
                        <Input placeholder="https://example.com/engine.jpg" {...field} />
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
                          placeholder="25000" 
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
                  disabled={createEngineMutation.isPending}
                >
                  {createEngineMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Engine'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Engine Dialog */}
      <Dialog open={!!editingEngine} onOpenChange={(open) => !open && setEditingEngine(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Engine Option</DialogTitle>
            <DialogDescription>
              Update engine option information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditEngine)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Supercharged 6.2L V8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="horsepower"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horsepower</FormLabel>
                      <FormControl>
                        <Input placeholder="650 HP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="torque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Torque</FormLabel>
                      <FormControl>
                        <Input placeholder="650 lb-ft" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="displacement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Displacement</FormLabel>
                      <FormControl>
                        <Input placeholder="6.2L" {...field} />
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
                        placeholder="Describe the engine option..."
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
                        <Input placeholder="https://example.com/engine.jpg" {...field} />
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
                          placeholder="25000" 
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
                  onClick={() => setEditingEngine(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateEngineMutation.isPending}
                >
                  {updateEngineMutation.isPending ? (
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

      {/* Delete Engine Dialog */}
      <AlertDialog open={!!engineToDelete} onOpenChange={(open) => !open && setEngineToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the engine option.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEngine}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteEngineMutation.isPending}
            >
              {deleteEngineMutation.isPending ? (
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
