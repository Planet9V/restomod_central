import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { PlusCircle, Car, Users, Settings, LogOut, Home } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('projects');
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate('/');
  };

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Project cards will go here - for now just placeholders */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>1953 Ford F100</CardTitle>
                  <CardDescription>Iconic American Pickup</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-muted mb-2 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop" 
                      alt="1953 Ford F100" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="destructive">Delete</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>1967 Mustang Fastback</CardTitle>
                  <CardDescription>Eleanor Inspired Build</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-muted mb-2 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1600&auto=format&fit=crop" 
                      alt="1967 Mustang Fastback" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="destructive">Delete</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>1968 Camaro</CardTitle>
                  <CardDescription>Pro-Touring Monster</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-md bg-muted mb-2 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1603553329474-99f95f35394f?q=80&w=1600&auto=format&fit=crop" 
                      alt="1968 Camaro" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="destructive">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
