import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { ColorOption } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  hexCode: z.string().min(1, 'Color hex code is required').regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().url('Must be a valid URL'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  available: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function ColorsTab() {
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      hexCode: '#000000',
      description: '',
      imageUrl: '',
      price: 0,
      available: true,
    },
  });

  // Query for fetching colors
  const { data: colors, isLoading, isError } = useQuery<ColorOption[]>({
    queryKey: ['/api/configurator/colors'],
  });

  // Mutation for creating a new color
  const createColorMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest('POST', '/api/configurator/colors', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/configurator/colors'] });
      form.reset();
    },
  });

  // Mutation for updating a color
  const updateColorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormValues }) => {
      const res = await apiRequest('PUT', `/api/configurator/colors/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/configurator/colors'] });
      setEditingId(null);
      form.reset();
    },
  });

  // Mutation for deleting a color
  const deleteColorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/configurator/colors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/configurator/colors'] });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    if (editingId) {
      updateColorMutation.mutate({ id: editingId, data });
    } else {
      createColorMutation.mutate(data);
    }
  };

  // Handle edit button click
  const handleEdit = (color: ColorOption) => {
    setEditingId(color.id);
    form.reset({
      name: color.name,
      hexCode: color.hexCode,
      description: color.description,
      imageUrl: color.imageUrl,
      price: color.price,
      available: color.available,
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset();
  };

  // Handle delete confirmation
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this color option?')) {
      deleteColorMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Color Option' : 'Add New Color Option'}</CardTitle>
          <CardDescription>
            {editingId 
              ? 'Update the information for this color option' 
              : 'Fill in the details to add a new color option'}
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
                        <Input placeholder="Midnight Black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hexCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Hex Code</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2 items-center">
                          <Input placeholder="#000000" {...field} />
                          <div 
                            className="w-10 h-10 rounded-md border" 
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
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
                        placeholder="A deep, elegant black with subtle metallic flakes..." 
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
                        <Input placeholder="https://example.com/colors/black.jpg" {...field} />
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
                  disabled={createColorMutation.isPending || updateColorMutation.isPending}
                >
                  {(createColorMutation.isPending || updateColorMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? 'Update' : 'Add'} Color
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Color Options</CardTitle>
          <CardDescription>Manage available color options for car models</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading colors...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Error loading color options. Please try again.
            </div>
          ) : colors && colors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colors.map((color) => (
                  <TableRow key={color.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-full border" 
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-xs font-mono">{color.hexCode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{color.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{color.description}</TableCell>
                    <TableCell>${color.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={color.available ? 'text-green-500' : 'text-red-500'}>
                        {color.available ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(color)}
                          disabled={deleteColorMutation.isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(color.id)}
                          disabled={deleteColorMutation.isPending}
                        >
                          {deleteColorMutation.isPending ? (
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
              No color options found. Add your first color option above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
