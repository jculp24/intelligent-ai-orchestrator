
import { useEffect, useState } from 'react';
import { ChatMessage as ChatMessageType, ModelConfig } from '../types';
import { ModelBadge } from './ModelBadge';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: ChatMessageType;
  model?: ModelConfig;
}

export function ChatMessage({ message, model }: ChatMessageProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(message.role === 'assistant');
  const [visibleContent, setVisibleContent] = useState('');
  
  useEffect(() => {
    if (message.role === 'assistant' && message.content) {
      setVisibleContent('');
      setIsTyping(true);
      
      // Simulate typing effect
      let index = 0;
      const intervalId = setInterval(() => {
        setVisibleContent(prev => {
          // Skip to the last part if more than 250 characters
          if (message.content.length > 250 && index === 0) {
            index = Math.floor(message.content.length * 0.8);
            return message.content.substring(0, index);
          }
          
          // Progressive typing
          if (index < message.content.length) {
            index++;
            return message.content.substring(0, index);
          }
          
          // Finished typing
          clearInterval(intervalId);
          setIsTyping(false);
          return message.content;
        });
      }, 10); // Fast typing speed
      
      return () => clearInterval(intervalId);
    }
  }, [message.content, message.role]);

  const formattedTimestamp = new Date(message.timestamp).toLocaleTimeString();
  
  return (
    <div
      className={cn(
        "flex flex-col",
        message.role === "user" ? "items-end" : "items-start"
      )}
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl space-y-2">
        {/* Message header */}
        <div 
          className={cn(
            "flex items-center gap-2",
            message.role === "user" ? "flex-row-reverse" : "flex-row"
          )}
        >
          {message.role === "user" ? (
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-sm font-medium">You</span>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">AI</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {message.role === "assistant" && model && (
              <ModelBadge model={model} />
            )}
            <span className="text-xs text-muted-foreground">{formattedTimestamp}</span>
          </div>
        </div>
        
        {/* Message content */}
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm",
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {message.role === "assistant" && isTyping ? (
            <>
              {visibleContent || (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>
        
        {/* Message metadata */}
        {message.role === "assistant" && message.metadata && (
          <Collapsible
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground">
                {isDetailsOpen ? "Hide details" : "Show details"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="rounded-md border bg-muted/50 p-4 text-xs space-y-3">
                {message.metadata.routing && (
                  <div className="space-y-1.5">
                    <div className="font-medium">Routing</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="text-muted-foreground">Task type:</div>
                      <div>{message.metadata.routing.taskType.replace('_', ' ')}</div>
                      <div className="text-muted-foreground">Complexity:</div>
                      <div>{(message.metadata.routing.complexity * 100).toFixed(0)}%</div>
                      <div className="text-muted-foreground">Routing time:</div>
                      <div>{message.metadata.routingTime?.toFixed(0)}ms</div>
                    </div>
                    
                    <div className="pt-1.5">
                      <div className="font-medium mb-1.5">Model candidates</div>
                      <div className="space-y-1">
                        {message.metadata.routing.candidateModels.slice(0, 3).map((score, i) => (
                          <div key={score.modelId} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="w-4 text-muted-foreground">{i + 1}.</span>
                              <span>{score.modelId.split('-').slice(1).join(' ')}</span>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              Score: {score.score.toFixed(2)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <div className="font-medium">Performance</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="text-muted-foreground">Execution time:</div>
                    <div>{message.metadata.executionTime?.toFixed(0)}ms</div>
                    {message.metadata.tokens && (
                      <>
                        <div className="text-muted-foreground">Tokens in:</div>
                        <div>{message.metadata.tokens.input}</div>
                        <div className="text-muted-foreground">Tokens out:</div>
                        <div>{message.metadata.tokens.output}</div>
                        <div className="text-muted-foreground">Total tokens:</div>
                        <div>{message.metadata.tokens.total}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
