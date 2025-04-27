
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  userTier: 'free' | 'paid';
  onUserTierChange: (tier: 'free' | 'paid') => void;
}

export function Header({ userTier, onUserTierChange }: HeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-purple-700 shine-effect">
            <span className="sr-only">Logo</span>
          </div>
          <h1 className="hidden text-xl font-semibold tracking-tight md:block">
            AI Orchestrator
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">User tier:</span>
              <div className="flex rounded-md border overflow-hidden">
                <button 
                  onClick={() => onUserTierChange('free')}
                  className={cn(
                    "px-3 py-1.5 text-sm transition-colors",
                    userTier === 'free' 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                >
                  Free
                </button>
                <button 
                  onClick={() => onUserTierChange('paid')}
                  className={cn(
                    "px-3 py-1.5 text-sm transition-colors",
                    userTier === 'paid' 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                >
                  Premium
                </button>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            <span className="sr-only">Toggle menu</span>
            {isExpanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="container py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">User tier:</span>
              <div className="flex rounded-md border overflow-hidden">
                <button 
                  onClick={() => onUserTierChange('free')}
                  className={cn(
                    "flex-1 px-3 py-1.5 text-sm transition-colors",
                    userTier === 'free' 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                >
                  Free
                </button>
                <button 
                  onClick={() => onUserTierChange('paid')}
                  className={cn(
                    "flex-1 px-3 py-1.5 text-sm transition-colors",
                    userTier === 'paid' 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                >
                  Premium
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
