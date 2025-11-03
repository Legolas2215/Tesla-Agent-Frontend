import { ChatMessage } from '@/types/api';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  message: ChatMessage;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
            <Bot className="h-4 w-4 text-accent" />
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 transition-smooth ${
            isUser
              ? 'bg-accent text-accent-foreground'
              : 'glass'
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2">
            {message.citations.map((citation, idx) => (
              <div
                key={idx}
                className="glass rounded-lg px-3 py-1 text-xs text-muted-foreground"
              >
                <span className="font-medium">Page {citation.page_number}</span>
                {citation.section_name && (
                  <span className="ml-2 opacity-75">· {citation.section_name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <User className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
}
