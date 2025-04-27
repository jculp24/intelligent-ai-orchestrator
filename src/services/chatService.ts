
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, ExecutionResult } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface ChatSession {
  id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export const createChatSession = async (): Promise<ChatSession> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({})
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const saveChatMessage = async (
  sessionId: string,
  message: ChatMessage
): Promise<void> => {
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      content: message.content,
      role: message.role,
      model_id: message.modelId,
      timestamp: new Date(message.timestamp).toISOString()
    });

  if (error) throw error;
};

export const saveModelPerformance = async (
  modelId: string,
  success: boolean,
  latency: number
): Promise<void> => {
  const { error } = await supabase.rpc('update_model_performance', {
    p_model_id: modelId,
    p_success: success,
    p_latency: latency
  });

  if (error) throw error;
};
