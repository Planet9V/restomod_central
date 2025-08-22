import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItinerary, addToItinerary, removeFromItinerary } from '@/lib/api-client';

interface ItineraryEvent {
  id: number;
  // Add other event properties as needed
}

export function useItinerary() {
  const queryClient = useQueryClient();

  const { data: itinerary, isLoading, error } = useQuery<ItineraryEvent[]>({
    queryKey: ['itinerary'],
    queryFn: getItinerary,
  });

  const addMutation = useMutation({
    mutationFn: (eventId: number) => addToItinerary(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (eventId: number) => removeFromItinerary(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary'] });
    },
  });

  const isEventInItinerary = (eventId: number) => {
    return itinerary?.some((event) => event.id === eventId) || false;
  };

  return {
    itinerary,
    isLoading,
    error,
    addEvent: addMutation.mutate,
    removeEvent: removeMutation.mutate,
    isEventInItinerary,
  };
}
