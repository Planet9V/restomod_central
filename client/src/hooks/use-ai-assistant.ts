import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AssistantResponse = {
  message: string;
  recommendations?: {
    engine?: string | null;
    color?: string | null;
    wheels?: string | null;
    [key: string]: any;
  } | null;
};

interface UseAIAssistantOptions {
  onMessageReceived?: (message: string) => void;
  onRecommendationsReceived?: (recommendations: any) => void;
}

export const useAIAssistant = (options?: UseAIAssistantOptions) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [latestRecommendations, setLatestRecommendations] = useState<any>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async ({ 
      message, 
      config, 
      configContext 
    }: { 
      message: string; 
      config?: any; 
      configContext?: string;
    }) => {
      const response = await apiRequest<AssistantResponse>('POST', '/api/ai/assistant', {
        message,
        config,
        configContext,
        conversationHistory: messages
      });
      
      return response;
    },
    onSuccess: (data) => {
      // Add the assistant's message to the conversation
      if (data.message) {
        const newMessage: AssistantMessage = {
          role: 'assistant',
          content: data.message
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        if (options?.onMessageReceived) {
          options.onMessageReceived(data.message);
        }
      }
      
      // Process recommendations if any
      if (data.recommendations) {
        setLatestRecommendations(data.recommendations);
        
        if (options?.onRecommendationsReceived) {
          options.onRecommendationsReceived(data.recommendations);
        }
      }
    },
    onError: (error) => {
      console.error('Error communicating with AI assistant:', error);
      toast({
        title: 'Communication Error',
        description: 'Unable to reach the AI assistant. Please try again later.',
        variant: 'destructive',
      });
    }
  });

  const historicalContextMutation = useMutation({
    mutationFn: async ({ 
      modelName, 
      year, 
      make,
      category 
    }: { 
      modelName?: string; 
      year?: string | number;
      make?: string;
      category?: string;
    }) => {
      // Construct the query string
      const queryParams = new URLSearchParams();
      if (modelName) queryParams.append('modelName', modelName.toString());
      if (year) queryParams.append('year', year.toString());
      if (make) queryParams.append('make', make);
      if (category) queryParams.append('category', category);
      
      const response = await apiRequest<{ fullText: string; sections: Record<string, string> }>(
        'GET', 
        `/api/ai/historical-context?${queryParams.toString()}`
      );
      
      return response;
    }
  });

  const performancePredictionMutation = useMutation({
    mutationFn: async ({ 
      carModel, 
      engine, 
      transmission,
      modifications
    }: { 
      carModel: string; 
      engine: string;
      transmission?: string;
      modifications?: string[];
    }) => {
      const response = await apiRequest<{ 
        fullText: string; 
        metrics: Record<string, string> 
      }>('POST', '/api/ai/performance-prediction', {
        carModel,
        engine,
        transmission,
        modifications
      });
      
      return response;
    }
  });

  // Send a message to the assistant
  const sendMessage = (
    message: string, 
    config?: any, 
    configContext?: string
  ) => {
    // Add the user's message to the conversation
    const userMessage: AssistantMessage = {
      role: 'user',
      content: message
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send the message to the API
    return chatMutation.mutateAsync({ message, config, configContext });
  };

  // Clear the conversation history
  const clearConversation = () => {
    setMessages([]);
    setLatestRecommendations(null);
  };

  // Get historical context for a specific car model
  const getHistoricalContext = (
    params: { 
      modelName?: string; 
      year?: string | number;
      make?: string;
      category?: string;
    }
  ) => {
    return historicalContextMutation.mutateAsync(params);
  };

  // Generate performance predictions
  const predictPerformance = (
    params: { 
      carModel: string; 
      engine: string;
      transmission?: string;
      modifications?: string[];
    }
  ) => {
    return performancePredictionMutation.mutateAsync(params);
  };

  return {
    // State
    messages,
    latestRecommendations,
    isLoading: chatMutation.isPending,
    isHistoricalContextLoading: historicalContextMutation.isPending,
    isPredictionLoading: performancePredictionMutation.isPending,
    
    // Actions
    sendMessage,
    clearConversation,
    getHistoricalContext,
    predictPerformance
  };
};