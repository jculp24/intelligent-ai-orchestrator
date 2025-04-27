
import { ModelConfig } from '@/types';
import { getModelPerformanceLabel } from '@/utils/modelScoring';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface ModelBadgeProps {
  model: ModelConfig;
}

export function ModelBadge({ model }: ModelBadgeProps) {
  const performanceLabel = getModelPerformanceLabel(model.successRate);
  
  // Define colors based on model type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'local': return 'bg-zinc-200 text-zinc-800';
      case 'fast': return 'bg-blue-100 text-blue-800';
      case 'balanced': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-amber-100 text-amber-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getBadgeColor(model.type)}`}>
          {model.name}
        </div>
      </TooltipTrigger>
      <TooltipContent className="w-64 p-4">
        <div className="space-y-2">
          <p className="font-medium">{model.name} by {model.provider}</p>
          <p className="text-sm text-muted-foreground">{model.description}</p>
          
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Success Rate</span>
              <span className="text-xs font-medium">{performanceLabel}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${model.successRate * 100}%` }} 
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Avg. Latency</span>
              <span className="text-xs font-medium">{model.averageLatency}ms</span>
            </div>
          </div>
          
          {model.costPerToken > 0 ? (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Cost/1K tokens</span>
                <span className="text-xs font-medium">
                  ${(model.costPerToken * 1000).toFixed(4)}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Cost</span>
                <span className="text-xs font-medium">Free (Local)</span>
              </div>
            </div>
          )}
          
          <div className="pt-1">
            <span className="text-xs font-medium">Best for:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {model.preferredTasks.map(task => (
                <span 
                  key={task} 
                  className="inline-block rounded-md bg-muted px-2 py-1 text-xs"
                >
                  {task.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
