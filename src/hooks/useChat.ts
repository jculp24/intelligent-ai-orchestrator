
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ExecutionResult, RoutingResult } from '@/types';
import { routePrompt, getModelById } from '@/services/modelRouter';
import { executeWithFallback } from '@/services/modelExecutor';
import { createChatSession, saveChatMessage, saveModelPerformance } from '@/services/chatService';
import { importGrokEvaluations } from '@/services/grokEvaluationService';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [evaluationsLoaded, setEvaluationsLoaded] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  // Initialize a chat session when the component mounts
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await createChatSession();
        setSessionId(session.id);
        setSessionInitialized(true);
        console.log("Chat session initialized:", session.id);
      } catch (error) {
        console.error('Failed to create chat session:', error);
        toast.error('Failed to initialize chat session');
      }
    };

    initSession();
  }, []);

  // Load Grok3 model evaluations on component mount
  useEffect(() => {
    const loadEvaluations = async () => {
      const success = await importGrokEvaluations();
      setEvaluationsLoaded(success);
      if (success) {
        toast.success('Model evaluations loaded successfully');
      } else {
        toast.error('Failed to load model evaluations');
      }
    };
    
    loadEvaluations();
  }, []);

  const processMessage = useCallback(async (content: string) => {
    // Prevent processing if no session has been initialized
    if (!sessionId) {
      toast.error('Chat session not ready. Please try again in a moment.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create and save user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: Date.now()
      };

      await saveChatMessage(sessionId, userMessage);
      setMessages(prev => [...prev, userMessage]);

      // Route the prompt using Grok3 evaluation data
      const routingStart = performance.now();
      const routingResult = routePrompt(content, 'free');
      const routingTime = performance.now() - routingStart;

      // Execute the prompt with fallbacks
      const executionStart = performance.now();
      const executionResult = await executeWithFallback(
        routingResult.selectedModelId,
        routingResult.scores
          .filter(s => s.modelId !== routingResult.selectedModelId)
          .map(s => s.modelId)
          .slice(0, 2),
        content,
        messages
      );

      const executionTime = performance.now() - executionStart;

      if (!executionResult.success || !executionResult.data) {
        throw new Error(executionResult.error?.message || 'Failed to generate response');
      }

      // Save model performance metrics
      await saveModelPerformance(
        routingResult.selectedModelId,
        true,
        Math.round(executionTime)
      );

      // Create and save assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: executionResult.data.content,
        timestamp: Date.now(),
        modelId: executionResult.data.modelId,
        metadata: {
          routingTime,
          executionTime,
          modelName: getModelById(executionResult.data.modelId)?.name,
          provider: getModelById(executionResult.data.modelId)?.provider,
          tokens: executionResult.data.tokens,
          routing: {
            taskType: routingResult.taskType,
            complexity: routingResult.complexity,
            candidateModels: routingResult.scores,
            selectedModel: routingResult.selectedModelId
          }
        }
      };

      await saveChatMessage(sessionId, assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to process your message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [messages, sessionId]);

  return {
    messages,
    isProcessing,
    processMessage,
    evaluationsLoaded,
    isSessionReady: !!sessionId
  };
};
