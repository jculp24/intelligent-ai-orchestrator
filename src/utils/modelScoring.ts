
import { ModelConfig, TaskType } from '../types';

interface ScoringFactors {
  model: ModelConfig;
  taskType: TaskType;
  complexity: number;
  userTier: 'free' | 'paid';
  recentSuccessRate: number;
  recentLatency: number;
  publicSentiment: number;
  currentLoad: number;
}

export const calculateModelScore = (factors: ScoringFactors): number => {
  const {
    model,
    taskType,
    complexity,
    userTier,
    recentSuccessRate,
    recentLatency,
    publicSentiment,
    currentLoad
  } = factors;

  // Task type match score (0-1)
  const taskMatchScore = model.preferredTasks.includes(taskType) ? 1.0 : 0.5;
  
  // Complexity fit score (0-1)
  // Higher tier models get better scores for complex prompts
  let complexityFitScore = 0;
  switch (model.type) {
    case 'local':
      complexityFitScore = 1 - complexity; // Better for simple tasks
      break;
    case 'fast':
      complexityFitScore = complexity < 0.6 ? 0.9 : 0.6;
      break;
    case 'balanced':
      complexityFitScore = complexity < 0.8 ? 0.8 : 0.7;
      break;
    case 'advanced':
      complexityFitScore = complexity > 0.5 ? 0.9 : 0.7;
      break;
    case 'premium':
      complexityFitScore = complexity > 0.7 ? 1.0 : 0.8;
      break;
    default:
      complexityFitScore = 0.5;
  }
  
  // Cost efficiency score (0-1)
  // For free tier users, prefer cheaper models
  const costEfficiencyScore = userTier === 'free' 
    ? 1 - (model.costPerToken * 10000) // Normalize to 0-1 range
    : 0.8; // Paid users still prefer efficiency but will tolerate higher costs
    
  // Success rate score (0-1)
  const successScore = recentSuccessRate;
  
  // Latency score (0-1)
  // Lower latency is better
  const latencyScore = 1 - (recentLatency / 5000); // Normalize assuming max acceptable is 5 sec
  
  // Sentiment and load scores (0-1)
  const sentimentScore = publicSentiment;
  const loadScore = 1 - currentLoad;
  
  // Weight importance of each factor
  const weights = {
    taskMatch: 0.25,
    complexityFit: 0.20,
    costEfficiency: userTier === 'free' ? 0.20 : 0.10,
    successRate: 0.15,
    latency: 0.10, 
    sentiment: 0.05,
    load: 0.05
  };
  
  // Calculate weighted score
  const score = 
    taskMatchScore * weights.taskMatch +
    complexityFitScore * weights.complexityFit +
    costEfficiencyScore * weights.costEfficiency +
    successScore * weights.successRate +
    latencyScore * weights.latency +
    sentimentScore * weights.sentiment +
    loadScore * weights.load;
    
  return score;
};

export const getModelPerformanceLabel = (successRate: number): string => {
  if (successRate >= 0.98) return 'Excellent';
  if (successRate >= 0.95) return 'Very Good';
  if (successRate >= 0.90) return 'Good';
  if (successRate >= 0.85) return 'Fair';
  return 'Needs Improvement';
};
