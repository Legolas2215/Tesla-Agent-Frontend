import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { ChatMessage, Citation, SSEDoneEvent, SSEErrorEvent, SSETokenEvent } from '@/types/api';
import { Button } from '@/components/ui/button';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { LogOut, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const MAX_MESSAGES = 50;

export default function Chat() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId] = useState(() => uuidv4());
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const stopStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
    };

    setMessages((prev) => [...prev.slice(-MAX_MESSAGES), userMessage]);

    // Create placeholder for assistant message
    const assistantMessageId = uuidv4();
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      messageId: assistantMessageId,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsStreaming(true);

    try {
      // Try streaming first
      const eventSource = apiClient.createStreamingChat(
        message,
        undefined,
        5,
        conversationId
      );

      eventSourceRef.current = eventSource;
      let accumulatedContent = '';

      eventSource.addEventListener('token', (event: MessageEvent) => {
        try {
          const data: SSETokenEvent = JSON.parse(event.data);
          accumulatedContent += data.token;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.messageId === assistantMessageId
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
        } catch (error) {
          console.error('Error parsing token event:', error);
        }
      });

      eventSource.addEventListener('done', (event: MessageEvent) => {
        try {
          const data: SSEDoneEvent = JSON.parse(event.data);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.messageId === assistantMessageId
                ? {
                    ...msg,
                    messageId: data.messageId,
                    citations: data.citations,
                  }
                : msg
            )
          );

          stopStreaming();
        } catch (error) {
          console.error('Error parsing done event:', error);
          stopStreaming();
        }
      });

      eventSource.addEventListener('error', (event: MessageEvent) => {
        try {
          const data: SSEErrorEvent = JSON.parse(event.data);
          toast.error(data.message || 'An error occurred');
        } catch (error) {
          // EventSource generic error
          if (eventSource.readyState === EventSource.CLOSED) {
            // Try fallback to non-streaming
            handleNonStreamingFallback(message, assistantMessageId);
          } else {
            toast.error('Connection error. Please try again.');
          }
        }
        stopStreaming();
      });

      eventSource.onerror = () => {
        // Connection failed, try non-streaming
        stopStreaming();
        handleNonStreamingFallback(message, assistantMessageId);
      };
    } catch (error: any) {
      stopStreaming();
      
      if (error.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.status === 401) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => handleLogout(), 2000);
      } else {
        toast.error('Failed to send message. Please try again.');
      }

      // Remove the placeholder assistant message
      setMessages((prev) => prev.filter((msg) => msg.messageId !== assistantMessageId));
    }
  };

  const handleNonStreamingFallback = async (
    message: string,
    assistantMessageId: string
  ) => {
    try {
      const response = await apiClient.chat({
        message,
        top_k: 5,
        conversation_id: conversationId,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === assistantMessageId
            ? {
                ...msg,
                content: response.answer,
                messageId: response.messageId,
                citations: response.citations,
              }
            : msg
        )
      );
    } catch (error: any) {
      if (error.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment.');
      } else if (error.status === 401) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => handleLogout(), 2000);
      } else {
        toast.error('Failed to get response. Please try again.');
      }

      // Remove the placeholder message
      setMessages((prev) => prev.filter((msg) => msg.messageId !== assistantMessageId));
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="glass border-b border-border p-4 shadow-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Tesla AI Assistant</h1>
              <p className="text-xs text-muted-foreground">2024 Annual Report</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        onStop={stopStreaming}
        disabled={isStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
}
