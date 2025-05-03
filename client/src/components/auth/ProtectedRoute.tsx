import { ComponentType } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: ComponentType;
  adminOnly?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  component: Component,
  adminOnly = false, 
  redirectTo = '/auth',
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check authorization
  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return <Redirect to={redirectTo} />;
  }

  // Render the protected component
  return <Component />;
}
