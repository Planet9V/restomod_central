import { useState } from 'react';
import { useLuxuryShowcases } from '@/hooks/use-luxury-showcase';
import { Button } from '@/components/ui/button';
import { LuxuryShowcaseManager } from './LuxuryShowcaseManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, Edit, EyeIcon, LucideIcon, Plus, Star, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { LuxuryShowcase } from '@shared/schema';

export function LuxuryShowcasesTab() {
  const { data: showcases, isLoading, error } = useLuxuryShowcases();
  const [selectedShowcase, setSelectedShowcase] = useState<LuxuryShowcase | null>(null);
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  
  const handleCreateNew = () => {
    setSelectedShowcase(null);
    setMode('create');
  };
  
  const handleEdit = (showcase: LuxuryShowcase) => {
    setSelectedShowcase(showcase);
    setMode('edit');
  };
  
  const handleSuccess = () => {
    setMode('view');
    setSelectedShowcase(null);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-60 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
            <CardTitle>Error Loading Showcases</CardTitle>
          </div>
          <CardDescription>
            There was a problem loading the luxury showcases. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (mode === 'create') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Luxury Showcase</h2>
          <Button variant="outline" onClick={() => setMode('view')}>Cancel</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <LuxuryShowcaseManager onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (mode === 'edit' && selectedShowcase) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Luxury Showcase</h2>
          <Button variant="outline" onClick={() => setMode('view')}>Cancel</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <LuxuryShowcaseManager showcase={selectedShowcase} onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Luxury Showcases</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>
      
      {showcases && showcases.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Luxury Showcases</CardTitle>
            <CardDescription>
              Create your first luxury showcase to highlight premium restomod projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcases?.map((showcase) => (
            <Card key={showcase.id} className="overflow-hidden flex flex-col">
              <div 
                className="h-40 bg-center bg-cover" 
                style={{ backgroundImage: `url(${showcase.heroImage})` }}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{showcase.title}</CardTitle>
                  {showcase.featured && (
                    <Badge variant="default" className="bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" /> Featured
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {showcase.shortDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                {showcase.publishedAt ? (
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Published {new Date(showcase.publishedAt).toLocaleDateString()}
                  </div>
                ) : (
                  <Badge variant="outline" className="mb-2">
                    Draft
                  </Badge>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Slug:</span> {showcase.slug}
                </div>
              </CardContent>
              <div className="px-6 py-4 border-t flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/showcases/${showcase.slug}`} target="_blank" rel="noopener noreferrer">
                    <EyeIcon className="h-4 w-4 mr-2" /> View
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(showcase)}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}