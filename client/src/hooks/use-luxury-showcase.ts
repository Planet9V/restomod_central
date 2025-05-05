import { useQuery } from '@tanstack/react-query';
import { LuxuryShowcase } from '@shared/schema';

/**
 * Hook to fetch all luxury showcases
 */
export function useLuxuryShowcases() {
  return useQuery<LuxuryShowcase[]>({
    queryKey: ['/api/luxury-showcases'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch featured luxury showcases with optional limit
 */
export function useFeaturedLuxuryShowcases(limit?: number) {
  return useQuery<LuxuryShowcase[]>({
    queryKey: ['/api/luxury-showcases/featured', { limit }],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single luxury showcase by slug
 */
export function useLuxuryShowcase(slug: string) {
  return useQuery<LuxuryShowcase>({
    queryKey: ['/api/luxury-showcases', slug],
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
