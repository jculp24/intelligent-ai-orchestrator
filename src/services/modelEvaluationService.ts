
import { TaskType } from '../types';

export interface ModelEvaluation {
  modelId: string;
  taskType: TaskType;
  score: number;
  lastUpdated: number; // timestamp
}

// This would eventually be populated with actual Grok3 evaluation data
const modelEvaluations: ModelEvaluation[] = [
  // Sample data - in production, this would be populated from a database or API
  { modelId: 'openai-gpt-4o', taskType: TaskType.SUMMARIZATION, score: 9.2, lastUpdated: Date.now() },
  { modelId: 'openai-gpt-4o', taskType: TaskType.CODING, score: 8.8, lastUpdated: Date.now() },
  { modelId: 'openai-gpt-4o', taskType: TaskType.MATH, score: 9.0, lastUpdated: Date.now() },
  { modelId: 'openai-gpt-4o', taskType: TaskType.REASONING, score: 9.5, lastUpdated: Date.now() },
  { modelId: 'openai-gpt-4o', taskType: TaskType.CREATIVE, score: 8.9, lastUpdated: Date.now() },
  { modelId: 'openai-gpt-4o', taskType: TaskType.SIMPLE_QUERY, score: 8.7, lastUpdated: Date.now() },
  
  { modelId: 'anthropic-claude-3-sonnet', taskType: TaskType.SUMMARIZATION, score: 9.3, lastUpdated: Date.now() },
  { modelId: 'anthropic-claude-3-sonnet', taskType: TaskType.CODING, score: 8.5, lastUpdated: Date.now() },
  { modelId: 'anthropic-claude-3-sonnet', taskType: TaskType.MATH, score: 8.7, lastUpdated: Date.now() },
  { modelId: 'anthropic-claude-3-sonnet', taskType: TaskType.REASONING, score: 9.4, lastUpdated: Date.now() },
  { modelId: 'anthropic-claude-3-sonnet', taskType: TaskType.CREATIVE, score: 9.2, lastUpdated: Date.now() },
  { modelId: 'anthropic-claude-3-sonnet', taskType: TaskType.SIMPLE_QUERY, score: 8.8, lastUpdated: Date.now() },
  
  { modelId: 'local-mistral-7b', taskType: TaskType.SUMMARIZATION, score: 7.5, lastUpdated: Date.now() },
  { modelId: 'local-mistral-7b', taskType: TaskType.CODING, score: 6.9, lastUpdated: Date.now() },
  { modelId: 'local-mistral-7b', taskType: TaskType.MATH, score: 6.8, lastUpdated: Date.now() },
  { modelId: 'local-mistral-7b', taskType: TaskType.REASONING, score: 7.0, lastUpdated: Date.now() },
  { modelId: 'local-mistral-7b', taskType: TaskType.CREATIVE, score: 7.2, lastUpdated: Date.now() },
  { modelId: 'local-mistral-7b', taskType: TaskType.SIMPLE_QUERY, score: 8.1, lastUpdated: Date.now() },
  
  { modelId: 'deepseek-coder', taskType: TaskType.CODING, score: 9.1, lastUpdated: Date.now() },
  { modelId: 'deepseek-coder', taskType: TaskType.MATH, score: 8.5, lastUpdated: Date.now() },
  
  { modelId: 'openai-gpt-3.5-turbo', taskType: TaskType.SUMMARIZATION, score: 8.4, lastUpdated: Date.now() },
  { modelId: 'openai-gpt-3.5-turbo', taskType: TaskType.CODING, score: 8.0, lastUpdated: Date.now() },
  { modelId: 'openai-gpt-3.5-turbo', taskType: TaskType.SIMPLE_QUERY, score: 8.5, lastUpdated: Date.now() },
];

/**
 * Gets the best model for a specific task type based on evaluation scores
 */
export const getBestModelForTask = (taskType: TaskType): string | null => {
  const evaluationsForTask = modelEvaluations.filter(
    evaluation => evaluation.taskType === taskType
  ).sort((a, b) => b.score - a.score);

  if (evaluationsForTask.length === 0) {
    return null;
  }

  return evaluationsForTask[0].modelId;
};

/**
 * Gets all evaluations for a specific task type
 */
export const getEvaluationsForTaskType = (taskType: TaskType): ModelEvaluation[] => {
  return modelEvaluations
    .filter(evaluation => evaluation.taskType === taskType)
    .sort((a, b) => b.score - a.score);
};

/**
 * Gets model score for a specific model and task type
 */
export const getModelScore = (modelId: string, taskType: TaskType): number | null => {
  const evaluation = modelEvaluations.find(
    e => e.modelId === modelId && e.taskType === taskType
  );
  
  return evaluation ? evaluation.score : null;
};

/**
 * Updates the evaluation data for a model and task type
 */
export const updateModelEvaluation = (
  modelId: string, 
  taskType: TaskType, 
  score: number
): void => {
  const existingIndex = modelEvaluations.findIndex(
    e => e.modelId === modelId && e.taskType === taskType
  );
  
  if (existingIndex >= 0) {
    modelEvaluations[existingIndex] = {
      ...modelEvaluations[existingIndex],
      score,
      lastUpdated: Date.now()
    };
  } else {
    modelEvaluations.push({
      modelId,
      taskType,
      score,
      lastUpdated: Date.now()
    });
  }
};
