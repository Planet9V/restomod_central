import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Image, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface AIConfigAssistantProps {
  selectedConfig: any;
  onRecommendationApply?: (recommendation: any) => void;
  onClose?: () => void;
}

export function AIConfigAssistant({ 
  selectedConfig, 
  onRecommendationApply,
  onClose
}: AIConfigAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Generate a welcome message that introduces KITT
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello, I'm your K.I.T.T-inspired Automotive Assistant. I'm here to help you configure your perfect restomod build. I can answer questions about compatibility, recommend options based on your preferences, or provide insights on classic car restoration. How can I assist you with your ${selectedConfig.model || 'car'} build today?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, [selectedConfig.model]);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Create context-aware prompt that includes current configuration
      const configContext = `
Current Configuration:
- Car Model: ${selectedConfig.model || 'Not selected'}
- Engine: ${selectedConfig.engineType || 'Not selected'}
- Transmission: ${selectedConfig.transmission || 'Not selected'}
- Color: ${selectedConfig.color || 'Not selected'}
- Wheels: ${selectedConfig.wheels || 'Not selected'}
- Interior: ${selectedConfig.interior || 'Not selected'}
      `.trim();
      
      // Send request to API
      const response = await apiRequest<{ message: string, recommendations?: any }>('POST', '/api/ai/assistant', {
        message: input,
        config: selectedConfig,
        configContext,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
      });
      
      if (response && response.message) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // If the response includes specific recommendations, make them available to apply
        if (response.recommendations && onRecommendationApply) {
          // Add a note to the chat about available recommendations
          setMessages(prev => [...prev, {
            id: 'recommendation-' + Date.now().toString(),
            role: 'assistant',
            content: 'I have specific recommendations ready to apply to your configuration. Would you like to apply them?',
            timestamp: new Date()
          }]);
        }
      }
    } catch (error) {
      console.error('Error sending message to AI assistant:', error);
      toast({
        title: 'Communication Error',
        description: 'Unable to reach the AI assistant. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSpeech = (messageContent: string) => {
    if (isSpeaking) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(messageContent);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Get available voices and select a deep male voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Male') || 
        voice.name.includes('Deep') || 
        voice.name.includes('Daniel')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } else {
      toast({
        title: 'Speech Not Supported',
        description: 'Your browser does not support text-to-speech functionality.',
        variant: 'destructive',
      });
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: 'Speech Recognition Not Supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive',
      });
      return;
    }
    
    // @ts-ignore - webkitSpeechRecognition is not in TypeScript's lib
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  return (
    <div className="relative flex flex-col h-full max-h-[600px] bg-background rounded-lg shadow-lg border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">K.I.T.T. Automotive Assistant</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <Card
              className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <CardContent className="p-3">
                <div className="break-words whitespace-pre-wrap">
                  {message.content}
                </div>
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 w-8 p-0"
                    onClick={() => toggleSpeech(message.content)}
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {isSpeaking ? 'Stop Speaking' : 'Speak Message'}
                    </span>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Ask K.I.T.T. about your configuration..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-h-[60px] resize-none"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              onClick={handleSendMessage}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={startListening}
              disabled={isListening}
            >
              {isListening ? <Loader2 className="h-4 w-4 animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>}
              <span className="sr-only">Voice Input</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}