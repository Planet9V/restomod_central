import { useState } from 'react';
import { useResearchArticles, useCreateResearchArticle, useUpdateResearchArticle, useDeleteResearchArticle } from '@/hooks/use-research-articles';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, Edit, Eye } from 'lucide-react';
import { format } from 'date-fns';

const researchArticleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  author: z.string().min(1, 'Author is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional().default([]),
  featuredImage: z.string().min(1, 'Featured image URL is required'),
  featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof researchArticleFormSchema>;

const ARTICLE_CATEGORIES = [
  "restoration",
  "customization",
  "performance",
  "history",
  "engineering",
  "maintenance",
  "market-trends"
];

export function ResearchArticleManager() {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const { data: articles, isLoading } = useResearchArticles();
  const createMutation = useCreateResearchArticle();
  const updateMutation = useUpdateResearchArticle();
  const deleteMutation = useDeleteResearchArticle();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(researchArticleFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      author: '',
      content: '',
      excerpt: '',
      category: 'restoration',
      tags: [],
      featuredImage: '',
      featured: false,
    },
  });
  
  const resetForm = () => {
    form.reset({
      title: '',
      slug: '',
      author: '',
      content: '',
      excerpt: '',
      category: 'restoration',
      tags: [],
      featuredImage: '',
      featured: false,
    });
    setTagInput('');
  };

  const handleSelect = (article: any) => {
    setSelectedArticle(article);
    form.reset({
      title: article.title,
      slug: article.slug,
      author: article.author,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags || [],
      featuredImage: article.featuredImage,
      featured: article.featured,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (article: any) => {
    setSelectedArticle(article);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedArticle) {
      deleteMutation.mutate(selectedArticle.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedArticle(null);
        },
      });
    }
  };
  
  const handleCreateSubmit = (data: FormValues) => {
    createMutation.mutate({
      ...data,
      publishDate: new Date().toISOString(),
    }, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        resetForm();
      },
    });
  };
  
  const handleUpdateSubmit = (data: FormValues) => {
    if (selectedArticle) {
      updateMutation.mutate({
        id: selectedArticle.id,
        data: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      }, {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedArticle(null);
          resetForm();
        },
      });
    }
  };
  
  const handleTagAdd = () => {
    if (tagInput.trim() !== '') {
      const currentTags = form.getValues('tags') || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue('tags', [...currentTags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };
  
  const handleTagRemove = (tag: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(t => t !== tag));
  };
  
  const handleCreateOpen = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };
  
  // Helper to generate a slug from title
  const generateSlugFromTitle = () => {
    const title = form.getValues('title');
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', slug);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Research Articles</CardTitle>
            <CardDescription>Manage research and educational articles</CardDescription>
          </div>
          <Button onClick={handleCreateOpen} className="admin-button-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Article
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : articles && articles.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-250px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article: any) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell className="capitalize">{article.category}</TableCell>
                    <TableCell>{article.author}</TableCell>
                    <TableCell>{article.featured ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{format(new Date(article.publishDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelect(article)}
                        className="admin-button-edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(article)}
                        className="admin-button-delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No research articles found. Create your first article to get started.
          </div>
        )}
      </CardContent>
      
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Create Research Article</DialogTitle>
            <DialogDescription>
              Add a new research article to your resources library
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Article Title" 
                            onBlur={generateSlugFromTitle}
                          />
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
                          <Input {...field} placeholder="article-slug" />
                        </FormControl>
                        <FormDescription>URL-friendly name (auto-generated from title)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Author Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ARTICLE_CATEGORIES.map(category => (
                              <SelectItem key={category} value={category} className="capitalize">
                                {category.replace(/-/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Featured Article</FormLabel>
                          <FormDescription>
                            Feature this article on the home page
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
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Brief summary of the article" 
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Article content in markdown format" 
                            className="min-h-[250px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex gap-2 mt-2 mb-2">
                      <Input 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleTagAdd();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleTagAdd}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch('tags')?.map((tag, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 text-secondary-foreground/70 hover:text-secondary-foreground"
                            onClick={() => handleTagRemove(tag)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="admin-button-primary"
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Article
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Research Article</DialogTitle>
            <DialogDescription>
              Update research article details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Article Title" 
                          />
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
                          <Input {...field} placeholder="article-slug" />
                        </FormControl>
                        <FormDescription>URL-friendly name (changing this will break existing links)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Author Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ARTICLE_CATEGORIES.map(category => (
                              <SelectItem key={category} value={category} className="capitalize">
                                {category.replace(/-/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Featured Article</FormLabel>
                          <FormDescription>
                            Feature this article on the home page
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
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Brief summary of the article" 
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Article content in markdown format" 
                            className="min-h-[250px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex gap-2 mt-2 mb-2">
                      <Input 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleTagAdd();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleTagAdd}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch('tags')?.map((tag, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 text-secondary-foreground/70 hover:text-secondary-foreground"
                            onClick={() => handleTagRemove(tag)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="admin-button-primary"
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Article
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this research article? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
