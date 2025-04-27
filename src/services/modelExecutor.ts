
import { ModelConfig, ExecutionResult, ChatMessage } from '../types';
import { getModelById } from './modelRouter';
import { v4 as uuidv4 } from 'uuid';

// Mock API for model execution
// In a real application, this would connect to real AI model APIs
export const executePrompt = async (
  modelId: string, 
  prompt: string, 
  history: ChatMessage[] = []
): Promise<ExecutionResult> => {
  // Get model configuration
  const model = getModelById(modelId);
  
  if (!model) {
    return {
      success: false,
      error: {
        message: `Model with ID ${modelId} not found`,
        code: 'MODEL_NOT_FOUND'
      }
    };
  }
  
  // Simulate API call latency
  const startTime = performance.now();
  
  try {
    // Simulate random failures (5% chance of failure for demonstration)
    if (Math.random() > model.successRate) {
      throw new Error('Model API error');
    }
    
    // Add realistic but random latency based on model type
    const minLatency = model.averageLatency * 0.7;
    const maxLatency = model.averageLatency * 1.3;
    const latency = minLatency + Math.random() * (maxLatency - minLatency);
    
    // Wait for simulated latency
    await new Promise(resolve => setTimeout(resolve, latency));
    
    // Mock AI response based on prompt and model
    let response = '';
    
    // Generate a contextually relevant response based on the model type
    // This is just a simulation - real models would generate their own responses
    if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
      response = `Hello! I'm ${model.name} by ${model.provider}. How can I assist you today?`;
    } else if (prompt.toLowerCase().includes('code') || prompt.toLowerCase().includes('function')) {
      if (model.type === 'balanced' || model.type === 'premium' || model.type === 'advanced') {
        response = `Here's a solution to your coding problem:\n\n\`\`\`javascript\nfunction calculateResult(input) {\n  return input.map(x => x * 2).filter(x => x > 10);\n}\n\`\`\`\n\nThis function takes an array, doubles each element, and returns only values greater than 10.`;
      } else {
        response = `I'll try to help with your coding question. You might want to use a map function followed by a filter to process your data efficiently.`;
      }
    } else if (prompt.toLowerCase().includes('math') || prompt.toLowerCase().includes('calculate')) {
      if (model.type === 'premium' || model.type === 'advanced') {
        response = `For this math problem, we need to use the following approach:\n\nStep 1: Set up the equation 3x² + 7x - 2 = 0\nStep 2: Using the quadratic formula x = (-7 ± √(49+24))/6\nStep 3: Simplify to get x ≈ 0.27 or x ≈ -2.44`;
      } else {
        response = `To solve this math problem, I'd recommend using the quadratic formula since it appears to be a quadratic equation.`;
      }
    } else {
      // Generic response based on model capability
      switch (model.type) {
        case 'local':
          response = `Based on my understanding, ${prompt.substring(0, 20)}... is about something I can provide basic information on. Since I'm a locally hosted model, I have limited but private computation.`;
          break;
        case 'fast':
          response = `I understand you're asking about ${prompt.substring(0, 30)}... Here's a quick response that addresses your question efficiently without too much detail.`;
          break;
        case 'balanced':
          response = `Regarding your question about ${prompt.substring(0, 40)}... I've analyzed this from several perspectives and can provide a nuanced answer that balances depth and conciseness.`;
          break;
        case 'advanced':
          response = `I've carefully considered your query about ${prompt.substring(0, 50)}... and can offer an in-depth analysis with multiple perspectives and evidence-based reasoning.`;
          break;
        case 'premium':
          response = `Your inquiry about ${prompt.substring(0, 60)}... requires sophisticated analysis. Here's a comprehensive response that considers multiple domains of knowledge, potential objections, and nuanced implications of this topic.`;
          break;
        default:
          response = `I've processed your request and have a response for you.`;
      }
    }
    
    // Calculate execution time
    const executionTime = performance.now() - startTime;
    
    // Mock token counts
    const inputTokens = prompt.length / 4;
    const outputTokens = response.length / 4;
    
    return {
      success: true,
      data: {
        content: response,
        modelId: model.id,
        executionTime,
        tokens: {
          input: Math.round(inputTokens),
          output: Math.round(outputTokens),
          total: Math.round(inputTokens + outputTokens)
        }
      }
    };
  } catch (error) {
    console.error('Model execution error:', error);
    return {
      success: false,
      error: {
        message: 'Failed to generate response',
        code: 'EXECUTION_ERROR'
      }
    };
  }
};

// Implement fallback logic
export const executeWithFallback = async (
  primaryModelId: string,
  fallbackModelIds: string[],
  prompt: string,
  history: ChatMessage[] = []
): Promise<ExecutionResult> => {
  // Try primary model
  const primaryResult = await executePrompt(primaryModelId, prompt, history);
  
  // If successful, return the result
  if (primaryResult.success) {
    return primaryResult;
  }
  
  console.log(`Primary model ${primaryModelId} failed, trying fallbacks:`, fallbackModelIds);
  
  // Try fallback models in sequence
  for (const fallbackId of fallbackModelIds) {
    console.log(`Trying fallback model: ${fallbackId}`);
    const fallbackResult = await executePrompt(fallbackId, prompt, history);
    
    if (fallbackResult.success) {
      // Add metadata to indicate this was a fallback
      if (fallbackResult.data) {
        fallbackResult.data.content = `[Response from fallback model due to primary model failure]\n\n${fallbackResult.data.content}`;
      }
      
      return fallbackResult;
    }
  }
  
  // All models failed
  return {
    success: false,
    error: {
      message: 'All models failed to generate a response',
      code: 'ALL_MODELS_FAILED'
    }
  };
};
