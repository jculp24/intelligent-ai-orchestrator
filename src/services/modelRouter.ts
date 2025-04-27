
import { TaskType, ModelType, ModelConfig, RoutingResult, RoutingScore } from '../types';
import { calculateModelScore } from '../utils/modelScoring';
import { getBestModelForTask, getEvaluationsForTaskType } from './modelEvaluationService';

// Mock available models - in a real app, these would be loaded from a config or API
const availableModels: ModelConfig[] = [
  {
    id: 'local-mistral-7b',
    name: 'Mistral 7B',
    provider: 'Local',
    type: ModelType.LOCAL,
    description: 'Locally hosted 7B parameter model',
    strengths: ['Fast responses', 'No data sharing', 'No cost per token'],
    weaknesses: ['Limited reasoning', 'Less accurate on complex tasks'],
    costPerToken: 0,
    averageLatency: 500, // ms
    successRate: 0.95,
    preferredTasks: [TaskType.SIMPLE_QUERY, TaskType.SUMMARIZATION],
    apiConfig: {
      endpoint: 'http://localhost:8000/v1/completions'
    }
  },
  {
    id: 'openai-gpt-3.5-turbo',
    name: 'GPT 3.5 Turbo',
    provider: 'OpenAI',
    type: ModelType.FAST,
    description: 'Fast, affordable model good for many tasks',
    strengths: ['Fast responses', 'Good general knowledge', 'Affordable'],
    weaknesses: ['Less nuanced reasoning', 'Occasional factual errors'],
    costPerToken: 0.0001,
    averageLatency: 800, // ms
    successRate: 0.98,
    preferredTasks: [TaskType.SIMPLE_QUERY, TaskType.SUMMARIZATION, TaskType.CODING],
    apiConfig: {
      endpoint: 'https://api.openai.com/v1/chat/completions'
    }
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    type: ModelType.BALANCED,
    description: 'Specialized coding and technical model',
    strengths: ['Excellent coding abilities', 'Technical understanding'],
    weaknesses: ['Less strong on general knowledge', 'Creative limitations'],
    costPerToken: 0.0002,
    averageLatency: 1000, // ms
    successRate: 0.97,
    preferredTasks: [TaskType.CODING, TaskType.MATH],
    apiConfig: {
      endpoint: 'https://api.deepseek.com/v1/completions'
    }
  },
  {
    id: 'anthropic-claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    type: ModelType.ADVANCED,
    description: 'Advanced reasoning and comprehension model',
    strengths: ['Strong reasoning', 'Nuanced understanding', 'Balanced performance'],
    weaknesses: ['Higher cost', 'Variable latency'],
    costPerToken: 0.0003,
    averageLatency: 1200, // ms
    successRate: 0.985,
    preferredTasks: [TaskType.REASONING, TaskType.SUMMARIZATION, TaskType.CREATIVE],
    apiConfig: {
      endpoint: 'https://api.anthropic.com/v1/messages'
    }
  },
  {
    id: 'openai-gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    type: ModelType.PREMIUM,
    description: 'State-of-the-art model for complex reasoning and tasks',
    strengths: ['Excellent reasoning', 'Strong across all task types', 'High accuracy'],
    weaknesses: ['Higher cost', 'Higher latency'],
    costPerToken: 0.0005,
    averageLatency: 2000, // ms
    successRate: 0.99,
    preferredTasks: [TaskType.REASONING, TaskType.CODING, TaskType.MATH, TaskType.CREATIVE],
    apiConfig: {
      endpoint: 'https://api.openai.com/v1/chat/completions'
    }
  }
];

// Simple prompt classifier - in a real system, this would use ML or a language model
const classifyPrompt = (prompt: string): { type: TaskType; complexity: number } => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Very simplified classification logic
  if (lowerPrompt.includes('code') || lowerPrompt.includes('function') || lowerPrompt.includes('programming')) {
    return { type: TaskType.CODING, complexity: 0.7 };
  }
  
  if (lowerPrompt.includes('math') || lowerPrompt.includes('calculate') || lowerPrompt.includes('equation')) {
    return { type: TaskType.MATH, complexity: 0.6 };
  }
  
  if (lowerPrompt.includes('summary') || lowerPrompt.includes('summarize') || lowerPrompt.includes('summarise')) {
    return { type: TaskType.SUMMARIZATION, complexity: 0.4 };
  }
  
  if (lowerPrompt.includes('create') || lowerPrompt.includes('write') || lowerPrompt.includes('generate')) {
    return { type: TaskType.CREATIVE, complexity: 0.5 };
  }
  
  if (prompt.length < 30 || 
      lowerPrompt.includes('what') || 
      lowerPrompt.includes('where') || 
      lowerPrompt.includes('when') || 
      lowerPrompt.includes('who')) {
    return { type: TaskType.SIMPLE_QUERY, complexity: 0.3 };
  }
  
  // Default to reasoning for complex, longer prompts
  const complexity = Math.min(0.9, 0.3 + (prompt.length / 1000));
  return { type: TaskType.REASONING, complexity };
};

export const routePrompt = (prompt: string, userTier: 'free' | 'paid' = 'free'): RoutingResult => {
  const startTime = performance.now();
  
  // Step 1: Classify the prompt
  const { type: taskType, complexity } = classifyPrompt(prompt);
  
  // Step 2: Get best model based on Grok3 evaluation data
  const bestModelId = getBestModelForTask(taskType);
  
  // Step 3: Score each available model using traditional factors and Grok evaluation
  const scores: RoutingScore[] = availableModels.map(model => {
    // Get evaluation based score factor (0-1)
    const evaluations = getEvaluationsForTaskType(taskType);
    const modelEvaluation = evaluations.find(e => e.modelId === model.id);
    const evaluationScore = modelEvaluation ? modelEvaluation.score / 10 : 0.5;
    
    // Calculate traditional score
    const traditionalScore = calculateModelScore({
      model,
      taskType,
      complexity,
      userTier,
      // Additional factors that would come from monitoring systems
      recentSuccessRate: model.successRate,
      recentLatency: model.averageLatency,
      publicSentiment: 0.8,
      currentLoad: 0.5
    });
    
    // Weighted combination of traditional and evaluation-based scores
    // We give higher weight to the Grok evaluation (70%)
    const combinedScore = 0.3 * traditionalScore + 0.7 * evaluationScore;
    
    return {
      modelId: model.id,
      score: combinedScore,
      factors: {
        taskTypeMatch: model.preferredTasks.includes(taskType) ? 1.0 : 0.5,
        complexityFit: complexity,
        costEfficiency: 1 - (model.costPerToken * 10000),
        performanceRating: model.successRate,
        latencyRating: 1 - (model.averageLatency / 5000),
        grokEvaluationScore: evaluationScore * 10
      }
    };
  });
  
  // Sort by score in descending order
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  
  // Select the highest-scoring model, or use the best model from evaluations if available
  const selectedModelId = bestModelId || sortedScores[0].modelId;
  
  const routingTime = performance.now() - startTime;
  
  return {
    selectedModelId,
    taskType,
    complexity,
    scores: sortedScores,
    routingTime
  };
};

export const getModelById = (id: string): ModelConfig | undefined => {
  return availableModels.find(model => model.id === id);
};

export const getAllModels = (): ModelConfig[] => {
  return [...availableModels];
};
