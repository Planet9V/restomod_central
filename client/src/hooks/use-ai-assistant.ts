import { useState, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface Recommendation {
  title: string;
  description: string;
  type: string;
  value?: string;
}

interface HistoricalContextParams {
  modelName: string;
  year: string;
  make: string;
}

interface PerformancePredictionParams {
  carModel: string;
  engine: string;
  transmission?: string;
  modifications?: string[];
}

interface AIAssistantOptions {
  onRecommendationsReceived?: (recommendations: Recommendation[]) => void;
}

export function useAIAssistant(options?: AIAssistantOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [latestRecommendations, setLatestRecommendations] = useState<Recommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Historical context
  const [historicalContext, setHistoricalContext] = useState<any>(null);
  const [isHistoricalContextLoading, setIsHistoricalContextLoading] = useState<boolean>(false);
  
  // Performance prediction
  const [performancePrediction, setPerformancePrediction] = useState<any>(null);
  const [isPredictionLoading, setIsPredictionLoading] = useState<boolean>(false);

  // Add a message to the chat history
  const addMessage = useCallback((content: string, role: MessageRole) => {
    setMessages(prev => [...prev, { role, content }]);
  }, []);

  // Send a message to the AI assistant
  const sendMessage = useCallback(async (content: string, role: MessageRole = "user") => {
    if (role === "user") {
      // Add user message immediately
      addMessage(content, "user");
    } else {
      // If it's an assistant message (used for initial greeting), add it directly
      addMessage(content, "assistant");
      return;
    }

    // Make API call to get assistant response
    setIsLoading(true);
    try {
      const response = await apiRequest<{ 
        message: string;
        recommendations?: Recommendation[];
      }>('POST', '/api/ai/assistant', { 
        message: content, 
        history: messages
      });

      if (response) {
        // Add assistant response to chat
        addMessage(response.message, "assistant");
        
        // Handle recommendations if any
        if (response.recommendations && response.recommendations.length > 0) {
          setLatestRecommendations(response.recommendations);
          
          if (options?.onRecommendationsReceived) {
            options.onRecommendationsReceived(response.recommendations);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message to AI assistant:", error);
      addMessage("I'm sorry, I encountered an error processing your request. Please try again.", "assistant");
    } finally {
      setIsLoading(false);
    }
  }, [messages, addMessage, options]);

  // Get historical context for a vehicle
  const getHistoricalContext = useCallback(async (params: HistoricalContextParams) => {
    setIsHistoricalContextLoading(true);
    try {
      const response = await apiRequest<any>('POST', '/api/ai/historical-context', params);
      
      if (response) {
        setHistoricalContext(response);
        return response;
      }
      return null;
    } catch (error) {
      console.error("Error getting historical context:", error);
      return null;
    } finally {
      setIsHistoricalContextLoading(false);
    }
  }, []);

  // Generate performance prediction
  const predictPerformance = useCallback(async (params: PerformancePredictionParams) => {
    setIsPredictionLoading(true);
    try {
      const response = await apiRequest<any>('POST', '/api/ai/performance-prediction', params);
      
      if (response) {
        setPerformancePrediction(response);
        return response;
      }
      return null;
    } catch (error) {
      console.error("Error predicting performance:", error);
      return null;
    } finally {
      setIsPredictionLoading(false);
    }
  }, []);

  // Clear chat history
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLatestRecommendations(null);
  }, []);

  return {
    messages,
    sendMessage,
    addMessage,
    clearMessages,
    latestRecommendations,
    isLoading,
    
    // Historical context
    getHistoricalContext,
    historicalContext,
    isHistoricalContextLoading,
    
    // Performance prediction
    predictPerformance,
    performancePrediction,
    isPredictionLoading
  };
}