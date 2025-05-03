import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { PlusCircle, Car, Users, Settings, LogOut, Home, Loader2, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define project types
interface Project {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  galleryImages: string[];
  specs: Record<string, string>;
  features: string[];
  historicalInfo?: Record<string, string>;
  priceHistory?: Record<string, number>;
  videoUrl?: string;
  featured: boolean;
  createdAt: string;
}

// Form validation schema for editing projects
const projectFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  subtitle: z.string().min(3, "Subtitle must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string(),
  imageUrl: z.string().url("Must be a valid URL"),
  featured: z.boolean().optional().default(false),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('projects');
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  // Fetch projects
  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await apiRequest<Project[]>('GET', '/api/projects');
      return response;
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      await apiRequest('DELETE', `/api/admin/projects/${projectId}`);
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted",
      });
      setProjectToDelete(null);
      refetchProjects();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProjectFormValues }) => {
      return await apiRequest<Project>('PUT', `/api/admin/projects/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: "The project has been successfully updated",
      });
      setEditingProject(null);
      refetchProjects();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle project edit form submission
  const handleEditProject = (values: ProjectFormValues) => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: values });
    }
  };

  // Handle project deletion
  const handleDeleteProject = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
    }
  };

  // Initialize edit project form
  const editProjectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: editingProject ? {
      title: editingProject.title,
      subtitle: editingProject.subtitle,
      description: editingProject.description,
      category: editingProject.category,
      imageUrl: editingProject.imageUrl,
      featured: editingProject.featured,
    } : {
      title: '',
      subtitle: '',
      description: '',
      category: '',
      imageUrl: '',
      featured: false,
    },
  });

  // Update form values when editing project changes
  useEffect(() => {
    if (editingProject) {
      editProjectForm.reset({
        title: editingProject.title,
        subtitle: editingProject.subtitle,
        description: editingProject.description,
        category: editingProject.category,
        imageUrl: editingProject.imageUrl,
        featured: editingProject.featured,
      });
    }
  }, [editingProject, editProjectForm]);

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate('/');
  };
  
  const closeDeleteDialog = () => setProjectToDelete(null);
  const closeEditDialog = () => setEditingProject(null);

  return (
    <div className="flex min-h-screen bg-muted/10">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Skinny's Rod and Custom</p>
        </div>
        
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              Front Site
            </Button>
            
            <Button 
              variant={activeTab === 'projects' ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => setActiveTab('projects')}
            >
              <Car className="mr-2 h-4 w-4" />
              Projects
            </Button>
            
            <Button 
              variant={activeTab === 'team' ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => setActiveTab('team')}
            >
              <Users className="mr-2 h-4 w-4" />
              Team
            </Button>
            
            <Button 
              variant={activeTab === 'settings' ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive" 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="projects" className="mt-0 h-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <p className="text-muted-foreground">Manage your restomod projects</p>
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>
            
            {projectsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription>{project.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-md bg-muted mb-2 overflow-hidden">
                        <img 
                          src={project.imageUrl} 
                          alt={project.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                          {project.category}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingProject(project)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setProjectToDelete(project)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-muted-foreground">Add a new project to get started.</p>
              </div>
            )}
            
            {/* Edit Project Dialog */}
            <Dialog open={!!editingProject} onOpenChange={(open) => !open && closeEditDialog()}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                  <DialogDescription>
                    Make changes to the project information below.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...editProjectForm}>
                  <form onSubmit={editProjectForm.handleSubmit(handleEditProject)} className="space-y-6">
                    <FormField
                      control={editProjectForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="1967 Mustang Fastback" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProjectForm.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input placeholder="Iconic American Muscle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProjectForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="muscle-cars" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProjectForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the project..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProjectForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProjectForm.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 mt-1"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Project</FormLabel>
                            <FormDescription>
                              Featured projects appear in the homepage hero section.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={closeEditDialog}>Cancel</Button>
                      <Button 
                        type="submit" 
                        disabled={updateProjectMutation.isPending || !editProjectForm.formState.isDirty}
                      >
                        {updateProjectMutation.isPending ? (
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
            
            {/* Delete Project Dialog */}
            <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && closeDeleteDialog()}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProject}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteProjectMutation.isPending}
                  >
                    {deleteProjectMutation.isPending ? (
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
          </TabsContent>
          
          <TabsContent value="team" className="mt-0 h-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Team</h1>
                <p className="text-muted-foreground">Manage team members</p>
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Team member cards will go here */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Dave Johnson</CardTitle>
                  <CardDescription>Founder & Master Builder</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="destructive">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0 h-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage website settings</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Update the main homepage hero section</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button variant="outline">Edit Content</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
