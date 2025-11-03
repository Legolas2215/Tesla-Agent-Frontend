import { useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/api';
import { Message } from './Message';

interface MessageListProps {
  messages: ChatMessageType[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-accent/10 p-4">
                <div className="text-4xl">⚡</div>
              </div>
              <h2 className="text-xl font-semibold">Tesla 2024 Annual Report Assistant</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask me anything about Tesla's 2024 10-K filing
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <Message key={message.messageId || idx} message={message} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
