import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2, Pencil } from 'lucide-react';
import { WheelOption } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  size: z.string().min(1, 'Wheel size is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().url('Must be a valid URL'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  available: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function WheelsTab() {
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      size: '',
      description: '',
      imageUrl: '',
      price: 0,
      available: true,
    },
  });

  // Query for fetching wheels
  const { data: wheels, isLoading, isError } = useQuery<WheelOption[]>({
    queryKey: ['/api/configurator/wheels'],
  });

  // Mutation for creating a new wheel
  const createWheelMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest('POST', '/api/configurator/wheels', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/configurator/wheels'] });
      form.reset();
    },
  });

  // Mutation for updating a wheel
  const updateWheelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormValues }) => {
      const res = await apiRequest('PUT', `/api/configurator/wheels/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/configurator/wheels'] });
      setEditingId(null);
      form.reset();
    },
  });

  // Mutation for deleting a wheel
  const deleteWheelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/configurator/wheels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/configurator/wheels'] });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    if (editingId) {
      updateWheelMutation.mutate({ id: editingId, data });
    } else {
      createWheelMutation.mutate(data);
    }
  };

  // Handle edit button click
  const handleEdit = (wheel: WheelOption) => {
    setEditingId(wheel.id);
    form.reset({
      name: wheel.name,
      size: wheel.size,
      description: wheel.description,
      imageUrl: wheel.imageUrl,
      price: wheel.price,
      available: wheel.available,
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset();
  };

  // Handle delete confirmation
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this wheel option?')) {
      deleteWheelMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Wheel Option' : 'Add New Wheel Option'}</CardTitle>
          <CardDescription>
            {editingId 
              ? 'Update the information for this wheel option' 
              : 'Fill in the details to add a new wheel option'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Forged Chrome Alloy Wheels" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input placeholder="20-inch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Premium forged alloy wheels with a polished chrome finish..." 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/wheels/chrome-alloy.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                      Available
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                {editingId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={createWheelMutation.isPending || updateWheelMutation.isPending}
                >
                  {(createWheelMutation.isPending || updateWheelMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? 'Update' : 'Add'} Wheel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wheel Options</CardTitle>
          <CardDescription>Manage available wheel options for car models</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading wheels...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Error loading wheel options. Please try again.
            </div>
          ) : wheels && wheels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wheels.map((wheel) => (
                  <TableRow key={wheel.id}>
                    <TableCell>
                      {wheel.imageUrl ? (
                        <img 
                          src={wheel.imageUrl} 
                          alt={wheel.name} 
                          className="w-12 h-12 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md border flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{wheel.name}</TableCell>
                    <TableCell>{wheel.size}</TableCell>
                    <TableCell className="max-w-xs truncate">{wheel.description}</TableCell>
                    <TableCell>${wheel.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={wheel.available ? 'text-green-500' : 'text-red-500'}>
                        {wheel.available ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(wheel)}
                          disabled={deleteWheelMutation.isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(wheel.id)}
                          disabled={deleteWheelMutation.isPending}
                        >
                          {deleteWheelMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No wheel options found. Add your first wheel option above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
