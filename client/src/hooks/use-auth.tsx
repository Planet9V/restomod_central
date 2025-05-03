import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";

// User types
type User = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  token: string | null;
  loginMutation: UseMutationResult<{ token: string; user: User }, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type LoginCredentials = {
  email: string;
  password: string;
};

const AUTH_TOKEN_KEY = 'auth_token';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(() => {
    // Initialize token from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  });

  // Fetch current user data if token exists
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await apiRequest('GET', '/api/auth/me', null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401) {
            // Clear invalid token
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setToken(null);
            return null;
          }
          throw new Error('Failed to fetch user data');
        }
        return await res.json();
      } catch (err) {
        throw err;
      }
    },
    enabled: !!token,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setToken(data.token);
      toast({
        title: 'Success',
        description: 'You have been logged in successfully',
      });
      // Refetch user data
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // No need to call server for logout, just remove token
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
    },
    onSuccess: () => {
      // Reset auth state
      queryClient.setQueryData(['/api/auth/me'], null);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
      // Refetch user data
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user?.isAdmin === true;

  // When token changes, update auth headers for all future requests
  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated,
        isAdmin,
        token,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
