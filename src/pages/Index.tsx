
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import { ModelConfig, ChatMessage as ChatMessageType, TaskType, RoutingScore } from '@/types';
import { routePrompt, getModelById } from '@/services/modelRouter';
import { executePrompt, executeWithFallback } from '@/services/modelExecutor';

const Index = () => {
  const [userTier, setUserTier] = useState<'free' | 'paid'>('free');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Add welcome message on first load
  useEffect(() => {
    const welcomeMessage: ChatMessageType = {
      id: uuidv4(),
      role: 'assistant',
      content: 'Welcome to AI Orchestrator! I\'ll intelligently route your queries to the best AI model based on your question. Ask me anything and I\'ll find the most suitable model to help you.',
      timestamp: Date.now(),
      modelId: 'system',
      metadata: {
        modelName: 'System',
        provider: 'AI Orchestrator'
      }
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  const handleSendMessage = async (content: string) => {
    // Create user message
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsProcessing(true);
    
    try {
      // Start routing timer
      const routingStart = performance.now();
      
      // Route the prompt to determine the best model
      const routingResult = routePrompt(content, userTier);
      const routingTime = performance.now() - routingStart;
      
      console.log('Routing result:', routingResult);
      
      // Get selected model
      const selectedModel = getModelById(routingResult.selectedModelId);
      
      if (!selectedModel) {
        throw new Error('Selected model not found');
      }
      
      // Create fallback list (top 3 models excluding the selected one)
      const fallbackModelIds = routingResult.scores
        .filter(score => score.modelId !== routingResult.selectedModelId)
        .slice(0, 2)
        .map(score => score.modelId);
        
      // Execute the prompt on the selected model with fallbacks
      const executionResult = await executeWithFallback(
        routingResult.selectedModelId,
        fallbackModelIds,
        content,
        messages
      );
      
      if (!executionResult.success || !executionResult.data) {
        throw new Error(executionResult.error?.message || 'Failed to generate response');
      }
      
      // Create assistant message
      const assistantMessage: ChatMessageType = {
        id: uuidv4(),
        role: 'assistant',
        content: executionResult.data.content,
        timestamp: Date.now(),
        modelId: executionResult.data.modelId,
        metadata: {
          routingTime,
          executionTime: executionResult.data.executionTime,
          modelName: selectedModel.name,
          provider: selectedModel.provider,
          tokens: executionResult.data.tokens,
          routing: {
            taskType: routingResult.taskType,
            complexity: routingResult.complexity,
            candidateModels: routingResult.scores,
            selectedModel: routingResult.selectedModelId,
            fallbacks: fallbackModelIds
          }
        }
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Show error toast
      toast.error('Failed to process your request. Please try again.');
      
      // Add error message
      const errorMessage: ChatMessageType = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: Date.now(),
        modelId: 'error',
        metadata: {
          modelName: 'Error',
          provider: 'System'
        }
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getModelForMessage = (message: ChatMessageType): ModelConfig | undefined => {
    if (!message.modelId || message.modelId === 'system' || message.modelId === 'error') {
      return undefined;
    }
    return getModelById(message.modelId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header userTier={userTier} onUserTierChange={setUserTier} />
      
      <main className="flex-1 container pt-4 pb-32">
        <div className="ai-chat-container">
          <div className="message-container">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                model={getModelForMessage(message)}
              />
            ))}
          </div>
        </div>
      </main>
      
      <ChatInput onSubmit={handleSendMessage} isProcessing={isProcessing} />
    </div>
  );
};

export default Index;
