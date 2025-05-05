import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { LuxuryShowcase } from '@shared/schema';

export function useLuxuryShowcases() {
  return useQuery({
    queryKey: ["/api/luxury-showcases"],
    queryFn: async () => {
      const response = await apiRequest<LuxuryShowcase[]>('GET', '/api/luxury-showcases');
      return response;
    },
  });
}

export function useLuxuryShowcase(slug: string) {
  return useQuery({
    queryKey: ["/api/luxury-showcases", slug],
    queryFn: async () => {
      const response = await apiRequest<LuxuryShowcase>('GET', `/api/luxury-showcases/${slug}`);
      return response;
    },
    enabled: !!slug,
  });
}

export function useFeaturedLuxuryShowcases(limit: number = 3) {
  return useQuery({
    queryKey: ["/api/luxury-showcases/featured", limit],
    queryFn: async () => {
      const response = await apiRequest<LuxuryShowcase[]>('GET', `/api/luxury-showcases/featured?limit=${limit}`);
      return response;
    },
  });
}

export function useDeleteLuxuryShowcase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/luxury-showcases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/luxury-showcases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/luxury-showcases/featured"] });
    },
  });
}