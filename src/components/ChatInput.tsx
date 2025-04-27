import { useState, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
interface ChatInputProps {
  onSubmit: (message: string) => void;
  isProcessing: boolean;
  isSessionReady?: boolean;
}
export function ChatInput({
  onSubmit,
  isProcessing,
  isSessionReady = true
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isSessionReady) {
      toast.error('Chat session is initializing. Please wait a moment.');
      return;
    }
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      toast.error('Please enter a message');
      return;
    }
    onSubmit(trimmedMessage);
    setMessage('');

    // Focus back on textarea after submission
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  return <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container py-4 max-w-5xl">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea ref={textareaRef} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={isSessionReady ? "Ask anything... We'll route to the best AI model" : "Initializing chat session..."} className="min-h-24 resize-none pr-16 rounded-lg border border-input bg-background" disabled={isProcessing || !isSessionReady} />
          <div className="absolute bottom-2 right-2">
            <Button type="submit" size="icon" disabled={isProcessing || !message.trim() || !isSessionReady} className="rounded-full h-10 w-10 bg-green-500 hover:bg-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-90">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          {!isSessionReady ? 'Initializing chat session...' : isProcessing ? 'Routing and processing your request...' : 'Messages are processed with the optimal AI model for your task'}
        </div>
      </div>
    </div>;
}