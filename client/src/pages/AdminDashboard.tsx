import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { PlusCircle, Car, Users, Settings, LogOut, Home, Loader2, Edit, Trash2, AlertCircle, Star, FileText, Sliders } from 'lucide-react';
import { LuxuryShowcasesTab } from '@/components/admin/LuxuryShowcasesTab';
import { ResearchArticleManager } from '@/components/admin/ResearchArticleManager';
import { ConfiguratorManager } from '@/components/admin/ConfiguratorManager';
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
    <div className="admin-layout flex">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-[var(--admin-sidebar-muted)] mt-1">Skinny's Rod and Custom</p>
        </div>
        
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user?.username}</p>
            <p className="text-xs text-[var(--admin-sidebar-muted)]">{user?.email}</p>
          </div>
        </div>
        
        <nav className="admin-sidebar-nav">
          <button 
            className="admin-sidebar-link" 
            onClick={() => navigate('/')}
          >
            <Home className="h-5 w-5" />
            <span>Front Site</span>
          </button>
          
          <button 
            className={`admin-sidebar-link ${activeTab === 'projects' ? 'active' : ''}`} 
            onClick={() => setActiveTab('projects')}
          >
            <Car className="h-5 w-5" />
            <span>Projects</span>
          </button>
          
          <button 
            className={`admin-sidebar-link ${activeTab === 'luxury-showcases' ? 'active' : ''}`}
            onClick={() => setActiveTab('luxury-showcases')}
          >
            <Star className="h-5 w-5" />
            <span>Luxury Showcases</span>
          </button>

          <button 
            className={`admin-sidebar-link ${activeTab === 'research-articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('research-articles')}
          >
            <FileText className="h-5 w-5" />
            <span>Research Articles</span>
          </button>

          <button 
            className={`admin-sidebar-link ${activeTab === 'car-configurator' ? 'active' : ''}`}
            onClick={() => setActiveTab('car-configurator')}
          >
            <Sliders className="h-5 w-5" />
            <span>Car Configurator</span>
          </button>

          <button 
            className={`admin-sidebar-link ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <Users className="h-5 w-5" />
            <span>Team</span>
          </button>
          
          <button 
            className={`admin-sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
          
          <button 
            className="admin-sidebar-link bg-red-600/10 text-red-600 hover:bg-red-600/20" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-5 w-5" />
            <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="admin-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="luxury-showcases" className="mt-0 h-full">
            <LuxuryShowcasesTab />
          </TabsContent>

          <TabsContent value="research-articles" className="mt-0 h-full">
            <div className="admin-section-header">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Research Articles</h1>
                <p className="text-[var(--admin-muted)]">Manage your educational content and research articles</p>
              </div>
            </div>
            <ResearchArticleManager />
          </TabsContent>

          <TabsContent value="car-configurator" className="mt-0 h-full">
            <div className="admin-section-header">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Car Configurator</h1>
                <p className="text-[var(--admin-muted)]">Manage your car configurator options for classic car restomods</p>
              </div>
            </div>
            <ConfiguratorManager />
          </TabsContent>

          <TabsContent value="projects" className="mt-0 h-full">
            <div className="admin-section-header">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <p className="text-[var(--admin-muted)]">Manage your restomod projects</p>
              </div>
              <button className="admin-button-primary flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </button>
            </div>
            
            {projectsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--admin-primary)]" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div className="admin-card group" key={project.id}>
                    <div className="admin-card-header">
                      <h3 className="admin-card-title">{project.title}</h3>
                      <p className="admin-card-description">{project.subtitle}</p>
                    </div>
                    <div className="admin-card-content">
                      <div className="admin-image-container mb-3">
                        <img 
                          src={project.imageUrl} 
                          alt={project.title} 
                          className="admin-image"
                        />
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-[var(--admin-muted)]">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]">
                            {project.category}
                          </span>
                          {project.featured && (
                            <span className="ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--admin-primary)]/10 text-[var(--admin-primary)]">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            className="admin-button-outline py-1 px-3 text-sm flex items-center"
                            onClick={() => setEditingProject(project)}
                          >
                            <Edit className="mr-1.5 h-3 w-3" />
                            Edit
                          </button>
                          <button 
                            className="admin-button-destructive py-1 px-3 text-sm flex items-center"
                            onClick={() => setProjectToDelete(project)}
                          >
                            <Trash2 className="mr-1.5 h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md bg-white">
                <AlertCircle className="mx-auto h-12 w-12 text-[var(--admin-muted)] mb-4" />
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-[var(--admin-muted)]">Add a new project to get started.</p>
              </div>
            )}
            
            {/* Edit Project Dialog */}
            <Dialog open={!!editingProject} onOpenChange={(open) => !open && closeEditDialog()}>
              <DialogContent className="sm:max-w-[600px] bg-[var(--admin-card-bg)] border-[var(--admin-card-border)]">
                <DialogHeader className="border-b border-[var(--admin-card-border)] pb-4">
                  <DialogTitle className="text-lg font-bold">Edit Project</DialogTitle>
                  <DialogDescription className="text-[var(--admin-muted)]">
                    Make changes to the project information below.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...editProjectForm}>
                  <form onSubmit={editProjectForm.handleSubmit(handleEditProject)} className="space-y-6 pt-4">
                    <FormField
                      control={editProjectForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="admin-form-group">
                          <FormLabel className="admin-form-label">Title</FormLabel>
                          <FormControl>
                            <Input className="admin-form-input" placeholder="1967 Mustang Fastback" {...field} />
                          </FormControl>
                          <FormMessage className="admin-form-error" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProjectForm.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem className="admin-form-group">
                          <FormLabel className="admin-form-label">Subtitle</FormLabel>
                          <FormControl>
                            <Input className="admin-form-input" placeholder="Iconic American Muscle" {...field} />
                          </FormControl>
                          <FormMessage className="admin-form-error" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProjectForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem className="admin-form-group">
                          <FormLabel className="admin-form-label">Category</FormLabel>
                          <FormControl>
                            <Input className="admin-form-input" placeholder="muscle-cars" {...field} />
                          </FormControl>
                          <FormMessage className="admin-form-error" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProjectForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="admin-form-group">
                          <FormLabel className="admin-form-label">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="admin-form-textarea"
                              placeholder="Describe the project..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="admin-form-error" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProjectForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="admin-form-group">
                          <FormLabel className="admin-form-label">Image URL</FormLabel>
                          <FormControl>
                            <Input className="admin-form-input" placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage className="admin-form-error" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editProjectForm.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="admin-form-group flex flex-row items-start space-x-3 space-y-0 rounded-md border border-[var(--admin-form-border)] p-4 bg-[var(--admin-form-bg)]">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="admin-form-checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="admin-form-label m-0">Featured Project</FormLabel>
                            <FormDescription className="text-[var(--admin-muted)]">
                              Featured projects appear in the homepage hero section.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="border-t border-[var(--admin-card-border)] pt-4 mt-6">
                      <button type="button" className="admin-button-outline" onClick={closeEditDialog}>Cancel</button>
                      <button 
                        type="submit" 
                        className="admin-button-primary"
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
                      </button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {/* Delete Project Dialog */}
            <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && closeDeleteDialog()}>
              <AlertDialogContent className="bg-[var(--admin-card-bg)] border-[var(--admin-card-border)]">
                <AlertDialogHeader className="border-b border-[var(--admin-card-border)] pb-4">
                  <AlertDialogTitle className="text-lg font-bold">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[var(--admin-muted)]">
                    This action cannot be undone. This will permanently delete the project from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-4">
                  <button
                    onClick={closeDeleteDialog}
                    className="admin-button-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="admin-button-destructive"
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
                  </button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>
          
          <TabsContent value="team" className="mt-0 h-full">
            <div className="admin-section-header">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Team</h1>
                <p className="text-[var(--admin-muted)]">Manage team members</p>
              </div>
              <button className="admin-button-primary flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Team Member
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Team member cards will go here */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Dave Johnson</h3>
                  <p className="admin-card-description">Founder & Master Builder</p>
                </div>
                <div className="admin-card-content">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]">
                      Leadership
                    </span>
                    <div className="flex space-x-2">
                      <button className="admin-button-outline py-1 px-3 text-sm flex items-center">
                        <Edit className="mr-1.5 h-3 w-3" />
                        Edit
                      </button>
                      <button className="admin-button-destructive py-1 px-3 text-sm flex items-center">
                        <Trash2 className="mr-1.5 h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0 h-full">
            <div className="admin-section-header">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-[var(--admin-muted)]">Manage website settings</p>
              </div>
            </div>
            
            <div className="admin-card mb-6">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Hero Section</h3>
                <p className="admin-card-description">Update the main homepage hero section</p>
              </div>
              <div className="admin-card-content">
                <div className="flex justify-end">
                  <button className="admin-button-outline flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Content
                  </button>
                </div>
              </div>
            </div>
            
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Company Information</h3>
                <p className="admin-card-description">Update your business details</p>
              </div>
              <div className="admin-card-content">
                <div className="flex justify-end">
                  <button className="admin-button-outline flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Information
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
