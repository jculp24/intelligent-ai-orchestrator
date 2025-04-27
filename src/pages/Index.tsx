
import { useChat } from '@/hooks/useChat';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { getModelById } from '@/services/modelRouter';

const Index = () => {
  const { messages, isProcessing, processMessage, isSessionReady } = useChat();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container pt-4 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                model={message.modelId ? getModelById(message.modelId) : undefined}
              />
            ))}
          </div>
        </div>
      </main>
      
      <ChatInput 
        onSubmit={processMessage} 
        isProcessing={isProcessing} 
        isSessionReady={isSessionReady}
      />
    </div>
  );
};

export default Index;
