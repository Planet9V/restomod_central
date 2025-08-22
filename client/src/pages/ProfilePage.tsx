import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// This would be in a separate hook file, but for simplicity here now
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '';

function getAuthToken() {
  const token = localStorage.getItem('auth_token');
  return token ? `Bearer ${token}` : '';
}

async function getPreferences() {
  const response = await fetch(`${API_BASE}/api/user/preferences`, {
    headers: { 'Authorization': getAuthToken() },
  });
  if (!response.ok) throw new Error('Failed to fetch preferences');
  return response.json();
}

async function updatePreferences(data: any) {
  const response = await fetch(`${API_BASE}/api/user/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthToken(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update preferences');
  return response.json();
}
// End of hook logic

export default function ProfilePage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading: prefsLoading } = useQuery({
    queryKey: ['preferences', user?.id],
    queryFn: getPreferences,
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', user?.id] });
      toast({ title: 'Success', description: 'Your preferences have been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const [homeCity, setHomeCity] = useState('');
  const [homeState, setHomeState] = useState('');
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);

  useEffect(() => {
    if (preferences) {
      setHomeCity(preferences.homeLocation?.city || '');
      setHomeState(preferences.homeLocation?.state || '');
      setPreferredCategories(preferences.preferredCategories || []);
    }
  }, [preferences]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      homeLocation: { city: homeCity, state: homeState },
      preferredCategories,
    });
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>User Preferences</CardTitle>
            <CardDescription>
              Help us personalize your experience by providing your location and interests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prefsLoading ? (
              <p>Loading preferences...</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="homeCity">Home City</Label>
                  <Input
                    id="homeCity"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    placeholder="e.g., Los Angeles"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeState">Home State</Label>
                  <Input
                    id="homeState"
                    value={homeState}
                    onChange={(e) => setHomeState(e.target.value)}
                    placeholder="e.g., CA"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Categories (comma-separated)</Label>
                  <Input
                    id="categories"
                    value={preferredCategories.join(', ')}
                    onChange={(e) => setPreferredCategories(e.target.value.split(',').map(c => c.trim()))}
                    placeholder="e.g., Muscle Cars, JDM, Pre-War Classics"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : 'Save Preferences'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
