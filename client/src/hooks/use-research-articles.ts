import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type ResearchArticle = {
  id: number;
  title: string;
  slug: string;
  author: string;
  publishDate: string;
  featuredImage: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

type ResearchArticleInput = Omit<ResearchArticle, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Hook for fetching all research articles
 */
export function useResearchArticles(category?: string) {
  const queryKey = category && category !== 'all' 
    ? ['/api/research-articles', { category }] 
    : ['/api/research-articles'];

  return useQuery({
    queryKey,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching a single research article by slug
 */
export function useResearchArticle(slug: string) {
  return useQuery({
    queryKey: ['/api/research-articles', slug],
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching featured research articles
 */
export function useFeaturedResearchArticles(limit: number = 3) {
  return useQuery({
    queryKey: ['/api/research-articles/featured', { limit }],
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for creating a new research article
 */
export function useCreateResearchArticle() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ResearchArticleInput) => {
      const res = await apiRequest('POST', '/api/admin/research-articles', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-articles'] });
      toast({
        title: 'Research article created',
        description: 'Your research article has been successfully created.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating research article',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for updating an existing research article
 */
export function useUpdateResearchArticle() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<ResearchArticleInput> }) => {
      const res = await apiRequest('PUT', `/api/admin/research-articles/${id}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-articles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/research-articles', variables.data.slug] });
      toast({
        title: 'Research article updated',
        description: 'Your research article has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating research article',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for deleting a research article
 */
export function useDeleteResearchArticle() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/research-articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research-articles'] });
      toast({
        title: 'Research article deleted',
        description: 'The research article has been successfully deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting research article',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
