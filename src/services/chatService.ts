
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
