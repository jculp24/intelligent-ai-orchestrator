
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types";

export const createChatSession = async (): Promise<{ id: string }> => {
  try {
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({})
      .select()
      .single();

    if (error) throw error;

    // Log the session creation
    await supabase.rpc('log_security_event', {
      p_event_type: 'session_created',
      p_session_id: session.id,
      p_ip_address: window.location.hostname,
      p_user_agent: navigator.userAgent
    });

    return session;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

export const saveChatMessage = async (
  sessionId: string,
  message: ChatMessage
): Promise<void> => {
  try {
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

    // Log the message creation
    await supabase.rpc('log_security_event', {
      p_event_type: 'message_created',
      p_session_id: sessionId
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

export const getChatSession = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
};

export const getChatMessages = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Save model performance metrics to the database
 * @param modelId - The ID of the model that was used
 * @param success - Whether the model execution was successful
 * @param executionTime - The execution time in milliseconds
 */
export const saveModelPerformance = async (
  modelId: string,
  success: boolean,
  executionTime: number
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('model_performance')
      .insert({
        model_id: modelId,
        success,
        execution_time: executionTime,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      // If the table doesn't exist yet, log an error but don't throw
      // This allows the app to function before the full analytics system is in place
      console.warn('Could not save model performance metrics:', error);
      return;
    }
    
    console.log(`Performance metrics saved for model ${modelId}: ${executionTime}ms`);
  } catch (error) {
    console.error('Error saving model performance:', error);
    // Non-blocking error - we don't want performance logging to break the main application
  }
};
