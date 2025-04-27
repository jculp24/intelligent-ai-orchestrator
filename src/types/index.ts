
export enum ModelType {
  LOCAL = 'local',
  FAST = 'fast',
  BALANCED = 'balanced',
  ADVANCED = 'advanced',
  PREMIUM = 'premium'
}

export enum TaskType {
  SIMPLE_QUERY = 'simple_query',
  REASONING = 'reasoning',
  CODING = 'coding',
  MATH = 'math',
  SUMMARIZATION = 'summarization',
  CREATIVE = 'creative'
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  type: ModelType;
  icon?: string; 
  description: string;
  strengths: string[];
  weaknesses: string[];
  costPerToken: number;
  averageLatency: number;
  successRate: number;
  preferredTasks: TaskType[];
  apiConfig: {
    endpoint?: string;
    headers?: Record<string, string>;
  };
}

export interface RoutingScore {
  modelId: string;
  score: number;
  factors: {
    taskTypeMatch: number;
    complexityFit: number;
    costEfficiency: number;
    performanceRating: number;
    latencyRating: number;
    grokEvaluationScore?: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelId?: string;
  metadata?: {
    routingTime?: number;
    executionTime?: number;
    modelName?: string;
    provider?: string;
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
    routing?: {
      taskType: TaskType;
      complexity: number;
      candidateModels: RoutingScore[];
      selectedModel: string;
      fallbacks?: string[];
    };
  };
}

export interface FeedbackData {
  messageId: string;
  rating: 'positive' | 'negative';
  comments?: string;
}

export interface ExecutionResult {
  success: boolean;
  data?: {
    content: string;
    modelId: string;
    executionTime: number;
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}

export interface RoutingResult {
  selectedModelId: string;
  taskType: TaskType;
  complexity: number;
  scores: RoutingScore[];
  routingTime: number;
}

// New interface for model evaluations from Grok3
export interface GrokModelEvaluation {
  modelId: string;
  modelName: string;
  taskType: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  benchmarkResults: {
    name: string;
    score: number;
    rank: number;
  }[];
  developerSentiment: number;
  lastUpdated: number;
}
