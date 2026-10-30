import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, MessageCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../supabase';

interface StudioChatMessage {
  id: string;
  user_id: string;
  sender_id: string;
  sender_role: 'customer' | 'admin';
  message: string;
  created_at: string;
}

interface CustomerProfile {
  id: string;
  display_name: string;
}

interface AdminChatViewProps {
  adminName: string;
}

function formatMessageTime(value: string): string {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const AdminChatView: React.FC<AdminChatViewProps> = ({ adminName }) => {
  const [messages, setMessages] = useState<StudioChatMessage[]>([]);
  const [profiles, setProfiles] = useState<Map<string, string>>(new Map());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const loadChat = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const [messageResult, profileResult] = await Promise.all([
        supabase
          .from('studio_chat_messages')
          .select('id, user_id, sender_id, sender_role, message, created_at')
          .order('created_at', { ascending: true }),
        supabase.from('profiles').select('id, display_name'),
      ]);

      if (messageResult.error) {
        console.error('Failed to load customer chats:', messageResult.error);
        if (active) {
          setErrorMessage(`Could not load customer chats: ${messageResult.error.message}`);
          setIsLoading(false);
        }
        return;
      }

      if (profileResult.error) {
        console.error('Failed to load chat customer profiles:', profileResult.error);
        if (active) {
          setErrorMessage(`Could not load customer names: ${profileResult.error.message}`);
          setIsLoading(false);
        }
        return;
      }

      if (active) {
        setMessages((messageResult.data || []) as StudioChatMessage[]);
        setProfiles(
          new Map(
            ((profileResult.data || []) as CustomerProfile[]).map((profile) => [
              profile.id,
              profile.display_name,
            ])
          )
        );
        setIsLoading(false);
      }
    };

    void loadChat();

    if (!supabase.realtime) {
      return () => {
        active = false;
      };
    }

    const channel = supabase
      .channel('admin-studio-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'studio_chat_messages' },
        (payload) => {
          const incoming = payload.new as StudioChatMessage;
          if (!active || !incoming?.id) return;
          setMessages((current) =>
            current.some((message) => message.id === incoming.id)
              ? current
              : [...current, incoming].sort(
                  (left, right) =>
                    new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
                )
          );
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Admin chat realtime subscription failed: ${status}`);
          if (active) {
            setErrorMessage('Live chat updates are unavailable. Refresh to check for new messages.');
          }
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  const conversations = useMemo(() => {
    const grouped = new Map<string, StudioChatMessage[]>();
    for (const message of messages) {
      const conversation = grouped.get(message.user_id) || [];
      conversation.push(message);
      grouped.set(message.user_id, conversation);
    }
    return [...grouped.entries()]
      .map(([customerId, conversationMessages]) => ({
        customerId,
        messages: conversationMessages,
        latestMessage: conversationMessages[conversationMessages.length - 1],
      }))
      .sort(
        (left, right) =>
          new Date(right.latestMessage.created_at).getTime() -
          new Date(left.latestMessage.created_at).getTime()
      );
  }, [messages]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.customerId === selectedCustomerId
  );
  const selectedMessages = selectedConversation?.messages || [];

  useEffect(() => {
    if (!selectedCustomerId && conversations.length > 0) {
      setSelectedCustomerId(conversations[0].customerId);
    } else if (
      selectedCustomerId &&
      conversations.length > 0 &&
      !conversations.some((conversation) => conversation.customerId === selectedCustomerId)
    ) {
      setSelectedCustomerId(conversations[0].customerId);
    }
  }, [conversations, selectedCustomerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessages]);

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = inputText.trim();
    if (!message || !selectedCustomerId || isSending) return;

    setIsSending(true);
    setErrorMessage(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Your admin session has expired. Please sign in again.');

      const { data, error } = await supabase
        .from('studio_chat_messages')
        .insert({
          user_id: selectedCustomerId,
          sender_id: authData.user.id,
          sender_role: 'admin',
          message,
        })
        .select('id, user_id, sender_id, sender_role, message, created_at')
        .single();

      if (error) throw error;

      const savedMessage = data as StudioChatMessage;
      setMessages((current) =>
        current.some((item) => item.id === savedMessage.id)
          ? current
          : [...current, savedMessage].sort(
              (left, right) =>
                new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
            )
      );
      setInputText('');
    } catch (error) {
      console.error('Failed to send admin chat reply:', error);
      setErrorMessage(
        `Could not send reply: ${error instanceof Error ? error.message : 'Unexpected error'}`
      );
    } finally {
      setIsSending(false);
    }
  };

  const getCustomerName = (customerId: string) =>
    profiles.get(customerId) || `Customer ${customerId.slice(0, 8)}`;

  return (
    <section className="space-y-6">
      <div>
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A25C] font-semibold">
          Customer care
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] mt-1">
          Customer Messages
        </h2>
        <p className="text-xs text-[#6B6166] mt-1">
          Read customer inquiries and reply directly from the studio.
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="grid min-h-[560px] grid-cols-1 overflow-hidden border border-[#DAD1C5] bg-[#FBF7F0] md:grid-cols-3">
        <aside className="border-b border-[#DAD1C5] md:col-span-1 md:border-b-0 md:border-r">
          <div className="border-b border-[#DAD1C5] px-4 py-4">
            <h3 className="font-serif text-lg text-[#28192A]">Conversations</h3>
            <p className="text-[11px] text-[#6B6166]">
              {conversations.length} {conversations.length === 1 ? 'customer' : 'customers'}
            </p>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2 p-4 text-xs text-[#6B6166]">
              <RefreshCw className="h-4 w-4 animate-spin" /> Loading conversations…
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-5 text-center text-sm text-[#6B6166]">
              <MessageCircle className="mx-auto mb-2 h-6 w-6 text-[#C9A25C]" />
              No customer messages yet.
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto">
              {conversations.map(({ customerId, latestMessage }) => (
                <button
                  key={customerId}
                  type="button"
                  onClick={() => setSelectedCustomerId(customerId)}
                  className={`w-full border-b border-[#DAD1C5]/60 p-4 text-left transition-colors hover:bg-white/60 ${
                    selectedCustomerId === customerId ? 'bg-white/70' : ''
                  }`}
                >
                  <span className="block truncate text-sm font-medium text-[#28192A]">
                    {getCustomerName(customerId)}
                  </span>
                  <span className="mt-1 block truncate text-xs text-[#6B6166]">
                    {latestMessage.sender_role === 'admin' ? 'You: ' : ''}
                    {latestMessage.message}
                  </span>
                  <span className="mt-2 block text-[10px] text-[#6B6166]/70">
                    {formatMessageTime(latestMessage.created_at)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="flex min-h-[520px] flex-col md:col-span-2">
          {selectedConversation ? (
            <>
              <div className="border-b border-[#DAD1C5] px-5 py-4">
                <h3 className="font-serif text-lg text-[#28192A]">
                  {getCustomerName(selectedConversation.customerId)}
                </h3>
                <p className="text-[11px] text-[#6B6166]">Customer conversation</p>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {selectedMessages.map((message) => {
                  const isAdminMessage = message.sender_role === 'admin';
                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isAdminMessage ? 'items-end' : 'items-start'}`}
                    >
                      <span className="mb-1 px-1 text-[10px] uppercase tracking-wide text-[#6B6166]">
                        {isAdminMessage ? adminName : getCustomerName(message.user_id)}
                      </span>
                      <div
                        className={`max-w-[85%] whitespace-pre-wrap break-words px-4 py-3 text-sm ${
                          isAdminMessage
                            ? 'bg-[#28192A] text-[#FFFDF8]'
                            : 'border border-[#DAD1C5] bg-white/60 text-[#28192A]'
                        }`}
                      >
                        {message.message}
                      </div>
                      <time className="mt-1 px-1 text-[10px] text-[#6B6166]/70">
                        {formatMessageTime(message.created_at)}
                      </time>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendReply} className="flex gap-2 border-t border-[#DAD1C5] p-4">
                <input
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  aria-label="Reply to customer"
                  placeholder="Write a reply…"
                  className="min-w-0 flex-1 border border-[#DAD1C5] bg-white/60 px-3 py-2 text-sm text-[#28192A] outline-none focus:border-[#C9A25C]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="flex items-center gap-2 bg-[#28192A] px-4 py-2 text-xs font-medium uppercase tracking-wide text-[#FFFDF8] transition-colors hover:bg-[#3D2540] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? 'Sending' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-[#6B6166]">
              <MessageCircle className="mb-3 h-8 w-8 text-[#C9A25C]" />
              <p className="font-serif text-lg text-[#28192A]">Select a conversation</p>
              <p className="mt-1 text-xs">Customer messages will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
